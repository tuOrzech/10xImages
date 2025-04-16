import type { ConfigType, RateLimitConfig as RateLimitConfigType, Response } from "./openrouter.types";
import { configSchema, messageSchema, rateLimitConfigSchema, responseSchema } from "./openrouter.types";

// OpenRouter specific error types
class OpenRouterError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly status?: number,
    public readonly details?: unknown
  ) {
    super(message);
    this.name = "OpenRouterError";
  }
}

class OpenRouterRateLimitError extends OpenRouterError {
  constructor(message: string, waitTime: number) {
    super(message, "RATE_LIMIT_EXCEEDED", 429, { waitTime });
    this.name = "OpenRouterRateLimitError";
  }
}

class OpenRouterAuthenticationError extends OpenRouterError {
  constructor(message = "Invalid API key") {
    super(message, "AUTHENTICATION_ERROR", 401);
    this.name = "OpenRouterAuthenticationError";
  }
}

class OpenRouterValidationError extends OpenRouterError {
  constructor(message: string) {
    super(message, "VALIDATION_ERROR", 400);
    this.name = "OpenRouterValidationError";
  }
}

interface MessagePayload {
  model: string;
  messages: { role: "system" | "user"; content: string }[];
  response_format: object;
  temperature: number;
  max_tokens: number;
  top_p: number;
}

interface ApiErrorResponse {
  status: number;
  data: {
    error?: {
      message?: string;
      type?: string;
    };
  };
}

// Logger interface for dependency injection
interface Logger {
  info(message: string, ...args: unknown[]): void;
  warn(message: string, ...args: unknown[]): void;
  error(message: string, ...args: unknown[]): void;
  debug(message: string, ...args: unknown[]): void;
}

// Default logger implementation
class DefaultLogger implements Logger {
  private _prefix = "[OpenRouter]";
  private _enableDebug: boolean;

  constructor(enableDebug = false) {
    this._enableDebug = enableDebug;
  }

  info(message: string, ...args: unknown[]): void {
    console.info(`${this._prefix} ${message}`, ...args);
  }

  warn(message: string, ...args: unknown[]): void {
    console.warn(`${this._prefix} ${message}`, ...args);
  }

  error(message: string, ...args: unknown[]): void {
    console.error(`${this._prefix} ${message}`, ...args);
  }

  debug(message: string, ...args: unknown[]): void {
    if (this._enableDebug) {
      console.debug(`${this._prefix} ${message}`, ...args);
    }
  }
}

export class OpenRouterService {
  // Public fields
  public config: ConfigType;
  public lastResponse: Response | null = null;

  // Private fields
  private readonly _apiEndpoint: string;
  private readonly _apiKey: string;
  private readonly _logger: Logger;
  private readonly _defaultSystemMessage: string;
  private readonly _responseFormat: object;
  private readonly _maxRetries = 3;
  private readonly _baseDelay = 1000; // 1 second
  private readonly _rateLimitConfig: RateLimitConfigType = {
    maxRequestsPerMinute: 60,
    maxRequestsPerHour: 3600,
  };

  private _rateLimitState = {
    minuteRequests: [] as { timestamp: number }[],
    hourRequests: [] as { timestamp: number }[],
    lastReset: {
      minute: Date.now(),
      hour: Date.now(),
    },
  };

  constructor(
    systemMessage = "You are a virtual assistant powered by OpenRouter.",
    config?: Partial<ConfigType>,
    rateLimitConfig?: Partial<RateLimitConfigType>,
    logger?: Logger
  ) {
    // Initialize configuration with defaults and environment variables
    const defaultConfig = {
      apiKey: process.env.OPENROUTER_API_KEY || "",
      apiEndpoint: process.env.OPENROUTER_API_ENDPOINT || "https://openrouter.ai/api/v1",
      defaultModel: process.env.OPENROUTER_DEFAULT_MODEL || "openrouter-llm",
      modelParams: {
        temperature: 0.7,
        maxTokens: 4096,
        topP: 1.0,
      },
    };

    // Merge and validate configuration
    this.config = configSchema.parse({
      ...defaultConfig,
      ...config,
    });

    // Initialize private fields
    this._apiEndpoint = this.config.apiEndpoint;
    this._apiKey = this.config.apiKey;
    this._logger = logger || new DefaultLogger(process.env.NODE_ENV === "development");
    this._defaultSystemMessage = systemMessage;
    this._responseFormat = {
      type: "json_schema",
      json_schema: {
        name: "ResponseSchema",
        strict: true,
        schema: {
          success: "boolean",
          data: "object",
          message: "string",
        },
      },
    };

    // Initialize rate limit config
    if (rateLimitConfig) {
      this._rateLimitConfig = rateLimitConfigSchema.parse({
        ...this._rateLimitConfig,
        ...rateLimitConfig,
      });
    }

    this._logger.info("Service initialized", {
      endpoint: this._apiEndpoint,
      model: this.config.defaultModel,
      rateLimits: this._rateLimitConfig,
    });
  }

