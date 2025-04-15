# Architektura UI dla AltImageOptimizer

## 1. Przegląd struktury UI

Aplikacja AltImageOptimizer wykorzystuje nowoczesny, responsywny interfejs oparty o Astro, React, Tailwind i komponenty z biblioteki Shadcn/ui. Globalny układ składa się z górnego paska nawigacyjnego (zawierającego logo, linki do kluczowych widoków, avatar użytkownika, opcję wylogowania oraz wskaźnik statusu), kontenera głównego dla poszczególnych widoków oraz systemu powiadomień (toasty i modale) oraz mechanizmu obsługi błędów (ErrorBoundary). Układ ten zapewnia spójność, dostępność i bezpieczeństwo interfejsu, odpowiadając wymaganiom produktu oraz API.

## 2. Lista widoków

- **Ekran logowania**

  - Ścieżka: `/login`
  - Główny cel: Uwierzytelnienie użytkownika
  - Kluczowe informacje: Formularz logowania, opcjonalnie obsługa 2FA, komunikaty o błędach
  - Kluczowe komponenty: Formularz logowania, przycisk submit, linki do rejestracji/odzyskiwania hasła
  - Uwagi: Zabezpieczenie danych, ochrona tras przy użyciu HOC/PrivateRoute, dostępność poprzez odpowiednie etykiety ARIA

- **Dashboard**

  - Ścieżka: `/dashboard`
  - Główny cel: Przegląd najnowszych działań oraz szybki dostęp do kluczowych funkcji
  - Kluczowe informacje: Podsumowanie ostatnich optymalizacji, alerty, status przetwarzania, szybkie linki do przesyłania, historii oraz ustawień
  - Kluczowe komponenty: Karty informacyjne, wskaźniki statusu, wykresy lub listy
  - Uwagi: Responsywny design, wysoka czytelność, bezpieczeństwo danych

- **Panel przesyłania plików**

  - Ścieżka: `/upload`
  - Główny cel: Umożliwienie użytkownikowi przesłania obrazu oraz wprowadzenia kontekstu optymalizacji
  - Kluczowe informacje: Formularz przesyłania plików, walidacja rozmiaru, formatu, MIME oraz wymiarów obrazu
  - Kluczowe komponenty: Komponent do przesyłania plików, podgląd obrazu, formularz walidacji w locie
  - Uwagi: Natychmiastowa walidacja, prezentacja komunikatów błędów poprzez toasty, wsparcie dla JPEG, PNG i WebP

- **Podgląd i edycja optymalizacji obrazu**

  - Ścieżka: `/preview`
  - Główny cel: Prezentacja wyników optymalizacji oraz umożliwienie modyfikacji wygenerowanego alt textu i nazwy pliku
  - Kluczowe informacje: Podgląd przesłanego obrazu, wyświetlenie wygenerowanego alt textu i sugestii nazwy pliku, ewentualne komunikaty o błędach
  - Kluczowe komponenty: Panele edycji, pola tekstowe, przyciski zatwierdzające modyfikacje i powrotu
  - Uwagi: Interfejs umożliwiający edycję inline, szybka reakcja na akcje użytkownika

- **Panel optymalizacji (zaawansowane funkcje)**

  - Ścieżka: `/advanced`
  - Główny cel: Dostęp do zaawansowanych opcji optymalizacyjnych, takich jak zmiana formatu, rozmiaru, jakości obrazu czy metadanych
  - Kluczowe informacje: Kontrolki ustawień optymalizacji, podgląd zmian w czasie rzeczywistym, dodatkowe informacje diagnostyczne
  - Kluczowe komponenty: Formularze z opcjami zaawansowanymi, suwaki, selektory opcji, modalne okna potwierdzenia
  - Uwagi: Funkcjonalność oddzielona od głównego przepływu, czytelne komunikaty oraz testy dostępności zgodne z WCAG 2.1

