import type { APIRoute } from "astro";
import { z } from "zod";

export const prerender = false;

// Schema for validating form data
const createOptimizationJobSchema = z.object({
  original_filename: z.string(),
  user_context_subject: z.string().optional(),
  user_context_keywords: z
    .string()
    .transform((str) => {
      try {
        const parsed = JSON.parse(str);
        return z.array(z.string()).parse(parsed);
      } catch {
        return [];
      }
    })
    .optional(),
});

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const formData = await request.formData();

    // Get and validate file
    const file = formData.get("image") as File;
    if (!file || !(file instanceof File)) {
      return new Response(JSON.stringify({ message: "No file uploaded" }), { status: 400 });
    }

    // Validate file type
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      return new Response(JSON.stringify({ message: "Invalid file type. Only JPG, PNG and WebP are allowed" }), {
        status: 400,
      });
    }

    // Validate file size (10MB)
    if (file.size > 10 * 1024 * 1024) {
      return new Response(JSON.stringify({ message: "File too large. Maximum size is 10MB" }), { status: 400 });
    }

    // Extract and validate other form data
    const formDataObj = Object.fromEntries(formData.entries());
    const validatedData = createOptimizationJobSchema.parse(formDataObj);

    // Generate unique file hash (you might want to use a more robust method)
    const fileHash = crypto.randomUUID();

    // Upload file to Supabase Storage
    const { error: uploadError } = await locals.supabase.storage.from("images").upload(fileHash, file);

    if (uploadError) {
      console.error("Error uploading file:", uploadError);
      return new Response(JSON.stringify({ message: "Failed to upload file" }), { status: 500 });
    }

    // Create optimization job record
    const { data: job, error: insertError } = await locals.supabase
      .from("optimization_jobs")
      .insert({
        user_id: locals.user?.id || "anonymous",
        original_filename: validatedData.original_filename,
        file_hash: fileHash,
        user_context_subject: validatedData.user_context_subject,
        user_context_keywords: validatedData.user_context_keywords,
        status: "pending",
      })
      .select()
      .single();

    if (insertError) {
      console.error("Error creating optimization job:", insertError);
      // Try to clean up the uploaded file
      await locals.supabase.storage.from("images").remove([fileHash]);
      return new Response(JSON.stringify({ message: "Failed to create optimization job" }), { status: 500 });
    }

    return new Response(JSON.stringify(job), { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new Response(
        JSON.stringify({
          message: "Validation error",
          details: error.errors,
        }),
        { status: 400 }
      );
    }

    console.error("Error processing upload:", error);
    return new Response(JSON.stringify({ message: "Internal server error" }), { status: 500 });
  }
};
