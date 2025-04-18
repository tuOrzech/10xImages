# Plan Testów dla Projektu AltImageOptimizer

## 1. Wprowadzenie i Cele Testowania

### 1.1. Wprowadzenie

Niniejszy dokument opisuje plan testów dla aplikacji webowej AltImageOptimizer. Aplikacja ta umożliwia użytkownikom przesyłanie obrazów, automatyczne generowanie tekstów alternatywnych (alt text) oraz sugestii nazw plików z wykorzystaniem AI (OpenRouter), a także zarządzanie wynikami optymalizacji. Projekt oparty jest na stosie technologicznym obejmującym Astro, React, TypeScript, Supabase (Baza danych, Auth, Storage) oraz Tailwind CSS.

### 1.2. Cele Testowania

Głównymi celami procesu testowania są:

- **Weryfikacja funkcjonalności:** Upewnienie się, że wszystkie kluczowe funkcje aplikacji działają zgodnie z oczekiwaniami, w tym przesyłanie obrazów, generowanie sugestii AI, edycja i zapis wyników, oraz procesy uwierzytelniania.
- **Zapewnienie jakości:** Identyfikacja i eliminacja błędów w celu dostarczenia stabilnego, niezawodnego i użytecznego produktu.
- **Ocena użyteczności:** Sprawdzenie, czy interfejs użytkownika jest intuicyjny i łatwy w obsłudze.
- **Weryfikacja integracji:** Potwierdzenie poprawnej współpracy pomiędzy komponentami front-endowymi (React), API backendowym (Astro API Routes), bazą danych (Supabase) oraz usługami zewnętrznymi (OpenRouter).
- **Ocena wydajności:** Podstawowa ocena szybkości działania kluczowych operacji (przesyłanie, generowanie AI).
- **Sprawdzenie bezpieczeństwa:** Weryfikacja podstawowych mechanizmów bezpieczeństwa, zwłaszcza w kontekście uwierzytelniania i autoryzacji.

## 2. Zakres Testów

### 2.1. Funkcjonalności objęte testami:

- **Uwierzytelnianie użytkowników:**
  - Rejestracja nowego użytkownika.
  - Logowanie istniejącego użytkownika.
  - Wylogowywanie.
  - Proces odzyskiwania hasła.
  - Proces resetowania hasła.
  - Obsługa sesji użytkownika.
  - Ochrona tras wymagających zalogowania (Middleware).
- **Przesyłanie i Optymalizacja Obrazów:**
  - Formularz przesyłania (`UploadForm`).
  - Wybór pliku (przycisk, przeciągnij i upuść).
  - Walidacja typu i rozmiaru pliku (`useFileUpload`).
  - Wyświetlanie podglądu obrazu (`ImagePreview`).
  - Dodawanie opcjonalnego kontekstu (temat, słowa kluczowe - `ContextForm`).
  - Proces przesyłania pliku na serwer i do Supabase Storage (`api.service.ts`, `ImageService`).
  - Wyświetlanie postępu przesyłania (`Progress`).
  - Wywołanie API `/api/optimization-jobs` (POST).
  - Integracja z `OptimizationService` w celu przetworzenia zadania (w tym wywołanie OpenRouter).
  - Obsługa błędów (walidacja, przesyłanie, przetwarzanie AI, rate limiting OpenRouter).
  - Przekierowanie do strony podglądu po pomyślnym przesłaniu.
- **Podgląd i Edycja Wyników (`PreviewComponent`):**
  - Pobieranie danych zadania optymalizacji (`/api/optimization-jobs/[id]` GET).
  - Wyświetlanie obrazu źródłowego (`ImageDisplay`).
  - Wyświetlanie wygenerowanych przez AI sugestii (alt text, nazwa pliku, słowa kluczowe - `SuggestionPanel`).
  - Edycja tekstu alternatywnego i nazwy pliku (`EditableField`).
  - Zapisywanie zmian (`ActionButtons`, `/api/optimization-jobs/[id]` PATCH).
  - Ponawianie przetwarzania dla nieudanych zadań (`ActionButtons`, `/api/optimization-jobs/[id]/retry` POST).
  - Obsługa różnych statusów zadań (pending, processing, completed, failed).
  - Wyświetlanie komunikatów o błędach (`ErrorDisplay`, toasts).
  - Nawigacja "Wstecz".
- **Interfejs Użytkownika (UI):**
  - Nawigacja (`Navigation`) - stan zalogowany/niezalogowany.
  - Responsywność interfejsu na różnych rozmiarach ekranu.
  - Poprawność wyświetlania komponentów UI (`ui/`).
  - Wyświetlanie powiadomień (toasts - `Sonner`).
  - Obsługa stanu ładowania (`LoadingIndicator`).
- **API Backendowe (Astro API Routes):**
  - Endpointy CRUD dla `/api/optimization-jobs`.
  - Endpoint `/api/optimization-jobs/[id]/retry`.
  - Endpointy uwierzytelniania `/api/auth/*`.
  - Endpoint `/api/auth/me` do sprawdzania statusu zalogowania.
  - Walidacja danych wejściowych (Zod).
  - Obsługa błędów i odpowiednie kody statusu HTTP.
  - Integracja z `OptimizationService`.
- **Middleware:**
  - Poprawna inicjalizacja klienta Supabase.
  - Wstrzykiwanie `supabase` i `user` do `Astro.locals`.
  - Poprawna ochrona tras wymagających zalogowania.
  - Zezwalanie na dostęp do ścieżek publicznych.