- **Panel użytkownika oraz ustawienia konta**

  - Ścieżka: `/account`
  - Główny cel: Zarządzanie profilem użytkownika, przegląd oraz edycja historii optymalizacji
  - Kluczowe informacje: Dane profilu, lista historii optymalizacji z opcjami edycji, usunięcia i ponownej optymalizacji
  - Kluczowe komponenty: Tabele lub listy, formularze edycji, przyciski akcji
  - Uwagi: Bezpieczne zarządzanie danymi, responsywność i zgodność z zasadami bezpieczeństwa

- **Widoki błędów (404/500)**
  - Ścieżka: `/404`, `/500`
  - Główny cel: Informowanie użytkownika o nieistniejących stronach lub błędach serwera oraz przekierowywanie do właściwych widoków
  - Kluczowe informacje: Przyjazne komunikaty błędów, instrukcje dotyczące dalszych kroków
  - Kluczowe komponenty: Komponenty ErrorBoundary, przyciski przekierowania, linki do strony głównej
  - Uwagi: Jasne komunikaty, zgodność z WCAG, intuicyjna nawigacja po wystąpieniu błędów

## 3. Mapa podróży użytkownika

1. Użytkownik otwiera stronę i trafia na ekran logowania.
2. Po poprawnym uwierzytelnieniu następuje przekierowanie do dashboardu.
3. Na dashboardzie użytkownik wybiera opcję przesyłania pliku i przechodzi do panelu przesyłania.
4. W panelu przesyłania, użytkownik wybiera plik, wprowadza kontekst oraz obserwuje walidację w locie.
5. Po zatwierdzeniu przesyłania, użytkownik monitoruje status przetwarzania (użycie paska postępu, toasty informujące o statusie, mechanizm retry w przypadku błędów).
6. Po zakończeniu optymalizacji, użytkownik jest przekierowywany do widoku podglądu i edycji, gdzie może sprawdzić i ewentualnie zmodyfikować wygenerowany alt text i sugestię nazwy pliku.
7. Użytkownik może zapisać zmiany i powrócić do dashboardu lub przejść do panelu historii, aby zarządzać poprzednimi optymalizacjami (edycja, usunięcie, ponowne optymalizowanie).
8. W przypadku wystąpienia błędów, użytkownik jest informowany poprzez jasne komunikaty błędów (bądź modalne okna) oraz ma możliwość ponownego przesłania pliku lub przejścia do stron błędów 404/500.

## 4. Układ i struktura nawigacji

Główna nawigacja jest umieszczona w górnym pasku, widocznym we wszystkich widokach po zalogowaniu. Składa się z:

- Logo i nazwy produktu (AltImageOptimizer).
- Linków do kluczowych widoków: Dashboard, Upload, Advanced, Account.
- Ikony użytkownika z awatarem i opcją wylogowania.
- Wskaźnika statusu połączenia (np. informujący o problemach z siecią).
- Responsywnego menu (np. hamburger menu) dla urządzeń mobilnych.

## 5. Kluczowe komponenty

- **Formularz logowania** - zarządza uwierzytelnianiem, opcjonalnie 2FA, walidacją oraz wyświetlaniem komunikatów o błędach.
- **Komponent przesyłania plików** - umożliwia wybór pliku, natychmiastową walidację (rozmiar, typ, MIME, wymiary) oraz podgląd obrazu przed przesłaniem.
- **Pasek postępu** - prezentuje bieżący status przetwarzania obrazu, wykorzystywany w trakcie przesyłania i optymalizacji.
- **Komponent edycji** - pozwala na modyfikację wygenerowanego alt textu i nazwy pliku w widoku podglądu.
- **Lista/tabela historii optymalizacji** - prezentuje wcześniejsze optymalizacje z możliwością edycji, usunięcia oraz ponownego optymalizowania wybranych zadań.
- **Globalny navbar** - zawiera linki do kluczowych widoków, informacje o użytkowniku oraz wskaźnik statusu połączenia.
- **Toast notifications i modale** - służą do wyświetlania potwierdzeń akcji, komunikatów błędów oraz mechanizmów retry.
- **ErrorBoundary** - globalny komponent przechwytujący nieoczekiwane błędy, zapewniający przyjazne komunikaty i bezpieczne przekierowania.