  // Public method to update configuration
  public setConfig(config: Partial<ConfigType>): void {
    this.config = {
      ...this.config,
      ...config,
    };
    this._logger.info("Configuration updated");
  }

  // Public method to get last response
  public getLastResponse(): Response | null {
    return this.lastResponse;
  }

  private _handleApiError(error: unknown, response?: ApiErrorResponse): never {
    if (error instanceof OpenRouterError) {
      this._logger.error("API error occurred", {
        name: error.name,
        code: error.code,
        status: error.status,
        message: error.message,
        details: error.details,
      });
      throw error;
    }

    if (response) {
      const status = response.status;
      const errorData = response.data;
      const message = errorData?.error?.message || "Unknown API error";

      this._logger.error("API response error", {
        status,
        message,
        data: errorData,
      });

      switch (status) {
        case 401:
          throw new OpenRouterAuthenticationError(message);
        case 429:
          throw new OpenRouterRateLimitError(message, 60); // Default 60 seconds wait
        case 400:
          throw new OpenRouterValidationError(message);
        default:
          throw new OpenRouterError(message, "API_ERROR", status, errorData);
      }
    }

    if (error instanceof Error) {
      this._logger.error("Unknown error occurred", {
        name: error.name,
        message: error.message,
        stack: error.stack,
      });
      throw new OpenRouterError(error.message, "UNKNOWN_ERROR");
    }

    this._logger.error("Unknown error type", { error });
    throw new OpenRouterError("An unknown error occurred", "UNKNOWN_ERROR");
  }

  /**
   * Check and update rate limits
   * @throws Error if rate limit is exceeded
   */
  private _checkRateLimit(): void {
    const now = Date.now();
    const oneMinuteAgo = now - 60 * 1000;
    const oneHourAgo = now - 60 * 60 * 1000;

    this._logger.debug("Cleaning up old rate limit requests");

    // Clean up old requests
    this._rateLimitState.minuteRequests = this._rateLimitState.minuteRequests.filter(
      (req) => req.timestamp > oneMinuteAgo
    );
    this._rateLimitState.hourRequests = this._rateLimitState.hourRequests.filter((req) => req.timestamp > oneHourAgo);

    // Check limits
    if (this._rateLimitState.minuteRequests.length >= this._rateLimitConfig.maxRequestsPerMinute) {
      const oldestRequest = this._rateLimitState.minuteRequests[0];
      const waitTime = Math.ceil((oldestRequest.timestamp + 60 * 1000 - now) / 1000);
      this._logger.warn("Per-minute rate limit exceeded", { waitTime });
      throw new OpenRouterRateLimitError(
        `Rate limit exceeded. Please wait ${waitTime} seconds before trying again.`,
        waitTime
      );
    }

    if (this._rateLimitState.hourRequests.length >= this._rateLimitConfig.maxRequestsPerHour) {
      const oldestRequest = this._rateLimitState.hourRequests[0];
      const waitTime = Math.ceil((oldestRequest.timestamp + 60 * 60 * 1000 - now) / 1000);
      this._logger.warn("Hourly rate limit exceeded", { waitTime });
      throw new OpenRouterRateLimitError(
        `Hourly rate limit exceeded. Please wait ${Math.floor(waitTime / 60)} minutes and ${waitTime % 60} seconds before trying again.`,
        waitTime
      );
    }

    // Add new request
    const request = { timestamp: now };
    this._rateLimitState.minuteRequests.push(request);
    this._rateLimitState.hourRequests.push(request);

    this._logger.debug("Rate limit check passed", {
      minuteRequests: this._rateLimitState.minuteRequests.length,
      hourRequests: this._rateLimitState.hourRequests.length,
    });
  }