### 2.2. Funkcjonalności wyłączone z testów:

- Testowanie samych bibliotek i frameworków (Astro, React, Supabase, OpenRouter - zakładamy ich poprawność).
- Szczegółowe testy wydajnościowe i obciążeniowe (poza podstawową obserwacją).
- Testowanie infrastruktury serwerowej i procesów CI/CD (chyba że zostaną włączone w późniejszym etapie).
- Zaawansowane testy penetracyjne i bezpieczeństwa (poza podstawową weryfikacją).
- Testowanie dokładności AI (OpenRouter) w generowaniu treści - skupiamy się na integracji i obsłudze odpowiedzi/błędów.

## 3. Typy Testów do Przeprowadzenia

- **Testy Jednostkowe (Unit Tests):**
  - Cel: Weryfikacja poprawności działania izolowanych fragmentów kodu (funkcje, hooki, serwisy).
  - Zakres: Funkcje pomocnicze (`lib/utils.ts`), hooki React (`hooks/useFileUpload.ts`), serwisy (`lib/services/*` z mockowaniem zależności - Supabase, OpenRouter, ImageService), walidacja Zod.
  - Narzędzia: Vitest, React Testing Library.
- **Testy Integracyjne (Integration Tests):**
  - Cel: Sprawdzenie poprawnej współpracy pomiędzy różnymi modułami/komponentami.
  - Zakres: Interakcje komponentów React (np. `UploadForm` z `ContextForm`, `FileInput`), integracja komponentów z API (`PreviewComponent` pobierający dane), integracja serwisów (`OptimizationService` z `ImageService` i `OpenRouterService`), testowanie endpointów API wraz z ich zależnościami (serwisy, baza danych - częściowo z mockami lub testową bazą danych). Testowanie Middleware.
  - Narzędzia: Vitest, React Testing Library, Supertest (dla API), MSW (Mock Service Worker).
- **Testy End-to-End (E2E Tests):**
  - Cel: Symulacja rzeczywistych scenariuszy użycia aplikacji przez użytkownika w przeglądarce.
  - Zakres: Pełne przepływy użytkownika: Rejestracja -> Logowanie -> Przesłanie obrazu -> Podgląd -> Edycja -> Zapis -> Wylogowanie. Testowanie nawigacji, interakcji UI, walidacji formularzy po stronie klienta i serwera.
  - Narzędzia: Playwright.
- **Testy API (API Tests):**
  - Cel: Bezpośrednie testowanie endpointów API w izolacji od UI.
  - Zakres: Weryfikacja kontraktów API (request/response), walidacji danych wejściowych, kodów statusu HTTP, obsługi błędów, autoryzacji (jeśli dotyczy endpointu).
  - Narzędzia: Playwright (`request` context) lub Vitest (`supertest`, `fetch`). Postman/Insomnia jako narzędzia pomocnicze/eksploracyjne.
- **Testy Manualne Eksploracyjne:**
  - Cel: Wykrywanie nieoczywistych błędów, problemów z użytecznością i przypadków brzegowych niepokrytych przez automatyzację.
  - Zakres: Cała aplikacja, ze szczególnym uwzględnieniem interakcji użytkownika, obsługi błędów i responsywności.
- **Testy Wizualne (Visual Regression Testing - Opcjonalnie):**
  - Cel: Zapewnienie spójności wizualnej interfejsu, wykrywanie niezamierzonych zmian w wyglądzie komponentów.
  - Narzędzia: **Playwright (wbudowane porównywanie zrzutów ekranu)** jako podstawowe rozwiązanie. Narzędzia takie jak Percy, Chromatic mogą być rozważone dla bardziej zaawansowanych przepływów pracy (np. integracja ze Storybookiem).
- **Testy Wydajnościowe (Podstawowe):**
  - Cel: Zmierzenie czasu odpowiedzi dla kluczowych operacji.
  - Zakres: Czas przesyłania obrazu, czas odpowiedzi API dla tworzenia i pobierania zadania, czas generowania sugestii AI (orientacyjny).
  - Narzędzia: Narzędzia deweloperskie przeglądarki (Network tab), K6 (dla API).
- **Testy Bezpieczeństwa (Podstawowe):**
  - Cel: Identyfikacja podstawowych luk bezpieczeństwa.
  - Zakres: Weryfikacja mechanizmów uwierzytelniania, ochrona przed podstawowymi atakami (np. XSS w polach edytowalnych), walidacja danych wejściowych po stronie serwera.
- **Statyczna Analiza Kodu:**
  - Cel: Wczesne wykrywanie błędów, promowanie spójnego stylu kodu i dobrych praktyk.
  - Zakres: Cały kod źródłowy (TypeScript, React, Astro).
  - Narzędzia: **ESLint** (z odpowiednimi pluginami), **Prettier**, **`tsc` / `astro check`**. Konieczne do integracji w procesie CI/CD.

## 4. Scenariusze Testowe dla Kluczowych Funkcjonalności

Poniżej przedstawiono przykładowe, szczegółowe scenariusze testowe. Format: **ID Scenariusza - Tytuł** (Warunki wstępne -> Kroki -> Oczekiwany rezultat).

---

**Moduł: Uwierzytelnianie**

