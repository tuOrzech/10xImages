import { describe, expect, it } from "vitest";
import {
  configSchema,
  messageContentSchema,
  messageSchema,
  modelParamsSchema,
  rateLimitConfigSchema,
  responseSchema,
  systemPromptSchema,
} from "../../../src/lib/services/openrouter.types";

describe("OpenRouter Types Validation", () => {
  describe("modelParamsSchema", () => {
    it("should validate correct model parameters", () => {
      const validParams = {
        temperature: 0.7,
        maxTokens: 1000,
        topP: 0.9,
      };
      expect(modelParamsSchema.parse(validParams)).toEqual(validParams);
    });

    it("should reject temperature outside 0-1 range", () => {
      expect(() => modelParamsSchema.parse({ temperature: 1.5, maxTokens: 1000, topP: 0.9 })).toThrow();
      expect(() => modelParamsSchema.parse({ temperature: -0.5, maxTokens: 1000, topP: 0.9 })).toThrow();
    });

    it("should reject invalid maxTokens", () => {
      expect(() => modelParamsSchema.parse({ temperature: 0.7, maxTokens: 0, topP: 0.9 })).toThrow();
      expect(() => modelParamsSchema.parse({ temperature: 0.7, maxTokens: 33000, topP: 0.9 })).toThrow();
    });

    it("should reject invalid topP", () => {
      expect(() => modelParamsSchema.parse({ temperature: 0.7, maxTokens: 1000, topP: 1.5 })).toThrow();
      expect(() => modelParamsSchema.parse({ temperature: 0.7, maxTokens: 1000, topP: -0.1 })).toThrow();
    });
  });

  describe("messageContentSchema", () => {
    it("should validate string content", () => {
      const content = "Hello, world!";
      expect(messageContentSchema.parse(content)).toBe(content);
    });

    it("should validate multimodal content with text", () => {
      const content = [
        {
          type: "text",
          text: "Hello, world!",
        },
      ];
      expect(messageContentSchema.parse(content)).toEqual(content);
    });

    it("should validate multimodal content with image", () => {
      const content = [
        {
          type: "image_url",
          image_url: {
            url: "https://example.com/image.jpg",
            detail: "high",
          },
        },
      ];
      expect(messageContentSchema.parse(content)).toEqual(content);
    });

    it("should reject invalid image URLs", () => {
      expect(() =>
        messageContentSchema.parse([
          {
            type: "image_url",
            image_url: {
              url: "not-a-url",
              detail: "high",
            },
          },
        ])
      ).toThrow();
    });

    it("should reject invalid detail values", () => {
      expect(() =>
        messageContentSchema.parse([
          {
            type: "image_url",
            image_url: {
              url: "https://example.com/image.jpg",
              detail: "medium",
            },
          },
        ])
      ).toThrow();
    });
  });

  describe("messageSchema", () => {
    it("should validate string messages", () => {
      const message = "Hello, world!";
      expect(messageSchema.parse(message)).toBe(message);
    });

    it("should reject empty messages", () => {
      expect(() => messageSchema.parse("")).toThrow();
    });

    it("should validate structured messages", () => {
      const message = {
        role: "user",
        content: "Hello, world!",
      };
      expect(messageSchema.parse(message)).toEqual(message);
    });

    it("should reject invalid roles", () => {
      expect(() =>
        messageSchema.parse({
          role: "invalid",
          content: "Hello",
        })
      ).toThrow();
    });
  });

  describe("systemPromptSchema", () => {
    it("should validate correct system prompts", () => {
      const prompt = {
        role: "system",
        content: "You are a helpful assistant",
        context: "Some context",
      };
      expect(systemPromptSchema.parse(prompt)).toEqual(prompt);
    });

    it("should validate system prompts without context", () => {
      const prompt = {
        role: "system",
        content: "You are a helpful assistant",
      };
      expect(systemPromptSchema.parse(prompt)).toEqual(prompt);
    });

    it("should reject empty content", () => {
      expect(() =>
        systemPromptSchema.parse({
          role: "system",
          content: "",
        })
      ).toThrow();
    });

    it("should reject invalid roles", () => {
      expect(() =>
        systemPromptSchema.parse({
          role: "user",
          content: "Content",
        })
      ).toThrow();
    });
  });

  describe("configSchema", () => {
    const validConfig = {
      apiKey: "test-key",
      apiEndpoint: "https://api.example.com",
      defaultModel: "gpt-4",
      modelParams: {
        temperature: 0.7,
        maxTokens: 1000,
        topP: 0.9,
      },
      systemPrompt: {
        role: "system",
        content: "You are a helpful assistant",
      },
    };

    it("should validate correct config", () => {
      expect(configSchema.parse(validConfig)).toEqual(validConfig);
    });

    it("should reject missing API key", () => {
      const invalidConfig = { ...validConfig, apiKey: "" };
      expect(() => configSchema.parse(invalidConfig)).toThrow();
    });

    it("should reject invalid API endpoint", () => {
      const invalidConfig = { ...validConfig, apiEndpoint: "not-a-url" };
      expect(() => configSchema.parse(invalidConfig)).toThrow();
    });

    it("should reject missing default model", () => {
      const invalidConfig = { ...validConfig, defaultModel: "" };
      expect(() => configSchema.parse(invalidConfig)).toThrow();
    });
  });

  describe("rateLimitConfigSchema", () => {
    it("should validate correct rate limit config", () => {
      const config = {
        maxRequestsPerMinute: 60,
        maxRequestsPerHour: 1000,
      };
      expect(rateLimitConfigSchema.parse(config)).toEqual(config);
    });

    it("should reject non-positive values", () => {
      expect(() =>
        rateLimitConfigSchema.parse({
          maxRequestsPerMinute: 0,
          maxRequestsPerHour: 1000,
        })
      ).toThrow();
      expect(() =>
        rateLimitConfigSchema.parse({
          maxRequestsPerMinute: 60,
          maxRequestsPerHour: -1,
        })
      ).toThrow();
    });

    it("should reject non-integer values", () => {
      expect(() =>
        rateLimitConfigSchema.parse({
          maxRequestsPerMinute: 60.5,
          maxRequestsPerHour: 1000,
        })
      ).toThrow();
    });
  });

  describe("responseSchema", () => {
    it("should validate successful response", () => {
      const response = {
        success: true,
        data: {
          id: "response-id",
          model: "gpt-4",
          choices: [
            {
              message: {
                role: "assistant",
                content: "Hello!",
              },
            },
          ],
        },
      };
      expect(responseSchema.parse(response)).toEqual(response);
    });

    it("should validate error response", () => {
      const response = {
        success: false,
        message: "Error occurred",
      };
      expect(responseSchema.parse(response)).toEqual(response);
    });

    it("should validate response without optional fields", () => {
      const response = {
        success: true,
      };
      expect(responseSchema.parse(response)).toEqual(response);
    });
  });
});