  /**
   * Get current rate limit status
   */
  public getRateLimitStatus(): {
    minuteRequestsRemaining: number;
    hourRequestsRemaining: number;
    resetTimes: { minute: number; hour: number };
  } {
    const now = Date.now();
    const oneMinuteAgo = now - 60 * 1000;
    const oneHourAgo = now - 60 * 60 * 1000;

    this._logger.debug("Cleaning up old rate limit requests");

    // Clean up old requests first
    this._rateLimitState.minuteRequests = this._rateLimitState.minuteRequests.filter(
      (req) => req.timestamp > oneMinuteAgo
    );
    this._rateLimitState.hourRequests = this._rateLimitState.hourRequests.filter((req) => req.timestamp > oneHourAgo);

    const status = {
      minuteRequestsRemaining: this._rateLimitConfig.maxRequestsPerMinute - this._rateLimitState.minuteRequests.length,
      hourRequestsRemaining: this._rateLimitConfig.maxRequestsPerHour - this._rateLimitState.hourRequests.length,
      resetTimes: {
        minute: this._rateLimitState.minuteRequests[0]?.timestamp
          ? this._rateLimitState.minuteRequests[0].timestamp + 60 * 1000
          : now,
        hour: this._rateLimitState.hourRequests[0]?.timestamp
          ? this._rateLimitState.hourRequests[0].timestamp + 60 * 60 * 1000
          : now,
      },
    };

    this._logger.debug("Current rate limit status", status);
    return status;
  }

  /**
   * Send a request to OpenRouter API
   */
  public async sendRequest(message: string): Promise<Response> {
    try {
      this._logger.debug("Validating input message");
      const validatedMessage = messageSchema.parse(message);

      this._logger.debug("Checking rate limits");
      this._checkRateLimit();

      this._logger.debug("Preparing request payload");
      const payload = this._preparePayload(validatedMessage);

      this._logger.info("Sending request to OpenRouter API", {
        model: payload.model,
        messageLength: validatedMessage.length,
      });

      const response = await this._sendRequestWithRetry(payload);

      this._logger.debug("Validating API response");
      const validatedResponse = responseSchema.parse(response);
      this.lastResponse = validatedResponse;

      this._logger.info("Request completed successfully", {
        model: response.data.model,
        usage: response.data.usage,
      });

      return validatedResponse;
    } catch (error) {
      const errorResponse: Response = {
        success: false,
        data: error instanceof Error ? { error: error.message } : { error: "Unknown error occurred" },
        message: error instanceof Error ? error.message : "Unknown error occurred",
      };
      this.lastResponse = errorResponse;

      // Error is already logged in _handleApiError
      if (!(error instanceof OpenRouterError)) {
        this._logger.error("Error sending request:", error);
      }

      throw error;
    }
  }

  /**
   * Prepare payload for API request
   */
  private _preparePayload(message: string): MessagePayload {
    const payload: MessagePayload = {
      model: this.config.defaultModel,
      messages: [
        { role: "system" as const, content: this._defaultSystemMessage },
        { role: "user" as const, content: message },
      ],
      response_format: this._responseFormat,
      temperature: this.config.modelParams.temperature,
      max_tokens: this.config.modelParams.maxTokens,
      top_p: this.config.modelParams.topP,
    };

    this._logger.debug("Prepared request payload", {
      model: payload.model,
      temperature: payload.temperature,
      max_tokens: payload.max_tokens,
    });

    return payload;
  }

  /**
   * Send request to OpenRouter API with retry logic
   */
  private async _sendRequestWithRetry(payload: MessagePayload, retryCount = 0): Promise<Response> {
    try {
      this._logger.debug("Sending request to API", {
        attempt: retryCount + 1,
        maxRetries: this._maxRetries,
      });

      const response = await fetch(`${this._apiEndpoint}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this._apiKey}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        this._handleApiError(null, { status: response.status, data: errorData });
      }

      const data = await response.json();
      return {
        success: true,
        data: {
          content: data.choices[0].message.content,
          model: data.model,
          usage: data.usage,
        },
        message: "Request successful",
      };
    } catch (error) {
      if (retryCount < this._maxRetries && this._shouldRetry(error)) {
        const delay = this._calculateRetryDelay(retryCount);
        this._logger.warn("Request failed, will retry", {
          error,
          retryCount,
          nextAttemptIn: Math.round(delay),
        });

        await new Promise((resolve) => setTimeout(resolve, delay));
        return this._sendRequestWithRetry(payload, retryCount + 1);
      }
      throw this._handleApiError(error);
    }
  }

  private _shouldRetry(error: unknown): boolean {
    if (error instanceof OpenRouterError) {
      const shouldRetry = !["AUTHENTICATION_ERROR", "VALIDATION_ERROR"].includes(error.code);
      this._logger.debug("Checking if error is retryable", {
        errorCode: error.code,
        shouldRetry,
      });
      return shouldRetry;
    }
    return true;
  }

  private _calculateRetryDelay(retryCount: number): number {
    const delay = this._baseDelay * Math.pow(2, retryCount) * (0.5 + Math.random());
    this._logger.debug("Calculated retry delay", {
      retryCount,
      delay: Math.round(delay),
    });
    return delay;
  }
}