- **AUTH-001 - Rejestracja nowego użytkownika (poprawna)**
  - Warunki: Użytkownik niezalogowany, znajduje się na stronie `/auth/register`.
  - Kroki:
    1.  Wprowadź poprawny, nieistniejący adres email.
    2.  Wprowadź hasło spełniające wymagania (min. 8 znaków, duża litera, znak specjalny).
    3.  Wprowadź to samo hasło w polu potwierdzenia.
    4.  Kliknij przycisk "Zarejestruj się".
  - Oczekiwany rezultat: Wyświetlenie komunikatu o sukcesie (np. "Sprawdź email...") i/lub przekierowanie. Użytkownik powinien otrzymać email weryfikacyjny. W bazie danych (Supabase Auth) pojawia się nowy użytkownik.
- **AUTH-002 - Rejestracja z istniejącym adresem email**
  - Warunki: Użytkownik niezalogowany, email testowy już istnieje w bazie.
  - Kroki: Wypełnij formularz rejestracji używając istniejącego emaila. Kliknij "Zarejestruj się".
  - Oczekiwany rezultat: Wyświetlenie komunikatu błędu "Użytkownik o podanym adresie email już istnieje".
- **AUTH-003 - Rejestracja z błędami walidacji**
  - Warunki: Użytkownik niezalogowany, strona `/auth/register`.
  - Kroki: Spróbuj zarejestrować się z: a) niepoprawnym formatem email, b) zbyt krótkim hasłem, c) hasłem bez dużej litery, d) hasłem bez znaku specjalnego, e) różnymi hasłami w polach hasła i potwierdzenia.
  - Oczekiwany rezultat: Dla każdego przypadku wyświetlenie odpowiedniego komunikatu błędu walidacji przy odpowiednim polu. Rejestracja nie dochodzi do skutku.
- **AUTH-004 - Logowanie poprawne**
  - Warunki: Użytkownik zarejestrowany i zweryfikowany, niezalogowany, strona `/auth/login`.
  - Kroki: Wprowadź poprawny email i hasło. Kliknij "Zaloguj się".
  - Oczekiwany rezultat: Użytkownik zostaje przekierowany do `/dashboard`. Nawigacja pokazuje email użytkownika i opcję "Wyloguj się". W `localStorage` lub `sessionStorage` pojawiają się dane sesji Supabase.
- **AUTH-005 - Logowanie z błędnym hasłem/emailem**
  - Warunki: Użytkownik niezalogowany, strona `/auth/login`.
  - Kroki: Wprowadź poprawny email i błędne hasło (lub odwrotnie). Kliknij "Zaloguj się".
  - Oczekiwany rezultat: Wyświetlenie komunikatu błędu "Nieprawidłowy email lub hasło. Pozostało prób: X". Użytkownik pozostaje na stronie logowania.
- **AUTH-006 - Logowanie - przekroczenie limitu prób (Rate Limiting)**
  - Warunki: Użytkownik niezalogowany, strona `/auth/login`.
  - Kroki: Wprowadź błędne dane logowania 3 razy pod rząd (lub zgodnie z `MAX_ATTEMPTS`). Spróbuj zalogować się po raz czwarty.
  - Oczekiwany rezultat: Wyświetlenie komunikatu błędu o przekroczeniu limitu prób i konieczności odczekania (np. "Zbyt wiele nieudanych prób... Spróbuj ponownie za X minut."). Przycisk logowania może być zablokowany.
- **AUTH-007 - Wylogowanie**
  - Warunki: Użytkownik zalogowany.
  - Kroki: Kliknij przycisk "Wyloguj się" w nawigacji.
  - Oczekiwany rezultat: Użytkownik zostaje przekierowany na stronę główną (`/`) lub logowania (`/auth/login`). Nawigacja pokazuje opcje "Zaloguj się" i "Zarejestruj się". Dane sesji Supabase są usuwane.
- **AUTH-008 - Odzyskiwanie hasła (wysłanie linku)**
  - Warunki: Użytkownik niezalogowany, zna swój email, strona `/auth/password-recovery`.
  - Kroki: Wprowadź zarejestrowany email. Kliknij "Send Reset Link".
  - Oczekiwany rezultat: Wyświetlenie komunikatu sukcesu. Użytkownik otrzymuje email z linkiem do resetowania hasła.
- **AUTH-009 - Odzyskiwanie hasła (nieistniejący email)**
  - Warunki: Użytkownik niezalogowany, strona `/auth/password-recovery`.
  - Kroki: Wprowadź email, który nie istnieje w bazie. Kliknij "Send Reset Link".
  - Oczekiwany rezultat: Wyświetlenie komunikatu błędu (np. "Nie znaleziono użytkownika...").
- **AUTH-010 - Resetowanie hasła (poprawne)**
  - Warunki: Użytkownik kliknął ważny link resetowania hasła, znajduje się na stronie `/auth/reset-password`.
  - Kroki: Wprowadź nowe hasło spełniające wymagania. Wprowadź je ponownie w polu potwierdzenia. Kliknij "Zresetuj hasło".
  - Oczekiwany rezultat: Wyświetlenie komunikatu sukcesu. Użytkownik zostaje przekierowany na stronę logowania. Może zalogować się nowym hasłem.
- **AUTH-011 - Resetowanie hasła (niezgodne hasła)**
  - Warunki: Strona `/auth/reset-password`.
  - Kroki: Wprowadź różne hasła w obu polach. Kliknij "Zresetuj hasło".
  - Oczekiwany rezultat: Wyświetlenie komunikatu błędu "Hasła nie są zgodne".
