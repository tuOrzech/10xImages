import { beforeEach, describe, expect, it, vi } from "vitest";
import { OpenRouterService } from "../../../src/lib/services/openrouter.service";
import type { ConfigType, RateLimitConfig, SystemPrompt } from "../../../src/lib/services/openrouter.types";

// Mock fetch globally
const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);

// Mock console methods for logger
const mockConsole = {
  info: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
  debug: vi.fn(),
};

vi.spyOn(console, "info").mockImplementation(mockConsole.info);
vi.spyOn(console, "warn").mockImplementation(mockConsole.warn);
vi.spyOn(console, "error").mockImplementation(mockConsole.error);
vi.spyOn(console, "debug").mockImplementation(mockConsole.debug);

describe("OpenRouterService", () => {
  let service: OpenRouterService;
  const defaultConfig: ConfigType = {
    apiKey: "test-api-key",
    apiEndpoint: "https://test-api.example.com",
    defaultModel: "test-model",
    modelParams: {
      temperature: 0.7,
      maxTokens: 1000,
      topP: 1.0,
    },
    systemPrompt: {
      role: "system",
      content: "Test system prompt",
    },
  };

  beforeEach(() => {
    service = new OpenRouterService(defaultConfig);
    mockFetch.mockReset();
    vi.clearAllMocks();
  });

  describe("Configuration", () => {
    it("should initialize with default config", () => {
      expect(service.config).toEqual(defaultConfig);
    });

    it("should update config via setConfig", () => {
      const newConfig = {
        apiKey: "new-api-key",
        modelParams: {
          temperature: 0.5,
          maxTokens: 2000,
          topP: 0.9,
        },
      };

      service.setConfig(newConfig);
      expect(service.config.apiKey).toBe("new-api-key");
      expect(service.config.modelParams).toEqual(newConfig.modelParams);
      expect(service.config.defaultModel).toBe(defaultConfig.defaultModel);
    });

    it("should update system prompt", () => {
      const newSystemPrompt: SystemPrompt = {
        role: "system",
        content: "New system prompt",
      };

      service.setSystemPrompt(newSystemPrompt);
      expect(service.config.systemPrompt).toEqual(newSystemPrompt);
    });
  });

  describe("Rate Limiting", () => {
    it("should track request rate limits", () => {
      const rateLimitConfig: RateLimitConfig = {
        maxRequestsPerMinute: 2,
        maxRequestsPerHour: 5,
      };

      service = new OpenRouterService(defaultConfig, rateLimitConfig);
      const status = service.getRateLimitStatus();

      expect(status.minuteRequestsRemaining).toBe(2);
      expect(status.hourRequestsRemaining).toBe(5);
    });

    it("should handle rate limit errors", async () => {
      const rateLimitConfig: RateLimitConfig = {
        maxRequestsPerMinute: 1,
        maxRequestsPerHour: 10,
      };

      service = new OpenRouterService(defaultConfig, rateLimitConfig);

      // Mock first request success
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () =>
          Promise.resolve({
            id: "test-id",
            model: "test-model",
            choices: [
              {
                message: {
                  role: "assistant",
                  content: "Test response",
                },
              },
            ],
          }),
      });

      // Mock second request with rate limit error
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 429,
        json: () =>
          Promise.resolve({
            error: {
              code: 429,
              message: "Rate limit exceeded. Add 10 credits to unlock",
            },
          }),
      });

      // First request should succeed
      await service.sendRequest("Test message", "test-image.jpg");

      // Second request should fail with rate limit message
      const result = await service.sendRequest("Test message 2", "test-image.jpg");
      expect(result.success).toBe(false);
      expect(result.message).toBe("Rate limit exceeded. Add 10 credits to unlock");
    });
  });

  describe("Request Handling", () => {
    it("should send request successfully", async () => {
      const mockResponse = {
        id: "test-id",
        model: "test-model",
        choices: [
          {
            message: {
              role: "assistant",
              content: "Test response",
            },
          },
        ],
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await service.sendRequest("Test message", "test-image.jpg");
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockResponse);
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    it("should handle API errors", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: () =>
          Promise.resolve({
            error: {
              message: "Invalid API key",
              type: "authentication_error",
            },
          }),
      });

      const result = await service.sendRequest("Test message", "test-image.jpg");
      expect(result.success).toBe(false);
      expect(result.message).toBe("Invalid API key");
    });

    it("should handle network errors", async () => {
      mockFetch.mockRejectedValueOnce(new Error("Network error"));

      const result = await service.sendRequest("Test message", "test-image.jpg");
      expect(result.success).toBe(false);
      expect(result.message).toBe("Network error");
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    it("should handle malformed responses", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () =>
          Promise.resolve({
            id: "test-id",
            model: "test-model",
            // Missing choices array
          }),
      });

      const result = await service.sendRequest("Test message", "test-image.jpg");
      expect(result.success).toBe(false);
      expect(result.message).toBe("Invalid response format from API");
    });
  });

  describe("Response Handling", () => {
    it("should store and retrieve last response", async () => {
      const mockResponse = {
        id: "test-id",
        model: "test-model",
        choices: [
          {
            message: {
              role: "assistant",
              content: "Test response",
            },
          },
        ],
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await service.sendRequest("Test message", "test-image.jpg");
      expect(result.success).toBe(true);

      service.lastResponse = result;
      const lastResponse = service.getLastResponse();
      expect(lastResponse).toEqual(result);
    });
  });
});
