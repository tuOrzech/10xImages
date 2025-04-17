import { z } from "zod";

// Model parameters validation
export const modelParamsSchema = z.object({
  temperature: z.number().min(0).max(1),
  maxTokens: z.number().positive().max(32000),
  topP: z.number().min(0).max(1),
});

// Message content validation for multimodal messages
export const messageContentSchema = z.union([
  z.string(),
  z.array(
    z.object({
      type: z.enum(["text", "image_url"]),
      text: z.string().optional(),
      image_url: z
        .object({
          url: z.string().url("Invalid image URL"),
          detail: z.enum(["low", "high"]).optional(),
        })
        .optional(),
    })
  ),
]);

// Message validation for both text and multimodal
export const messageSchema = z.union([
  z.string().min(1, "Message cannot be empty").max(32000, "Message is too long"),
  z.object({
    role: z.enum(["system", "user"]),
    content: messageContentSchema,
  }),
]);

// System prompt validation
export const systemPromptSchema = z.object({
  role: z.literal("system"),
  content: z.string().min(1),
  context: z.string().optional(),
});

// Configuration validation
export const configSchema = z.object({
  apiKey: z.string().min(1, "API key is required"),
  apiEndpoint: z.string().url("Invalid API endpoint URL"),
  defaultModel: z.string().min(1, "Default model is required"),
  modelParams: modelParamsSchema,
  systemPrompt: systemPromptSchema,
});

// Rate limit configuration validation
export const rateLimitConfigSchema = z.object({
  maxRequestsPerMinute: z.number().int().positive(),
  maxRequestsPerHour: z.number().int().positive(),
});

// Response schema validation
export const responseSchema = z.object({
  success: z.boolean(),
  message: z.string().optional(),
  data: z
    .object({
      id: z.string(),
      model: z.string(),
      choices: z.array(
        z.object({
          message: z.object({
            role: z.string(),
            content: z.string(),
          }),
        })
      ),
    })
    .optional(),
});

// Export inferred types
export type ConfigType = z.infer<typeof configSchema>;
export type RateLimitConfig = z.infer<typeof rateLimitConfigSchema>;
export type Response = z.infer<typeof responseSchema>;
export type ModelParams = z.infer<typeof modelParamsSchema>;
export type SystemPrompt = z.infer<typeof systemPromptSchema>;
export type MessageContent = z.infer<typeof messageContentSchema>;