- **AUTH-012 - Ochrona tras (Middleware)**
  - Warunki: Użytkownik niezalogowany.
  - Kroki: Spróbuj wejść bezpośrednio na chronioną stronę, np. `/dashboard` lub `/history`.
  - Oczekiwany rezultat: Użytkownik zostaje przekierowany na stronę logowania (`/auth/login`).
- **AUTH-013 - Dostęp do tras publicznych (Middleware)**
  - Warunki: Użytkownik niezalogowany.
  - Kroki: Wejdź na strony publiczne: `/`, `/upload`, `/preview/[jakieś_id]`, `/auth/login`, `/auth/register`.
  - Oczekiwany rezultat: Użytkownik ma dostęp do tych stron bez przekierowania.

---

**Moduł: Przesyłanie Obrazu (`UploadForm`)**

- **UPLOAD-001 - Wybór pliku przez przycisk (poprawny plik)**
  - Warunki: Strona `/upload` lub `/`.
  - Kroki: Kliknij przycisk "Wybierz plik". Wybierz plik JPG/PNG/WEBP o rozmiarze < 10MB.
  - Oczekiwany rezultat: Podgląd obrazu (`ImagePreview`) zostaje wyświetlony wraz z nazwą pliku. Formularz jest gotowy do wysłania.
- **UPLOAD-002 - Wybór pliku przez przycisk (niepoprawny typ)**
  - Warunki: Strona `/upload` lub `/`.
  - Kroki: Kliknij "Wybierz plik". Wybierz plik np. TXT lub PDF.
  - Oczekiwany rezultat: Wyświetlenie komunikatu błędu (toast) "Nieprawidłowy format pliku...". Podgląd nie jest wyświetlany. Przycisk wysyłania jest nieaktywny.
- **UPLOAD-003 - Wybór pliku przez przycisk (za duży rozmiar)**
  - Warunki: Strona `/upload` lub `/`.
  - Kroki: Kliknij "Wybierz plik". Wybierz plik obrazu > 10MB.
  - Oczekiwany rezultat: Wyświetlenie komunikatu błędu (toast) "Plik jest za duży...". Podgląd nie jest wyświetlany. Przycisk wysyłania nieaktywny.
- **UPLOAD-004 - Przeciągnij i upuść (poprawny plik)**
  - Warunki: Strona `/upload` lub `/`.
  - Kroki: Przeciągnij poprawny plik obrazu (JPG/PNG/WEBP, <10MB) i upuść go na wyznaczony obszar (`FileInput`).
  - Oczekiwany rezultat: Obszar zmienia wygląd podczas przeciągania. Po upuszczeniu wyświetlany jest podgląd obrazu i nazwa pliku.
- **UPLOAD-005 - Przeciągnij i upuść (niepoprawny plik)**
  - Warunki: Strona `/upload` lub `/`.
  - Kroki: Przeciągnij i upuść plik TXT lub obraz > 10MB.
  - Oczekiwany rezultat: Wyświetlenie odpowiedniego komunikatu błędu (toast). Brak podglądu. Przycisk wysyłania nieaktywny.
- **UPLOAD-006 - Dodawanie i usuwanie słów kluczowych (`ContextForm`)**
  - Warunki: Wybrano plik obrazu.
  - Kroki:
    1.  Wpisz słowo kluczowe w polu "Dodaj słowo kluczowe...".
    2.  Kliknij "Dodaj" (lub naciśnij Enter).
    3.  Dodaj kolejne słowo kluczowe.
    4.  Kliknij ikonę "X" przy pierwszym dodanym słowie kluczowym.
  - Oczekiwany rezultat: Słowa kluczowe pojawiają się jako plakietki (`Badge`). Przycisk "Dodaj" jest aktywny tylko gdy pole nie jest puste. Usunięcie słowa kluczowego powoduje zniknięcie odpowiedniej plakietki.
- **UPLOAD-007 - Wprowadzanie tematu obrazu (`ContextForm`)**
  - Warunki: Wybrano plik obrazu.
  - Kroki: Wpisz tekst w polu "Temat obrazu".
  - Oczekiwany rezultat: Wprowadzony tekst jest widoczny w polu.
- **UPLOAD-008 - Wysłanie formularza (z kontekstem)**
  - Warunki: Wybrano poprawny plik, wprowadzono temat i dodano słowa kluczowe.
  - Kroki: Kliknij przycisk "Prześlij obraz".
  - Oczekiwany rezultat: Wyświetlany jest wskaźnik postępu. Po zakończeniu (sukces) wyświetlany jest toast sukcesu. Następuje przekierowanie na stronę `/preview/[job_id]`. W bazie danych tworzony jest nowy rekord `optimization_jobs` z przekazanym kontekstem. Plik trafia do Supabase Storage.
- **UPLOAD-009 - Wysłanie formularza (bez kontekstu)**
  - Warunki: Wybrano poprawny plik, pola kontekstu są puste.
  - Kroki: Kliknij "Prześlij obraz".
  - Oczekiwany rezultat: Jak w UPLOAD-008, ale rekord w bazie nie zawiera `user_context_subject` ani `user_context_keywords`.
