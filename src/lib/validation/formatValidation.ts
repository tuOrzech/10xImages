import type { OptimizationSettingsType } from "@/types";

export const SUPPORTED_FORMATS = ["webp", "jpeg", "png"] as const;
export type SupportedFormat = (typeof SUPPORTED_FORMATS)[number];

export const FORMAT_QUALITY_RANGES = {
  webp: { min: 0, max: 100, default: 85 },
  jpeg: { min: 0, max: 100, default: 85 },
  png: { min: 0, max: 9, default: 6 }, // PNG uses compression level 0-9
} as const;

export const FORMAT_FEATURES = {
  webp: {
    supportsTransparency: true,
    supportsAnimation: true,
    supportsLossless: true,
    recommendedFor: ["photos", "graphics", "animations"],
  },
  jpeg: {
    supportsTransparency: false,
    supportsAnimation: false,
    supportsLossless: false,
    recommendedFor: ["photos", "complex images"],
  },
  png: {
    supportsTransparency: true,
    supportsAnimation: false,
    supportsLossless: true,
    recommendedFor: ["graphics", "screenshots", "text"],
  },
} as const;

export function validateFormat(format: string): string | null {
  if (!SUPPORTED_FORMATS.includes(format as SupportedFormat)) {
    return `Unsupported format. Supported formats are: ${SUPPORTED_FORMATS.join(", ")}`;
  }
  return null;
}

export function validateQuality(format: SupportedFormat, quality: number): string | null {
  const range = FORMAT_QUALITY_RANGES[format];

  if (!Number.isInteger(quality)) {
    return "Quality must be an integer";
  }

  if (quality < range.min || quality > range.max) {
    return `Quality for ${format} must be between ${range.min} and ${range.max}`;
  }

  return null;
}

export function validateFormatSettings(settings: OptimizationSettingsType): string | null {
  const { format, quality } = settings;

  // Validate format
  const formatError = validateFormat(format);
  if (formatError) return formatError;

  // Validate quality
  const qualityError = validateQuality(format as SupportedFormat, quality);
  if (qualityError) return qualityError;

  return null;
}

export function getRecommendedQuality(format: SupportedFormat, imageType: "photo" | "graphic" | "text"): number {
  const range = FORMAT_QUALITY_RANGES[format];

  switch (imageType) {
    case "photo":
      return format === "png" ? range.default : 85;
    case "graphic":
      return format === "png" ? range.default : 90;
    case "text":
      return format === "png" ? range.default : 95;
    default:
      return range.default;
  }
}

export function isQualitySettingAvailable(format: string): boolean {
  return format === "webp" || format === "jpeg";
}

export function getFormatWarnings(format: SupportedFormat, settings: OptimizationSettingsType): string[] {
  const warnings: string[] = [];

  // High quality warnings
  if (format === "jpeg" && settings.quality > 90) {
    warnings.push("JPEG quality above 90% significantly increases file size with minimal visual improvement");
  }

  // Format-specific warnings
  if (format === "jpeg" && settings.metadataOptions.keepColorProfile) {
    warnings.push("Color profile preservation may significantly increase JPEG file size");
  }

  if (format === "png" && settings.quality === FORMAT_QUALITY_RANGES.png.max) {
    warnings.push("Maximum PNG compression level may significantly increase processing time");
  }

  return warnings;
}
