# API Endpoint Implementation Plan: Create Optimization Job

## 1. Przegląd punktu końcowego

Endpoint odpowiedzialny za tworzenie nowej pozycji optymalizacji obrazu. Umożliwia przesłanie pliku obrazu (JPG, PNG lub WEBP) wraz z dodatkowymi informacjami kontekstowymi, takimi jak oryginalna nazwa pliku, opis obrazka oraz lista słów kluczowych. Endpoint inicjuje asynchroniczny proces generowania AI alternatywnego tekstu oraz sugestii SEO-friendly nazwy pliku. Rejestracja i logika bezpieczeństwa są oparte o Supabase Auth i RLS.

## 2. Szczegóły żądania

- **Metoda HTTP:** POST
- **Struktura URL:** /api/optimization-jobs
- **Parametry i Body:**
  - **Wymagane:**
    - `image` (plik): Obraz przesyłany przy użyciu multipart/form-data. Wspierane typy: JPG, PNG, WEBP.
    - `original_filename` (string): Oryginalna nazwa pliku.
  - **Opcjonalne:**
    - `user_context_subject` (string): Opis tematyki obrazu.
    - `user_context_keywords` (tablica stringów): Lista słów kluczowych dla obrazu.

## 3. Wykorzystywane typy

- **DTO:**
  - `OptimizationJobDTO` – reprezentuje rekord utworzony w bazie danych.
- **Command Model:**
  - `CreateOptimizationJobCommandDTO` – model żądania dla tworzenia nowej pozycji optymalizacji.

## 4. Szczegóły odpowiedzi

- **Sukces (201):**
  - Zwracany jest obiekt `OptimizationJobDTO` zawierający szczegóły nowo utworzonego zadania, w tym identyfikator, daty utworzenia/aktualizacji, oraz status przetwarzania.
- **Błędy:**
  - 400 Bad Request: Niepoprawne dane wejściowe lub nieprawidłowy format pliku.
  - 401 Unauthorized: Brak autoryzacji, nieprawidłowy token JWT lub brak sesji użytkownika.
  - 500 Internal Server Error: Problemy po stronie serwera lub błąd integracji z usługą AI.

## 5. Przepływ danych

1. Klient wysyła żądanie POST z plikiem obrazu oraz dodatkowymi danymi (jeśli dotyczy) w formacie multipart/form-data.
2. Serwer weryfikuje autentyczność żądania przy użyciu Supabase Auth (JWT w nagłówku).
3. Walidacja pliku:
   - Sprawdzenie typu MIME (odpowiadający JPG, PNG lub WEBP).
   - Sprawdzenie rozmiaru pliku i innych ograniczeń.
4. Walidacja danych wejściowych (obecność `original_filename` oraz, opcjonalnie, `user_context_subject` i `user_context_keywords`).
5. Utworzenie rekordu w tabeli `optimization_jobs` z wstępnym statusem (np. `pending` lub `processing`).
6. Inicjacja asynchronicznego procesu, który komunikuje się z zewnętrzną usługą AI w celu generowania sugestii alt text i filename.
7. Aktualizacja rekordu w bazie (zmiana statusu oraz zapisywanie wyników lub informacji o błędzie).
8. Odpowiedź do klienta z utworzonym rekordem.

## 6. Względy bezpieczeństwa

- **Autoryzacja i uwierzytelnianie:** Wszystkie operacje są chronione przez Supabase Auth; token JWT musi być obecny. RLS (Row Level Security) w bazie zapewnia, że użytkownik widzi i modyfikuje tylko swoje dane.
- **Walidacja plików:** Ograniczenie typów plików, walidacja MIME, ograniczenie rozmiaru pliku.
- **Ochrona przed atakami:** Walidacja danych wejściowych, sanitizacja żądań i implementacja rate limiting.

## 7. Obsługa błędów

- **400 Bad Request:** Niepoprawne typy lub brak wymaganych pól w żądaniu.
- **401 Unauthorized:** Nieautoryzowane żądanie lub brak poprawnego tokena.
- **404 Not Found:** Nie znaleziono zasobu (jeśli endpoint dotyczyłby operacji na istniejącym rekordzie).
- **500 Internal Server Error:** Błędy integracji z usługą AI lub problemy wewnętrzne.
- Dodatkowo, błędy procesów asynchronicznych są logowane, a szczegóły błędu mogą być zapisywane w polu `error_message` rekordu.

## 8. Rozważania dotyczące wydajności

- **Przetwarzanie asynchroniczne:** Rozdzielenie operacji przetwarzania obrazu i komunikacji z usługą AI od głównego cyklu żądania.
- **Optymalizacja uploadu plików:** Wykorzystanie mechanizmów do limitowania rozmiaru plików oraz skalowania przetwarzania obrazów (np. wykorzystanie Astro Image integration).
- **Caching i kolejkowanie:** Stosowanie kolejek zadań dla operacji intensywnie obciążających, co umożliwia skalowanie i lepszą dystrybucję zasobów.

## 9. Etapy wdrożenia

1. **Konfiguracja środowiska:**
   - Upewnić się, że Supabase Auth i baza danych są poprawnie skonfigurowane oraz RLS są aktywne.
2. **Implementacja walidacji:**
   - Zaimplementować walidację plików (typ, rozmiar) oraz walidację pól formularza zgodnie z `CreateOptimizationJobCommandDTO`.
3. **Tworzenie endpointu:**
   - Utworzyć plik API w katalogu `/src/pages/api/optimization-jobs.ts`.
   - Zaimportować niezbędne typy, biblioteki (np. Zod do walidacji) oraz moduły obsługi Supabase.
4. **Logika biznesowa i integracja z usługą AI:**
   - Wyodrębnić logikę przetwarzania do serwisu (np. `src/lib/services/optimizationService.ts`).
   - Zaimplementować asynchroniczne wywołanie zewnętrznej usługi AI.
5. **Tworzenie rekordu w bazie:**
   - Wykorzystać Supabase Client do utworzenia rekordu w tabeli `optimization_jobs` z odpowiednimi politykami RLS.
6. **Obsługa odpowiedzi:**
   - W przypadku pomyślnego utworzenia, zwrócić status 201 i obiekt `OptimizationJobDTO`.
   - W przypadku błędów, zwrócić odpowiedni kod statusu (400, 401, 500) wraz z komunikatem błędu.
7. **Dokumentacja:**
   - Uzupełnić dokumentację API oraz instrukcje wdrożenia dla zespołu programistów.