- **UPLOAD-010 - Wysłanie formularza (błąd API)**
  - Warunki: Wybrano poprawny plik. Serwer API jest skonfigurowany tak, aby zwrócić błąd (np. 500 lub błąd OpenRouter).
  - Kroki: Kliknij "Prześlij obraz".
  - Oczekiwany rezultat: Wyświetlany jest wskaźnik postępu. Po otrzymaniu błędu z API, wyświetlany jest toast z komunikatem błędu. Użytkownik pozostaje na stronie przesyłania. Wskaźnik postępu znika, przycisk wysyłania staje się ponownie aktywny.
- **UPLOAD-011 - Wysłanie formularza (błąd Rate Limit OpenRouter)**
  - Warunki: Wybrano poprawny plik. OpenRouter zwraca błąd 429.
  - Kroki: Kliknij "Prześlij obraz".
  - Oczekiwany rezultat: Wyświetlany jest toast z informacją o przekroczeniu limitu zapytań. Użytkownik pozostaje na stronie przesyłania. W bazie _nie_ powinien powstać rekord zadania (zgodnie z logiką w `OptimizationService`). Plik _nie_ powinien pozostać w Storage.
- **UPLOAD-012 - Resetowanie formularza (klawisz Esc)**
  - Warunki: Wybrano plik, wpisano kontekst.
  - Kroki: Naciśnij klawisz `Esc`.
  - Oczekiwany rezultat: Podgląd obrazu znika, pola kontekstu są czyszczone. Wyświetlany jest toast informacyjny o zresetowaniu formularza.
- **UPLOAD-013 - Wysłanie formularza (skrót Ctrl+Enter)**
  - Warunki: Wybrano poprawny plik.
  - Kroki: Naciśnij `Ctrl+Enter` (lub `Cmd+Enter` na Mac).
  - Oczekiwany rezultat: Formularz zostaje wysłany (jak w UPLOAD-008/009).

---

**Moduł: Podgląd i Edycja Wyników (`PreviewComponent`)**

- **PREVIEW-001 - Poprawne załadowanie danych zadania (status completed)**
  - Warunki: Istnieje zadanie o statusie `completed` z ID = `xyz`. Użytkownik wchodzi na `/preview/xyz`.
  - Kroki: Otwórz stronę `/preview/xyz`.
  - Oczekiwany rezultat: Wyświetlany jest obraz (`ImageDisplay`). W panelu sugestii (`SuggestionPanel`) widoczne są wygenerowane alt text, nazwa pliku i ewentualne słowa kluczowe AI. Pola są edytowalne (`EditableField`). Przycisk "Save Changes" jest początkowo nieaktywny. Przycisk "Retry" jest niewidoczny/nieaktywny.
- **PREVIEW-002 - Ładowanie danych zadania (status failed)**
  - Warunki: Istnieje zadanie o statusie `failed` z ID = `abc`, zawiera `error_message`. Użytkownik wchodzi na `/preview/abc`.
  - Kroki: Otwórz stronę `/preview/abc`.
  - Oczekiwany rezultat: Wyświetlany jest komunikat błędu pobrany z `job.error_message`. Przycisk "Retry" jest widoczny i aktywny. Przycisk "Save Changes" może być nieaktywny lub pozwalać na ręczne wprowadzenie danych.
- **PREVIEW-003 - Ładowanie danych zadania (status pending/processing)**
  - Warunki: Istnieje zadanie o statusie `pending` lub `processing` z ID = `pqr`. Użytkownik wchodzi na `/preview/pqr`.
  - Kroki: Otwórz stronę `/preview/pqr`.
  - Oczekiwany rezultat: Wyświetlany jest komunikat informujący o trwającym przetwarzaniu (np. "Zadanie jest w trakcie przetwarzania..."). Brak możliwości edycji/zapisu/ponowienia.
- **PREVIEW-004 - Ładowanie danych nieistniejącego zadania**
  - Warunki: ID `nieistniejace` nie odpowiada żadnemu zadaniu.
  - Kroki: Otwórz stronę `/preview/nieistniejace`.
  - Oczekiwany rezultat: Wyświetlany jest komunikat błędu "Nie znaleziono zadania..." lub przekierowanie na stronę błędu/główną.
- **PREVIEW-005 - Edycja Alt Text (`EditableField`)**
  - Warunki: Załadowano zadanie `completed`, strona `/preview/xyz`.
  - Kroki:
    1.  Kliknij na pole Alt Text.
    2.  Zmień tekst.
    3.  Kliknij ikonę "Check" (Zapisz w polu) lub naciśnij Enter.
  - Oczekiwany rezultat: Pole przechodzi w tryb edycji. Po zapisie w polu, wyświetlany jest nowy tekst. Przycisk "Save Changes" staje się aktywny.
- **PREVIEW-006 - Anulowanie edycji Alt Text (`EditableField`)**
  - Warunki: Załadowano zadanie `completed`, pole Alt Text jest w trybie edycji.
  - Kroki: Zmień tekst. Kliknij ikonę "X" (Anuluj w polu).
  - Oczekiwany rezultat: Pole wraca do trybu wyświetlania z _oryginalną_ wartością (sprzed rozpoczęcia edycji w tym polu). Przycisk "Save Changes" wraca do poprzedniego stanu aktywności.
- **PREVIEW-007 - Edycja Nazwy Pliku (`EditableField`)**
  - Warunki: Analogiczne do PREVIEW-005 dla pola Nazwa Pliku.
  - Kroki: Analogiczne do PREVIEW-005.
  - Oczekiwany rezultat: Analogiczny do PREVIEW-005.
