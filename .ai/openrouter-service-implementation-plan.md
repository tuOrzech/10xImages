# OpenRouter Service Implementation Plan

## 1. Opis usługi

Usługa OpenRouter integruje interfejs API OpenRouter, umożliwiając uzupełnienie czatów opartych na LLM o dynamicznie generowane odpowiedzi. Integracja ta pozwala na automatyzację procesu generowania odpowiedzi na podstawie komunikatów systemowych i użytkownika, walidację struktury odpowiedzi według określonych reguł oraz nadzór nad parametrami modelu. Dzięki temu rozwiązaniu można usprawnić interakcję użytkownika z systemem, poprawiając doświadczenie użytkownika (UX), SEO oraz efektywność komunikacji.

## 2. Opis konstruktora

Konstruktor usługi (np. klasa `OpenRouterService`) inicjalizuje wszystkie niezbędne komponenty i ustawienia potrzebne do komunikacji z API OpenRouter. Przyjmuje on następujące parametry:

- **systemMessage:** Domyślny komunikat systemowy, np. "You are a virtual assistant powered by OpenRouter.".
- **userMessage:** Dynamiczny komunikat użytkownika przekazywany z interfejsu.
- **responseFormat:** Schemat odpowiedzi w formacie JSON, np.:
  ```json
  {
    "type": "json_schema",
    "json_schema": {
      "name": "ResponseSchema",
      "strict": true,
      "schema": {
        "success": "boolean",
        "data": "object",
        "message": "string"
      }
    }
  }
  ```
- **model:** Nazwa modelu, np. "openrouter-llm".
- **modelParams:** Parametry modelu, np. `{ "temperature": 0.7, "max_tokens": 4096, "top_p": 1.0 }`.

## 3. Publiczne metody i pola

### Publiczne pola

1. `config` – Przechowuje aktywną konfigurację usługi (API key, endpoint, ustawienia modelu itd.).
2. `lastResponse` – Przechowuje ostatnią odpowiedź zwróconą przez API OpenRouter.

### Publiczne metody

1. `sendRequest(message: string): Promise<Response>`
   - Łączy komunikat użytkownika z domyślnym komunikatem systemowym, buduje ustrukturyzowany payload oraz wysyła żądanie HTTP do API OpenRouter.
2. `setConfig(config: ConfigType): void`
   - Aktualizuje konfigurację usługi, umożliwiając dynamiczną zmianę parametrów działania.
3. `getLastResponse(): Response`
   - Zwraca ostatnio przetworzoną odpowiedź z API.

## 4. Prywatne metody i pola

### Prywatne pola

1. `_apiEndpoint` – URL endpointa API OpenRouter.
2. `_apiKey` – Klucz API, zabezpieczony poprzez zmienne środowiskowe lub systemy zarządzania sekretami.
3. `_httpClient` – Instancja klienta HTTP do wykonywania żądań.
4. `_logger` – Komponent logujący operacje i błędy.

### Prywatne metody

1. `_preparePayload(message: string): Payload`
   - Łączy dynamiczny komunikat użytkownika z domyślnym komunikatem systemowym oraz dołącza parametry `responseFormat`, nazwę modelu i jego parametry.
2. `_handleResponse(rawResponse: any): Response`
   - Waliduje i przekształca otrzymaną odpowiedź według zdefiniowanego schematu `responseFormat`.
3. `_logError(error: Error): void`
   - Centralizuje logowanie błędów, ułatwiając diagnostykę problemów.

## 5. Obsługa błędów

### Potencjalne scenariusze błędów

1. Błąd autentykacji (np. nieprawidłowy API key).
2. Przekroczenie limitów zapytań (rate limiting).
3. Niepoprawna struktura odpowiedzi (odpowiedź niezgodna ze schematem `responseFormat`).
4. Problemy z łącznością (timeout, błędy sieciowe).
5. Błąd wewnętrzny lub nieoczekiwany wyjątek serwera.

### Propozycje rozwiązań

1. Weryfikacja klucza API przed wysłaniem zapytania oraz mechanizm ponawiania autoryzacji.
2. Implementacja retry logic z wykładniczym backoffem oraz fallback logic.
3. Użycie bibliotek do walidacji JSON (np. Ajv) do sprawdzania struktury odpowiedzi.
4. Ustawienie odpowiednich timeoutów oraz obsługa błędów sieciowych z przyjaznymi komunikatami dla użytkownika.
5. Centralne logowanie błędów z możliwością wysyłania alertów do systemu monitoringu.

## 6. Kwestie bezpieczeństwa

1. Przechowywanie wrażliwych danych (API key, konfiguracja) w zmiennych środowiskowych (.env)
2. Implementacja mechanizmów ograniczania liczby zapytań (rate limiting) w celu zapobiegania nadużyciom.

## 7. Plan wdrożenia krok po kroku

1. **Przygotowanie środowiska**

   - Skonfiguruj pliki środowiskowe (.env) z niezbędnymi zmiennymi: `API_KEY`, `API_ENDPOINT`, `DEFAULT_MODEL`, `MODEL_PARAMS`.
   - Zainstaluj wymagane zależności (klient HTTP, biblioteki do walidacji JSON, system logowania).
   - Zweryfikuj zgodność technologicznego stacku (Astro 5, React 19, TypeScript 5, Tailwind 4, Shadcn/ui).

2. **Implementacja modułu OpenRouter**

   - Utwórz strukturę katalogów zgodną z projektem (np. `./src/services` lub `./src/lib`).
   - Zaimplementuj klasę `OpenRouterService` zgodnie z opisem konstruktora, dodając odpowiednie pola i metody (publiczne i prywatne).
   - Zaimplementuj metodę `_preparePayload` do budowania payloadu oraz `_handleResponse` do walidacji odpowiedzi.

3. **Integracja z interfejsem API aplikacji**

   - Stwórz lub zaktualizuj endpoint API (np. w `./src/pages/api`) do obsługi żądań przesyłanych przez interfejs użytkownika.
   - Podłącz logikę endpointu do metody `sendRequest` z `OpenRouterService`.

4. **Zabezpieczenia i audyt**

   - Upewnij się, że wszystkie wrażliwe dane są przechowywane i przesyłane w sposób bezpieczny.
   - Testuj komunikację HTTPS oraz walidację danych wejściowych.
   - Wdróż narzędzia monitorujące i system alertowania (np. Sentry) w celu wczesnego wykrywania problemów.
