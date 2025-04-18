import { supabase } from "@/db/client";
import type { ImageMetadataType, OptimizationSettingsType, SharpPreserveMetadataOptions } from "@/types";
import sharp, { type WriteableMetadata } from "sharp";

interface OptimizationResult {
  url: string;
  metadata: ImageMetadataType;
}

/**
 * Optymalizuje obraz zgodnie z podanymi ustawieniami
 */
export async function optimizeImage(
  jobId: string,
  settings: OptimizationSettingsType,
  userId: string
): Promise<OptimizationResult> {
  // Pobierz oryginalne zadanie
  const { data: job, error: jobError } = await supabase
    .from("optimization_jobs")
    .select("*")
    .eq("id", jobId)
    .eq("user_id", userId)
    .single();

  if (jobError || !job) {
    throw new Error("Job not found or access denied");
  }

  // Pobierz oryginalny plik
  const { data: fileData, error: fileError } = await supabase.storage.from("images").download(job.storage_path);

  if (fileError || !fileData) {
    throw new Error("Original file not found");
  }

  // Przygotuj instancję sharp z oryginalnym obrazem
  let imageProcessor = sharp(await fileData.arrayBuffer());

  // Zastosuj ustawienia wymiarów
  if (settings.dimensions.width || settings.dimensions.height) {
    imageProcessor = imageProcessor.resize({
      width: settings.dimensions.width || undefined,
      height: settings.dimensions.height || undefined,
      fit: settings.dimensions.maintainAspectRatio ? "inside" : "fill",
    });
  }

  // Zastosuj ustawienia formatu i jakości
  switch (settings.format.toLowerCase()) {
    case "jpeg":
    case "jpg":
      imageProcessor = imageProcessor.jpeg({ quality: settings.quality });
      break;
    case "webp":
      imageProcessor = imageProcessor.webp({ quality: settings.quality });
      break;
    case "png":
      imageProcessor = imageProcessor.png({
        compressionLevel: settings.compressionOptions.level,
      });
      break;
    default:
      throw new Error(`Unsupported format: ${settings.format}`);
  }

  let shouldCallWithMetadata = false;
  // Użyj typu sharp.MetadataOptions dla obiektu opcji
  const optionsForWithMetadata: SharpPreserveMetadataOptions = {};

  if (settings.metadataOptions.keepExif) {
    optionsForWithMetadata.exif = {}; // Pusty obiekt zachowuje EXIF
    shouldCallWithMetadata = true;
  }
  if (settings.metadataOptions.keepColorProfile) {
    optionsForWithMetadata.icc = true; // `true` zachowuje ICC
    shouldCallWithMetadata = true;
  }
  if (settings.metadataOptions.keepIptc) {
    optionsForWithMetadata.iptc = true; // `true` zachowuje IPTC
    shouldCallWithMetadata = true;
  }
  if (settings.metadataOptions.keepXmp) {
    optionsForWithMetadata.xmp = true; // `true` zachowuje XMP
    shouldCallWithMetadata = true;
  }

  // Wywołaj .withMetadata() tylko jeśli jest coś do zachowania
  if (shouldCallWithMetadata) {
    imageProcessor = imageProcessor.withMetadata(optionsForWithMetadata as WriteableMetadata);
  }

  // Przetwórz obraz
  const optimizedBuffer = await imageProcessor.toBuffer();

  // Zapisz zoptymalizowany obraz
  const optimizedPath = `${job.storage_path.replace(/\.[^/.]+$/, "")}_optimized.${settings.format}`;
  const { error: uploadError } = await supabase.storage.from("images").upload(optimizedPath, optimizedBuffer, {
    contentType: `image/${settings.format}`,
  });

  if (uploadError) {
    throw new Error("Failed to upload optimized image");
  }

  // Pobierz URL zoptymalizowanego obrazu
  const {
    data: { publicUrl },
  } = supabase.storage.from("images").getPublicUrl(optimizedPath);

  // Pobierz metadane zoptymalizowanego obrazu
  const outputMetadata = await sharp(optimizedBuffer).metadata();

  return {
    url: publicUrl,
    metadata: {
      width: outputMetadata.width || 0,
      height: outputMetadata.height || 0,
      format: outputMetadata.format || settings.format,
      size: optimizedBuffer.length,
      hasExif: !!outputMetadata.exif?.length,
      hasIptc: !!outputMetadata.iptc?.length,
      hasXmp: !!outputMetadata.xmp?.length,
      hasColorProfile: !!outputMetadata.icc?.length,
    },
  };
}