- **PREVIEW-008 - Zapisanie zmian (`ActionButtons`)**
  - Warunki: Zmieniono Alt Text lub Nazwę Pliku, przycisk "Save Changes" jest aktywny.
  - Kroki: Kliknij przycisk "Save Changes".
  - Oczekiwany rezultat: Przycisk pokazuje stan ładowania ("Saving..."). Wykonywane jest żądanie PATCH do `/api/optimization-jobs/[id]`. Po sukcesie: wyświetlany jest toast sukcesu, przycisk wraca do stanu "Save Changes" i staje się nieaktywny, pola edycji (`EditableField`) wracają do trybu wyświetlania. W bazie danych zapisane są nowe wartości.
- **PREVIEW-009 - Zapisanie zmian (błąd API)**
  - Warunki: Zmieniono dane, przycisk "Save Changes" aktywny. API skonfigurowane do zwrócenia błędu PATCH.
  - Kroki: Kliknij "Save Changes".
  - Oczekiwany rezultat: Przycisk pokazuje stan ładowania. Po błędzie API: wyświetlany jest toast błędu, przycisk wraca do stanu "Save Changes" i pozostaje aktywny. Wprowadzone zmiany pozostają widoczne w polach edycji.
- **PREVIEW-010 - Ponowienie przetwarzania (`Retry`)**
  - Warunki: Załadowano zadanie `failed`, przycisk "Retry" jest aktywny.
  - Kroki: Kliknij przycisk "Retry".
  - Oczekiwany rezultat: Przycisk pokazuje stan ładowania ("Retrying..."). Wykonywane jest żądanie POST do `/api/optimization-jobs/[id]/retry`. Po sukcesie: wyświetlany jest toast sukcesu ("Job reprocessing started"), dane zadania są odświeżane (status może zmienić się na `processing` lub od razu `completed` jeśli przetwarzanie jest szybkie), przycisk "Retry" staje się nieaktywny.
- **PREVIEW-011 - Ponowienie przetwarzania (błąd API)**
  - Warunki: Zadanie `failed`, przycisk "Retry" aktywny. API `/retry` zwraca błąd.
  - Kroki: Kliknij "Retry".
  - Oczekiwany rezultat: Przycisk pokazuje stan ładowania. Po błędzie API: wyświetlany jest toast błędu, przycisk wraca do stanu "Retry" i pozostaje aktywny. Status zadania pozostaje `failed`.
- **PREVIEW-012 - Przycisk "Wstecz" (`ActionButtons`)**
  - Warunki: Strona `/preview/[id]`.
  - Kroki: Kliknij przycisk "Back".
  - Oczekiwany rezultat: Użytkownik wraca do poprzedniej strony w historii przeglądarki (np. `/upload` lub `/`).

---

**Moduł: API Backendowe**

- **API-001 - POST `/api/optimization-jobs` (sukces)**
  - Warunki: Poprawny request `multipart/form-data` z obrazem i opcjonalnym kontekstem.
  - Kroki: Wyślij request POST.
  - Oczekiwany rezultat: Status 201 Created. Ciało odpowiedzi zawiera dane utworzonego zadania (`OptimizationJobDTO`). Plik jest w Supabase Storage. Rekord jest w tabeli `optimization_jobs`.
- **API-002 - POST `/api/optimization-jobs` (błędy walidacji)**
  - Warunki: Request `multipart/form-data` z: a) brakiem pliku, b) niepoprawnym typem pliku, c) za dużym plikiem, d) brakiem `original_filename`.
  - Kroki: Wyślij błędny request POST.
  - Oczekiwany rezultat: Status 400 Bad Request. Ciało odpowiedzi zawiera szczegóły błędu walidacji.
- **API-003 - POST `/api/optimization-jobs` (błąd OpenRouter Rate Limit)**
  - Warunki: Poprawny request, ale OpenRouter zwraca 429.
  - Kroki: Wyślij request POST.
  - Oczekiwany rezultat: Status 429 Too Many Requests. Ciało odpowiedzi zawiera komunikat o błędzie rate limit.
- **API-004 - GET `/api/optimization-jobs/[id]` (sukces)**
  - Warunki: Istnieje zadanie o podanym ID.
  - Kroki: Wyślij request GET.
  - Oczekiwany rezultat: Status 200 OK. Ciało odpowiedzi zawiera dane zadania (`OptimizationJobDTO`).
- **API-005 - GET `/api/optimization-jobs/[id]` (nie znaleziono)**
  - Warunki: Brak zadania o podanym ID.
  - Kroki: Wyślij request GET.
  - Oczekiwany rezultat: Status 404 Not Found.
- **API-006 - PATCH `/api/optimization-jobs/[id]` (sukces)**
  - Warunki: Istnieje zadanie o podanym ID. Poprawny request body (JSON) z danymi do aktualizacji.
  - Kroki: Wyślij request PATCH.
  - Oczekiwany rezultat: Status 200 OK. Ciało odpowiedzi zawiera zaktualizowane dane zadania. Rekord w bazie jest zmieniony.
- **API-007 - PATCH `/api/optimization-jobs/[id]` (błąd walidacji)**
  - Warunki: Istnieje zadanie. Request body zawiera niepoprawne dane (np. błędny status).
  - Kroki: Wyślij request PATCH.
  - Oczekiwany rezultat: Status 400 Bad Request. Ciało odpowiedzi zawiera szczegóły błędu walidacji.
