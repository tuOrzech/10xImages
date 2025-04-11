# Dokument wymagań produktu (PRD) - AltImageOptimizer

## 1. Przegląd produktu
Opis: Aplikacja AltImageOptimizer to narzędzie służące do wspomagania optymalizacji obrazów na stronach internetowych. Aplikacja umożliwia użytkownikowi przesłanie pojedynczego pliku obrazu (JPG, PNG), wprowadzenie uniwersalnego kontekstu dla obrazu oraz generuje sugestie dotyczące tekstu alternatywnego i nazwy pliku przy użyciu AI. System zapisuje również historię działań optymalizacyjnych oraz umożliwia ich edycję i usuwanie. Dodatkowo, w aplikacji uwzględniono prosty system autentykacji, aby zapisywać historię optymalizacji powiązaną z konkretnym użytkownikiem.

## 2. Problem użytkownika
Użytkownicy stron internetowych borykają się z problemem nieoptymalizowanych plików multimedialnych, co negatywnie wpływa na SEO, szybkość ładowania strony, UX/UI oraz dostępność zgodną z WCAG 2.1. Brak automatyzacji w procesie optymalizacji zmusza użytkowników do ręcznego zarządzania opisami, formatami i nazwami plików, co jest czasochłonne i naraża na błędy.

## 3. Wymagania funkcjonalne
- Umożliwienie przesłania pojedynczego pliku obrazu w formatach JPG i PNG.
- Walidacja plików w dwóch etapach: wstępna (na podstawie rozszerzenia i rozmiaru) oraz ostateczna (sprawdzenie MIME i faktycznego rozmiaru).
- Umożliwienie wprowadzenia uniwersalnego kontekstu dla obrazu (np. główny temat, podmiot, opcjonalne słowa kluczowe).
- Integracja z AI, która generuje sugestię tekstu alternatywnego (alt text) oraz proponowaną nazwę pliku na podstawie przesłanego obrazu i kontekstu.
- Prezentacja sugestii alt text i nazwy pliku w interfejsie użytkownika bezpośrednio po przetworzeniu.
- Automatyczne zapisywanie historii optymalizacji w bazie danych, zawierającej: oryginalną nazwę pliku, wprowadzony kontekst, wygenerowane sugestie oraz znacznik czasu.
- Zapewnienie funkcjonalności przeglądania, edytowania i usuwania wpisów historii optymalizacji.
- Implementacja systemu autentykacji (np. Supabase Auth) dla zabezpieczenia dostępu do historii optymalizacji.

## 4. Granice produktu
- Konwersja formatu obrazu (np. do WebP) lub zmiana rozmiaru obrazu nie jest częścią MVP.
- Aplikacja nie umożliwia bezpośredniego zapisywania, nadpisywania lub pobierania zmodyfikowanego pliku; jedynie sugeruje zmiany.
- Brak wsparcia dla wsadowego przetwarzania wielu plików jednocześnie.
- Zaawansowane zabezpieczenia, takie jak rate limiting czy ochrona DoS, nie są wdrażane w tej wersji.
- Integracje z zewnętrznymi systemami CMS, eksport historii do CSV oraz centralne logowanie pozostają poza zakresem MVP.
- Specyficzne pola metadanych dla konkretnych branż nie są przewidziane w MVP.

## 5. Historyjki użytkowników
- US-001
  - Tytuł: Przesyłanie obrazu i generowanie sugestii
  - Opis: Użytkownik przesyła pojedynczy obraz (JPG lub PNG) wraz z uniwersalnym kontekstem. System weryfikuje plik, wysyła dane do AI, generuje alt text oraz sugestię nazwy pliku, a następnie zapisuje wynik w historii.
  - Kryteria akceptacji:
    - Użytkownik przesyła obraz i wprowadza kontekst.
    - System waliduje plik (rozszerzenie, rozmiar, MIME).
    - AI generuje poprawny alt text oraz sugerowaną nazwę pliku.
    - Wynik jest wyświetlany i zapisywany w historii wraz z timestamp.

- US-002
  - Tytuł: Przeglądanie historii optymalizacji
  - Opis: Użytkownik przegląda historię swoich działań optymalizacyjnych. Widok historii wyświetla listę wpisów z informacjami o dacie, oryginalnej nazwie pliku, wygenerowanym alt text oraz nazwie pliku.
  - Kryteria akceptacji:
    - Historie są wyświetlane w interfejsie w uporządkowanej formie (np. sortowanie według daty).
    - Każdy wpis zawiera wszystkie istotne informacje.

- US-003
  - Tytuł: Edycja wpisu w historii
  - Opis: Użytkownik ma możliwość edycji wygenerowanego alt text oraz sugerowanej nazwy pliku w istniejącym wpisie historii.
  - Kryteria akceptacji:
    - Interfejs umożliwia modyfikację pól sugestii.
    - System zapisuje zmienione dane w bazie danych.
    - Zmiana jest widoczna po odświeżeniu widoku historii.

- US-004
  - Tytuł: Usuwanie wpisu z historii
  - Opis: Użytkownik może usunąć wybrany wpis historii optymalizacji, po uprzednim potwierdzeniu.
  - Kryteria akceptacji:
    - System prosi o potwierdzenie przed usunięciem wpisu.
    - Po potwierdzeniu wpis zostaje usunięty z bazy danych i nie jest wyświetlany w historii.

- US-005
  - Tytuł: Autentykacja użytkownika
  - Opis: Użytkownik musi się zalogować, aby korzystać z funkcji zarządzania historią optymalizacji. System zabezpiecza dane użytkownika i zapewnia dostęp tylko po poprawnej autentykacji.
  - Kryteria akceptacji:
    - Użytkownik ma możliwość logowania, rejestracji i wylogowania.
    - Historia optymalizacji jest widoczna tylko dla zalogowanych użytkowników.

- US-006
  - Tytuł: Obsługa błędów i fallback AI
  - Opis: W przypadku nieprawidłowego działania AI lub problemów z przetwarzaniem pliku, system wyświetla czytelne komunikaty błędów i sugeruje ponowienie próby.
  - Kryteria akceptacji:
    - W przypadku błędów przetwarzania wystawia się komunikat informujący użytkownika o problemie.
    - System umożliwia ponowne przesłanie obrazu lub modyfikację kontekstu po wystąpieniu błędu.

## 6. Metryki sukcesu
- Trafność generowanego alt textu w ponad 75% przypadków.
- 100% zgodności proponowanej nazwy pliku z ustaloną logiką bezpieczeństwa.
- Użytkownik jest w stanie pomyślnie przejść każdy z głównych przepływów (upload, generowanie sugestii, zapis do historii, edycja, usuwanie).
- Średni czas przetwarzania jednego obrazu nie przekracza 10-15 sekund.
- Testy jednostkowe kluczowych funkcji (walidacja plików, parsowanie odpowiedzi AI) przechodzą pomyślnie.
