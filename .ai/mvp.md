# Aplikacja - AltImageOptimizer (MVP - Wersja Finalna z CRUD)

## Główny problem
Własne strony internetowe często cierpią z powodu nieoptymalizowanych plików multimedialnych, co negatywnie wpływa na SEO, szybkość ładowania, UX/UI oraz dostępność zgodną z WCAG 2.1. Brak automatyzacji w procesie optymalizacji obrazów powoduje, że właściciele stron muszą ręcznie zarządzać opisami, formatami i nazwami plików, co jest czasochłonne i podatne na błędy.

## Najmniejszy zestaw funkcjonalności
1. **Przetwarzanie Obrazu i Generowanie Sugestii:**
   * **UI:** Umożliwia przesłanie **pojedynczego** pliku obrazu (np. JPG, PNG).
   * **UI:** Zawiera proste pola tekstowe do wprowadzenia przez użytkownika **uniwersalnego kontekstu** dla obrazu (np. `Główny Temat/Podmiot`, `Opcjonalne Słowa Kluczowe`).
   * **Backend:** Przyjmuje obraz i kontekst.
   * **Backend:** Komunikuje się z AI (np. GPT-4o-mini) w celu wygenerowania opisu wizualnego i listy słów kluczowych.
   * **Backend:** Generuje `sugerowany tekst alternatywny (alt text)` i `sugerowaną nazwę pliku` (łącząc dane od użytkownika i AI, zapewniając bezpieczeństwo i limit długości).
   * **UI:** Wyświetla **bezpośrednio po przetworzeniu** wygenerowane sugestie (alt text, nazwa pliku).

2. **Zarządzanie Historią Optymalizacji (CRUD):**
   * **Backend (Create):** Automatycznie zapisuje wyniki każdego pomyślnego przetworzenia (oryginalna nazwa, kontekst użytkownika, sugestie AI, timestamp) jako nowy rekord w bazie danych (w tabeli np. `optimization_jobs`) powiązany z zalogowanym użytkownikiem.
   * **UI (Read):** Dedykowana sekcja/widok "Historia" wyświetlająca listę poprzednich zadań optymalizacji użytkownika (np. data, oryg. nazwa, alt text, nazwa pliku).
   * **UI (Update):** W widoku "Historia" umożliwia użytkownikowi **edycję** zapisanych pól `generated_alt_text` i `generated_filename_suggestion` dla wybranego rekordu.
   * **Backend (Update):** Zapisuje zmiany wprowadzone przez użytkownika w edytowanym rekordzie historii.
   * **UI (Delete):** W widoku "Historia" umożliwia użytkownikowi **usunięcie** wybranego rekordu (z potwierdzeniem).
   * **Backend (Delete):** Usuwa wskazany rekord z bazy danych.

3. **Autentykacja:**
   * Prosty system kont użytkowników (np. z użyciem Supabase Auth) do powiązania historii zadań z użytkownikiem.

## Co NIE wchodzi w zakres MVP
* **Konwersja formatu obrazu (np. do WebP) i zmiana rozmiaru.**
* Bezpośrednie zapisywanie/nadpisywanie/pobieranie zmodyfikowanego pliku (MVP tylko sugeruje zmiany i zapisuje je w historii).
* Przetwarzanie wsadowe wielu plików.
* *Usunięto ograniczenie edycji* (ponieważ jest teraz częścią CRUD).
* Integracje z CMS, zaawansowane raporty, funkcje społecznościowe.
* Specyficzne pola metadanych dla konkretnych branż (np: `artist`, `event`).
* Funkcja eksportu historii do CSV (może być dodana *po* MVP).

## Kryteria sukcesu
* Użytkownik może pomyślnie zakończyć przepływ: upload obrazu -> wprowadzenie kontekstu -> otrzymanie sugestii alt text i nazwy pliku -> **wynik zostaje zapisany w historii**.
* Użytkownik może **przeglądać** swoją historię optymalizacji.
* Użytkownik może **edytować** sugerowany alt text i nazwę pliku w istniejącym wpisie historii.
* Użytkownik może **usunąć** wpis z historii.
* Wygenerowany przez AI alt text jest w >75% przypadków trafny wizualnie i spełnia podstawowe wymogi dostępności (weryfikowane przez dewelopera podczas testów).
* Sugerowana nazwa pliku jest generowana zgodnie z ustaloną logiką, zawiera dane od użytkownika i elementy z AI, jest bezpieczna dla URL/systemu plików (weryfikowane przez dewelopera).