- **API-008 - DELETE `/api/optimization-jobs/[id]` (sukces)**
  - Warunki: Istnieje zadanie o podanym ID.
  - Kroki: Wyślij request DELETE.
  - Oczekiwany rezultat: Status 204 No Content. Rekord w bazie jest usunięty. Powiązany plik w Supabase Storage jest usunięty.
- **API-009 - POST `/api/optimization-jobs/[id]/retry` (sukces)**
  - Warunki: Istnieje zadanie o statusie `failed`.
  - Kroki: Wyślij request POST.
  - Oczekiwany rezultat: Status 200 OK. Ciało odpowiedzi zawiera zaktualizowane dane zadania (status `completed` lub `processing`, nowe sugestie AI).
- **API-010 - POST `/api/optimization-jobs/[id]/retry` (niepoprawny status zadania)**
  - Warunki: Istnieje zadanie o statusie `completed` lub `pending`.
  - Kroki: Wyślij request POST.
  - Oczekiwany rezultat: Status 400 Bad Request. Komunikat błędu informujący, że tylko zadania `failed` mogą być ponawiane.
- **API-011 - GET `/api/auth/me` (użytkownik zalogowany)**
  - Warunki: Ważny token sesji Supabase w cookies.
  - Kroki: Wyślij request GET.
  - Oczekiwany rezultat: Status 200 OK. Ciało odpowiedzi zawiera obiekt `user` z danymi zalogowanego użytkownika. Odpowiednie nagłówki Cache-Control.
- **API-012 - GET `/api/auth/me` (użytkownik niezalogowany)**
  - Warunki: Brak ważnego tokenu sesji Supabase w cookies.
  - Kroki: Wyślij request GET.
  - Oczekiwany rezultat: Status 200 OK. Ciało odpowiedzi zawiera `user: null`. Odpowiednie nagłówki Cache-Control.
- **API-013 - POST `/api/auth/login` (test rate limiting)**
  - Warunki: Brak.
  - Kroki: Wyślij 4 (lub `MAX_ATTEMPTS + 1`) błędne requesty POST z tego samego IP.
  - Oczekiwany rezultat: Po 3 błędnych próbach, czwarta powinna zwrócić status 429 Too Many Requests z odpowiednim komunikatem i nagłówkiem `Retry-After`.

## 5. Środowisko Testowe

- **Środowisko Deweloperskie (Lokalne):**
  - Cel: Testy jednostkowe, integracyjne, E2E podczas rozwoju.
  - Konfiguracja: Lokalne uruchomienie aplikacji (`npm run dev`), lokalna instancja Supabase (opcjonalnie, przez Supabase CLI) lub dedykowany projekt Supabase dev, mockowanie OpenRouter lub użycie klucza dev.
- **Środowisko Staging/Przedprodukcyjne:**
  - Cel: Pełne testy E2E, testy integracyjne z rzeczywistymi usługami, testy akceptacyjne.
  - Konfiguracja: Oddzielne wdrożenie aplikacji (np. Vercel, Netlify), dedykowany projekt Supabase (staging), klucz API OpenRouter dla stagingu (może być z limitem). Środowisko jak najbardziej zbliżone do produkcyjnego.
- **Środowisko Produkcyjne:**
  - Cel: Testy typu "smoke tests" po wdrożeniu, monitorowanie.
  - Konfiguracja: Rzeczywista, działająca aplikacja. Testy ograniczone do minimum, aby nie wpływać na użytkowników.
- **Przeglądarki:** Chrome (najnowsza), Firefox (najnowsza), Safari (najnowsza) - na desktopie. Opcjonalnie testy na popularnych przeglądarkach mobilnych (Chrome on Android, Safari on iOS).
- **Systemy Operacyjne:** Windows, macOS, Linux (dla testów E2E/manualnych).

## 6. Narzędzia do Testowania

- **Framework do testów jednostkowych/integracyjnych:** Vitest (preferowany w ekosystemie Vite/Astro) lub Jest.
- **Biblioteka do testowania komponentów React:** React Testing Library.
- **Framework do testów E2E:** Playwright (zalecany ze względu na szybkość, możliwości i potencjał do konsolidacji testów API i wizualnych) lub Cypress.
- **Narzędzie do testów API:** Zintegrowane w Playwright (`request`) lub Vitest (`supertest`/`fetch`). Postman/Insomnia jako narzędzia pomocnicze/eksploracyjne.
- **Mockowanie API/Serwisów:** Mock Service Worker (MSW), Vitest `vi.mock`.
- **Narzędzie do rozwoju i dokumentacji komponentów UI:** **Storybook** (opcjonalnie, ale zalecane do izolowanego rozwoju i testowania komponentów, zwłaszcza z bibliotek jak Shadcn/ui).
- **Narzędzia do Statycznej Analizy Kodu:** ESLint, Prettier, TypeScript (`tsc`), Astro (`astro check`).
- **System Zarządzania Testami (opcjonalnie):** Początkowo zarządzanie może odbywać się poprzez pliki Markdown (jak ten) lub system śledzenia zadań (np. GitHub Issues z etykietami). Narzędzia takie jak TestRail, Zephyr Scale (Jira), Xray (Jira) mogą być rozważone w miarę wzrostu skali projektu.

## 7. Harmonogram Testów

