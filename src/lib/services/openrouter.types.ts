import { z } from "zod";

// Model parameters validation
export const modelParamsSchema = z.object({
  temperature: z.number().min(0).max(1),
  maxTokens: z.number().positive().max(32000),
  topP: z.number().min(0).max(1),
});

// Configuration validation
export const configSchema = z.object({
  apiKey: z.string().min(1, "API key is required"),
  apiEndpoint: z.string().url("Invalid API endpoint URL"),
  defaultModel: z.string().min(1, "Default model is required"),
  modelParams: modelParamsSchema,
});

// Rate limit configuration validation
export const rateLimitConfigSchema = z.object({
  maxRequestsPerMinute: z.number().int().positive(),
  maxRequestsPerHour: z.number().int().positive(),
});

// Message validation
export const messageSchema = z.string().min(1, "Message cannot be empty").max(32000, "Message is too long");

// Response schema validation
export const responseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  data: z.object({
    content: z.string().optional(),
    model: z.string().optional(),
    usage: z
      .object({
        prompt_tokens: z.number().optional(),
        completion_tokens: z.number().optional(),
        total_tokens: z.number().optional(),
      })
      .optional(),
    error: z.string().optional(),
  }),
});

// Export inferred types
export type ConfigType = z.infer<typeof configSchema>;
export type RateLimitConfig = z.infer<typeof rateLimitConfigSchema>;
export type Response = z.infer<typeof responseSchema>;
export type ModelParams = z.infer<typeof modelParamsSchema>;
