# Specyfikacja Modułu Autentykacji w AltImageOptimizer

## 1. ARCHITEKTURA INTERFEJSU UŻYTKOWNIKA

### Strony i Layouty

- Dodanie dedykowanych stron Astro:
  - `/pages/auth/login` – strona logowania z formularzem do podania adresu email i hasła.
  - `/pages/auth/register` – strona rejestracji z formularzem do podania adresu email, hasła i potwierdzenia hasła.
  - `/pages/auth/password-recovery` – strona odzyskiwania hasła, umożliwiająca wprowadzenie adresu email do wysłania linku resetującego.
- Modyfikacja głównego layoutu (`@Layout.astro`):

  - Dynamiczne wyświetlanie przycisków w prawym górnym rogu:
    - Dla niezalogowanych użytkowników: przyciski "Login" i "Rejestracja".
    - Dla zalogowanych użytkowników: przycisk "Wyloguj się".
  - Zabezpieczenie stron wymagających autentykacji (np. historia optymalizacji, kolekcje) poprzez przekierowanie niezalogowanych użytkowników do strony logowania.

- Uwaga dotycząca dostępu:
  - Strony umożliwiające przesyłanie pojedynczych obrazów (ad-hoc upload) pozostają dostępne publicznie.
  - Natomiast widoki historii optymalizacji oraz kolekcji są zabezpieczone i dostępne tylko dla użytkowników zalogowanych.

### Komponenty i Integracja React/Astro

- Formularze logowania, rejestracji oraz odzyskiwania hasła będą implementowane jako komponenty React z użyciem Shadcn/ui, aby zapewnić spójność stylistyczną.
- Astro odpowiada za routing oraz server-side rendering (SSR) dedykowanych stron autoryzacji.
- Komponenty React będą integrowane w stronach Astro i komunikować się z backendem za pomocą zapytań (fetch) do dedykowanych API endpointów.
- Wdrożenie mechanizmu React Context do zarządzania stanem autentykacji po stronie klienta.

### Walidacja i Komunikaty Błędów

- Walidacja po stronie klienta:
  - Sprawdzanie poprawności formatu email.
  - Weryfikacja obecności oraz zgodności haseł (dla rejestracji).
- Walidacja po stronie serwera:
  - Użycie bibliotek takich jak Zod lub Yup do walidacji i sanitizacji danych wejściowych.
- Komunikaty błędów:
  - Natychmiastowe informowanie użytkownika o błędach, np.: "Nieprawidłowy format email", "Hasła nie są zgodne".
  - Obsługa błędów po stronie API z odpowiednimi statusami HTTP (np. 400, 401, 500).

### Obsługa Scenariuszy

- Proces rejestracji: przesłanie prawidłowych danych, utworzenie konta oraz przekierowanie do strefy zalogowanego użytkownika.
- Proces logowania: weryfikacja danych, utworzenie sesji oraz dynamiczna zmiana widoku layoutu na widok dla zalogowanych użytkowników.
- Proces odzyskiwania hasła: wprowadzenie prawidłowego adresu email, wysłanie linku resetującego oraz informacja o powodzeniu operacji.
- Obsługa błędów: wyświetlanie komunikatów o błędach w przypadku nieprawidłowych danych lub problemów technicznych.

## 2. LOGIKA BACKENDOWA

### Struktura API

- `src/pages/api/auth/register.ts` – endpoint do rejestracji:
  - Przyjmuje: email, hasło oraz potwierdzenie hasła.
  - Walidacja danych wejściowych i integracja z Supabase Auth do tworzenia konta.
- `src/pages/api/auth/login.ts` – endpoint do logowania:
  - Przyjmuje: email i hasło.
  - Weryfikuje dane, inicjuje sesję i zwraca token lub odpowiedni status.
- `src/pages/api/auth/logout.ts` – endpoint do wylogowania:
  - Usuwa aktywną sesję użytkownika.
- `src/pages/api/auth/password-recovery.ts` – endpoint do odzyskiwania hasła:
  - Przyjmuje: email i inicjuje proces wysyłki linku resetującego.

### Walidacja i Obsługa Wyjątków

- Walidacja wejściowa:
  - Użycie bibliotek (Zod lub Yup) do walidacji formatu email, długości i złożoności hasła.
- Obsługa wyjątków:
  - Centralne middleware do obsługi błędów, zwracające odpowiednie statusy HTTP (400, 401, 500).
  - Logowanie błędów w systemie oraz zwracanie przyjaznych komunikatów dla użytkownika.

### Renderowanie Stron i Middleware

- Konfiguracja Astro:
  - Aktualizacja `@astro.config.mjs` w celu wsparcia SSR oraz zarządzania sesjami użytkowników.
- Middleware autoryzacyjne:
  - Weryfikacja sesji użytkownika przy dostępie do stron wymagających autentykacji.
  - Przekierowanie niezalogowanych użytkowników do strony logowania.

## 3. SYSTEM AUTENTYKACJI

### Integracja z Supabase Auth

- Konfiguracja klienta Supabase:
  - Utworzenie pliku `src/db/supabaseClient.ts` z konfiguracją i importem zmiennych środowiskowych niezbędnych do autentykacji.
- Rejestracja i logowanie:
  - W API wykorzystanie metod Supabase Auth do tworzenia kont, logowania oraz zarządzania sesjami.
- Odzyskiwanie hasła:
  - Implementacja funkcjonalności Supabase do wysyłki emaila resetującego w razie żądania odzyskania hasła.
- Zabezpieczenie endpointów:
  - Weryfikacja sesji użytkownika przy korzystaniu z API modyfikujących dane (np. historia, kolekcje).
- Zarządzanie sesją:
  - Przechowywanie tokenów na froncie oraz ich okresowe odświeżanie, zapewniające ciągłość sesji.

## Kluczowe Wnioski

- Interfejs użytkownika musi być spójny z resztą aplikacji, wykorzystując komponenty Shadcn/ui oraz mechanizmy React do zarządzania stanem autentykacji.
- Kluczowe jest zapewnienie walidacji i obsługi błędów zarówno po stronie klienta, jak i serwera, co gwarantuje bezpieczeństwo i niezawodność procesu autoryzacji.
- API backendowe powinno być modularne, z dedykowanymi endpointami dla każdej funkcji (rejestracja, logowanie, wylogowanie, odzyskiwanie hasła).
- System autentykacji oparty na Supabase Auth ułatwia integrację z istniejącą architekturą i zapewnia spójność procesu zarządzania użytkownikami.
- Middleware autoryzacyjne w Astro zabezpieczą strony wymagające logowania, integrując się z globalnym layoutem aplikacji.
