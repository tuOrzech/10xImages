import type { ConfigType, RateLimitConfig as RateLimitConfigType, Response, SystemPrompt } from "./openrouter.types";
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

export class OpenRouterRateLimitError extends OpenRouterError {
  constructor(message: string, waitTime: number) {
    const userMessage = "Przekroczono dzienny limit zapytań. Spróbuj ponownie jutro lub dodaj kredyty do konta.";
    super(userMessage, "RATE_LIMIT_EXCEEDED", 429, { waitTime });
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

interface MessageContent {
  type: "text" | "image_url";
  text?: string;
  image_url?: {
    url: string;
    detail?: "low" | "high";
  };
}

interface Message {
  role: "system" | "user";
  content: string | MessageContent[];
}

interface MessagePayload {
  model: string;
  messages: Message[];
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
  public config!: ConfigType;
  public lastResponse: Response | null = null;

  // Private fields
  private readonly _apiEndpoint!: string;
  private readonly _apiKey!: string;
  private readonly _logger!: Logger;
  private readonly _responseFormat!: object;
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

  constructor(config?: Partial<ConfigType>, rateLimitConfig?: Partial<RateLimitConfigType>, logger?: Logger) {
    // Initialize configuration with defaults and environment variables
    const defaultConfig = {
      apiKey: import.meta.env.OPENROUTER_API_KEY || "",
      apiEndpoint: import.meta.env.OPENROUTER_API_ENDPOINT || "https://openrouter.ai/api/v1",
      defaultModel: import.meta.env.OPENROUTER_DEFAULT_MODEL || "qwen/qwen2.5-vl-72b-instruct:free",
      modelParams: {
        temperature: 0.7,
        maxTokens: 4096,
        topP: 1.0,
      },
      systemPrompt: {
        role: "system" as const,
        content: `Jesteś ekspertem w tworzeniu opisów obrazów zgodnych z WCAG 2.1, nowoczesnym SEO oraz zasadami UX/UI.
Twoim zadaniem jest wygenerowanie DWÓCH rzeczy dla załączonego obrazu, W JĘZYKU POLSKIM:

1. **Tekst Alternatywny (alt):**
   - Stosuj podejście storytellingowe - zacznij od najważniejszego elementu obrazu
   - Maksymalnie 125 znaków, zakończone kropką
   - Opisz:
     * Główny podmiot i jego najważniejszą akcję/stan
     * Kluczowy kontekst emocjonalny lub artystyczny (nastrój, atmosfera)
     * Istotne elementy otoczenia wpływające na przekaz
   - Zasady:
     * Używaj dynamicznych czasowników opisujących akcję
     * Dodaj kropkę na końcu (pomaga czytelnikom ekranowym)
     * Pisz naturalnym językiem, który dobrze brzmi gdy jest czytany na głos
     * Zachowuj poprawną gramatykę (szczególnie miejscownik)
   - Unikaj:
     * Rozpoczynania od "zdjęcie przedstawia", "obraz pokazuje" itp.
     * Powtarzania tekstu z otoczenia obrazu
     * Zbędnych szczegółów niezwiązanych z głównym przekazem
     * Łamania tekstu na wiele linii
     * Nadmiernego upychania słów kluczowych SEO

2. **Nazwa Pliku:**
   - Format: [artysta]-[kluczowy-element]-[kontekst]-[miejsce]-[rok].webp
   - Zasady:
     * 3-5 krótkich słów kluczowych (nie licząc artysty/miejsca/roku)
     * Tylko małe litery, bez polskich znaków
     * Tylko polskie słowa (z wyjątkiem nazw własnych)
     * Używaj myślników między słowami
     * Preferuj rzeczowniki i przymiotniki w podstawowej formie
   - Maksymalna długość: 80 znaków
   - Każda nazwa MUSI być unikalna

ZABRONIONE słowa w nazwach plików:
- spieva → spiew
- siluet → sylwetka
- dance → taniec
- light → swiatlo
- scene → scena
- performance → wystep

PRZYKŁADY:

Przykład koncertu:
Alt: Artystka w czarnej sukni wykonuje dramatyczny gest, otoczona czerwonymi światłami i kłębami dymu na scenie.
Nazwa: madonna-czarna-suknia-dym-czerwone-swiatla-warszawa-2024.webp

Przykład detalu:
Alt: Dłonie artysty pewnie uderzają w klawisze fortepianu, oświetlone ciepłym światłem reflektorów.
Nazwa: zimerman-dlonie-fortepian-reflektory-krakow-2024.webp

Format odpowiedzi:
Alt: [Jedno zdanie tekstu alternatywnego zakończone kropką]
Nazwa: [unikalna-nazwa-pliku-webp]

PAMIĘTAJ:
- Priorytetyzuj najważniejszą informację na początku opisu
- Uwzględniaj kontekst emocjonalny i artystyczny
- Używaj naturalnego języka, który dobrze brzmi gdy jest czytany na głos
- Zachowuj spójność między opisem a kontekstem użycia obrazu
- Twórz unikalne opisy, nawet dla podobnych zdjęć
- Kończ opisy kropką dla lepszej czytelności przez czytniki ekranowe`,
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

  public setSystemPrompt(systemPrompt: SystemPrompt): void {
    this.config = configSchema.parse({
      ...this.config,
      systemPrompt,
    });
    this._logger.info("System prompt updated");
  }

  private _preparePayload(message: Message): MessagePayload {
    const messages: Message[] = [
      {
        role: "system",
        content: this.config.systemPrompt.content,
      },
      message,
    ];

    const payload: MessagePayload = {
      model: this.config.defaultModel,
      messages,
      response_format: {
        type: "text",
      },
      temperature: this.config.modelParams.temperature,
      max_tokens: this.config.modelParams.maxTokens,
      top_p: this.config.modelParams.topP,
    };

    this._logger.debug("Prepared request payload", {
      model: payload.model,
      temperature: payload.temperature,
      max_tokens: payload.max_tokens,
      messages: payload.messages,
    });

    return payload;
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
  public async sendRequest(message: string, imageUrl?: string): Promise<Response> {
    try {
      this._logger.info("Starting new request to OpenRouter", {
        hasImage: !!imageUrl,
        messageLength: message.length,
      });

      this._logger.debug("Validating input message and preparing payload");

      // Validate the input message
      messageSchema.parse(message);

      // Prepare message content based on whether we have an image
      const messageContent = imageUrl
        ? [
            {
              type: "image_url" as const,
              image_url: {
                url: imageUrl,
                detail: "high" as const,
              },
            },
            {
              type: "text" as const,
              text: message,
            },
          ]
        : message;

      // Create the user message
      const userMessage: Message = {
        role: "user",
        content: messageContent,
      };

      this._logger.info("Checking rate limits...");
      this._checkRateLimit();
      const rateLimitStatus = this.getRateLimitStatus();
      this._logger.info("Rate limit status", {
        minuteRequestsRemaining: rateLimitStatus.minuteRequestsRemaining,
        hourRequestsRemaining: rateLimitStatus.hourRequestsRemaining,
      });

      this._logger.debug("Preparing request payload");
      const payload = this._preparePayload(userMessage);

      this._logger.info("Sending request to OpenRouter API", {
        model: payload.model,
        hasImage: !!imageUrl,
        imageUrl: imageUrl ? `${imageUrl.substring(0, 50)}...` : undefined,
      });

      const response = await this._sendRequestWithRetry(payload);

      this._logger.debug("Validating API response");
      const validatedResponse = responseSchema.parse(response);
      this.lastResponse = validatedResponse;

      this._logger.info("Request completed successfully", {
        model: response.data.model,
        usage: response.data.usage,
        contentLength: response.data.content?.length ?? 0,
      });

      return validatedResponse;
    } catch (error) {
      this._logger.error("Failed to process request", {
        error: error instanceof Error ? error.message : "Unknown error",
        name: error instanceof Error ? error.name : undefined,
        stack: error instanceof Error ? error.stack : undefined,
      });

      // Dodaj dodatkowy log dla błędu rate limit
      if (error instanceof OpenRouterRateLimitError) {
        console.error("[OpenRouter] Rate Limit Error:", error.message);
      }

      const errorResponse: Response = {
        success: false,
        data: error instanceof Error ? { error: error.message } : { error: "Unknown error occurred" },
        message: error instanceof Error ? error.message : "Unknown error occurred",
      };
      this.lastResponse = errorResponse;

      throw error;
    }
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
          "HTTP-Referer": "https://github.com/tuorzech/altimgoptimizer",
          "X-Title": "AltImgOptimizer",
          Authorization: `Bearer ${this._apiKey}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      this._logger.debug("Received API response", {
        status: response.status,
        data: data,
        headers: Object.fromEntries(response.headers.entries()),
      });

      // Sprawdź najpierw czy w odpowiedzi nie ma błędu rate limit
      if (data.error?.code === 429 || response.status === 429) {
        const errorMessage = data.error?.message || "Dzienny limit zapytań został wykorzystany.";
        this._logger.error("Rate limit exceeded", {
          details: data.error,
          message: errorMessage,
          status: response.status,
          errorCode: data.error?.code,
        });

        // Wyciągnij informację o kredytach jeśli jest w wiadomości
        const creditsInfo = errorMessage.match(/Add (\d+) credits to unlock/);
        const creditsNeeded = creditsInfo ? creditsInfo[1] : "10";

        const userMessage = `Przekroczono dzienny limit zapytań. Dodaj ${creditsNeeded} kredytów aby odblokować limit.`;
        console.error("[OpenRouter] Rate Limit Error:", userMessage);
        console.error("[OpenRouter] Original response:", {
          status: response.status,
          errorCode: data.error?.code,
          errorMessage: data.error?.message,
        });

        const error = new OpenRouterRateLimitError(userMessage, 86400); // 24h
        console.error("[OpenRouter] Created error object:", {
          name: error.name,
          message: error.message,
          code: error.code,
          status: error.status,
        });

        throw error;
      }

      // Sprawdź inne błędy API
      if (data.error || !response.ok) {
        this._logger.error("API error occurred", {
          status: response.status,
          error: data.error,
        });
        throw new OpenRouterError(
          data.error?.message || "Unknown API error",
          data.error?.code?.toString() || "API_ERROR",
          response.status,
          data.error
        );
      }

      // Sprawdź czy mamy poprawną odpowiedź
      if (!data.choices?.[0]?.message?.content) {
        this._logger.error("Invalid API response format", { data });
        throw new Error(`Invalid response format from OpenRouter API. Response: ${JSON.stringify(data)}`);
      }

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
    // Nigdy nie ponawiaj przy błędach rate limit
    if (error instanceof OpenRouterRateLimitError) {
      return false;
    }

    // Nie ponawiaj przy błędach autoryzacji
    if (error instanceof OpenRouterAuthenticationError) {
      return false;
    }

    // Nie ponawiaj przy błędach walidacji
    if (error instanceof OpenRouterValidationError) {
      return false;
    }

    // Jeśli to jest błąd OpenRouter, sprawdź jego kod
    if (error instanceof OpenRouterError) {
      // Nie ponawiaj przy błędach 4xx (oprócz 408 Request Timeout i 429 Rate Limit, który jest już obsłużony)
      if (error.status && error.status >= 400 && error.status < 500 && error.status !== 408) {
        return false;
      }
    }

    // Domyślnie pozwól na ponowienie dla innych błędów (np. sieciowych)
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