Harmonogram testów powinien być zintegrowany z cyklem rozwoju projektu (np. sprintami). Przykładowy podział:

- **Faza Planowania:** (Bieżący etap) Tworzenie i przegląd planu testów.
- **Faza Implementacji Testów:** Równolegle z rozwojem funkcjonalności:
  - Deweloperzy piszą testy jednostkowe.
  - Inżynier QA tworzy testy integracyjne, API i E2E dla gotowych modułów.
- **Faza Wykonania Testów:**
  - Ciągłe uruchamianie testów automatycznych w CI/CD.
  - Regularne sesje testów manualnych eksploracyjnych (np. pod koniec sprintu).
  - Pełna regresja przed ważnymi wdrożeniami (staging).
- **Faza Testów Akceptacyjnych (UAT):** Przeprowadzane przez Product Ownera lub klienta na środowisku stagingowym.
- **Faza Testów Poprodukcyjnych:** Smoke testy po każdym wdrożeniu na produkcję.

Konkretne daty będą zależeć od ogólnego harmonogramu projektu.

## 8. Kryteria Akceptacji Testów

Testy uznaje się za zakończone pomyślnie, gdy spełnione są następujące kryteria:

- **Kryteria Wejścia (Rozpoczęcie testów):**
  - Dostępny jest stabilny build na odpowiednim środowisku testowym.
  - Plan testów został zatwierdzony.
  - Wszystkie wymagane narzędzia i dane testowe są przygotowane.
- **Kryteria Wyjścia (Zakończenie testów):**
  - Co najmniej 95% wszystkich zaplanowanych scenariuszy testowych (automatycznych i manualnych) zakończyło się statusem "Passed".
  - 100% krytycznych scenariuszy testowych (core flow, auth) zakończyło się statusem "Passed".
  - Brak otwartych błędów o priorytecie krytycznym (Blocker) lub wysokim (High).
  - Wszystkie zgłoszone błędy zostały przeanalizowane i odpowiednio sklasyfikowane.
  - Dokumentacja testowa (wyniki, raporty) jest kompletna i zaktualizowana.
  - Osiągnięto zdefiniowane (jeśli są) podstawowe cele wydajnościowe.

## 9. Role i Odpowiedzialności w Procesie Testowania

- **Inżynier QA:**
  - Odpowiedzialny za stworzenie, utrzymanie i aktualizację planu testów.
  - Projektowanie, implementacja i wykonywanie testów automatycznych (Integracyjne, API, E2E).
  - Wykonywanie testów manualnych eksploracyjnych.
  - Raportowanie i śledzenie błędów.
  - Komunikacja statusu testów do zespołu.
  - Weryfikacja poprawek błędów.
- **Deweloperzy:**
  - Implementacja testów jednostkowych dla tworzonego kodu.
  - Uczestnictwo w testach integracyjnych (wsparcie dla QA).
  - Poprawianie zgłoszonych błędów.
  - Utrzymanie środowiska deweloperskiego umożliwiającego testowanie.
- **Product Owner / Menedżer Projektu:**
  - Definiowanie priorytetów funkcjonalności do testowania.
  - Przeprowadzanie testów akceptacyjnych (UAT).
  - Podejmowanie decyzji dotyczących akceptacji ryzyka związanego z niepoprawionymi błędami o niższym priorytecie.

## 10. Procedury Raportowania Błędów

Wszystkie znalezione błędy będą raportowane w dedykowanym systemie śledzenia błędów (np. Jira, GitHub Issues). Każdy raport błędu powinien zawierać co najmniej:

- **Tytuł:** Krótki, zwięzły opis problemu.
- **Środowisko:** W którym środowisku błąd wystąpił (np. Lokalnie, Staging, Produkcja, przeglądarka/OS).
- **Kroki do Reprodukcji:** Numerowana lista kroków pozwalająca jednoznacznie odtworzyć błąd.
- **Obecny Rezultat:** Co faktycznie się dzieje po wykonaniu kroków.
- **Oczekiwany Rezultat:** Co powinno się wydarzyć zgodnie ze specyfikacją/oczekiwaniami.
- **Priorytet/Waga (Severity):** Określenie wpływu błędu na działanie aplikacji (np. Blocker, Critical, Major, Minor, Trivial).
- **Załączniki (opcjonalnie):** Zrzuty ekranu, nagrania wideo, logi z konsoli przeglądarki lub serwera.
- **Przypisanie:** Osoba odpowiedzialna za naprawę (początkowo może być nieprzypisane).

**Cykl życia błędu:**

1.  **Nowy (New/Open):** Zgłoszony błąd oczekuje na analizę.
2.  **W Analizie (In Analysis/Triage):** Błąd jest analizowany, priorytetyzowany i przypisywany do dewelopera.
3.  **Do Zrobienia (To Do/Assigned):** Deweloper ma przydzielone zadanie naprawy.
4.  **W Trakcie (In Progress):** Deweloper pracuje nad poprawką.
5.  **Do Weryfikacji (Resolved/Ready for QA):** Poprawka została zaimplementowana i wdrożona na środowisko testowe.
6.  **Weryfikowany (In Verification):** Inżynier QA sprawdza, czy błąd został poprawnie naprawiony.
7.  **Zamknięty (Closed):** Błąd został pomyślnie zweryfikowany.
8.  **Ponownie Otwarty (Reopened):** Jeśli weryfikacja wykazała, że błąd nadal występuje.
