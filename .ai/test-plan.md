# Plan Testów dla projektu AltImageOptimizer

## 1. Wprowadzenie i cele testowania

Celem testów jest zapewnienie wysokiej jakości, niezawodności i bezpieczeństwa aplikacji AltImageOptimizer. Testy zweryfikują:

- Poprawność kluczowych funkcjonalności (upload, AI, CRUD historii).
- Stabilność integracji z usługami zewnętrznymi (Supabase, Openrouter.ai, Sharp).
- Bezpieczeństwo autoryzacji i prywatności danych.
- Wydajność przetwarzania obrazów i odpowiedzi API.
- Spójność interfejsu użytkownika.

## 2. Zakres testów

Obejmuje warstwę backend (API, baza danych), frontend (UI, komponenty React/Astro), integrację z serwisami zewnętrznymi oraz pipeline CI/CD:

- Testy jednostkowe i integracyjne serwisów i endpointów.
- Testy E2E przepływów użytkownika przez UI.
- Testy wydajnościowe przetwarzania obrazów.
- Testy bezpieczeństwa i autoryzacji.
- Testy regresyjne wizualne UI.

## 3. Typy testów do przeprowadzenia

1. **Testy jednostkowe** (Vitest, React Testing Library):
   - Funkcje walidacji plików.
   - Moduły serwisów AI i Sharp (z mockingiem).
   - Komponenty React formularzy.
   - Komponenty Astro (w razie potrzeby przy użyciu Vitest lub Playwright).
2. **Testy integracyjne** (Vitest, testowa baza Supabase):
   - Endpointy w `src/pages/api` (upload, generowanie alt, CRUD historii).
   - Interakcja z Supabase Auth i SDK.
   - Mockowanie żądań HTTP (np. za pomocą msw).
3. **Testy end-to-end** (Playwright):
   - Rejestracja, logowanie, wylogowanie.
   - Upload obrazu, generowanie alt textu, podgląd i zatwierdzanie.
   - Przeglądanie i edycja historii optymalizacji.
4. **Testy wydajnościowe** (k6, Artillery):
   - Przetwarzanie obrazów w Sharp (różne rozmiary).
   - Obciążenie API uploadu i generowania alt.
5. **Testy bezpieczeństwa**:
   - Próby dostępu do historii bez autoryzacji.
   - Testy na SQL Injection / XSS w polach tekstowych.
6. **Testy regresyjne wizualne** (Percy):
   - Kluczowe strony: formularz uploadu, lista historii, strona wyników.
7. **Testy dostępności (a11y)**:
   - Automatyczne skanowanie pod kątem naruszeń WCAG (np. za pomocą axe-core w Playwright).

## 4. Scenariusze testowe dla kluczowych funkcjonalności

### 4.1 Rejestracja i logowanie

- Poprawna rejestracja nowego użytkownika.
- Weryfikacja wymaganych pól (email, hasło).
- Logowanie poprawnymi i niepoprawnymi danymi.
- Obsługa wygaśnięcia sesji.

### 4.2 Upload i optymalizacja obrazu

- Upload pliku JPG, PNG w różnych rozmiarach (0.5–10 MB).
- Odrzucenie nieobsługiwanych formatów (GIF, TIFF, PDF).
- Walidacja wymiarów i rozmiaru.
- Sprawdzenie retry przy timeout AI.
- Weryfikacja wyniku AI (alt text, nazwa SEO).

### 4.3 CRUD historii optymalizacji

- Wyświetlanie listy historii powiązanej z użytkownikiem.
- Edycja alt textu i nazwy pliku, zapis w DB.
- Usuwanie pozycji historii z potwierdzeniem.
- Brak dostępu do historii innych użytkowników.

### 4.4 Integracja z AI i Sharp

- Odpowiedź AI w scenariuszach sukcesu i błędu.
- Konwersja do WebP, zmiana rozmiaru, kompresja jakości 85.
- Zachowanie metadanych EXIF.

## 5. Środowisko testowe

- Oddzielne środowisko testowe Supabase (baza testowa + auth sandbox).
- Mocki Openrouter.ai do testów jednostkowych; sandbox / staging AI.
- Dedykowany serwer testowy dla Sharp (lokalny Docker).
- Przeglądarki: Chrome, Firefox, WebKit/Safari (mobilne i desktop - zwłaszcza przy użyciu Playwright).
- CI: GitHub Actions uruchamiające testy przy każdym PR.
- Strategia zarządzania danymi testowymi (np. seeding, czyszczenie danych).

## 6. Narzędzia do testowania

- **Vitest** + **React Testing Library** – testy jednostkowe/komponentów React.
- **Vitest** – integracyjne testy API.
- **Playwright** – testy end-to-end.
- **msw (Mock Service Worker)** – mockowanie żądań HTTP.
- **k6** / **Artillery** – testy wydajnościowe.
- **Percy** – testy wizualne regresyjne.
- **axe-core** – testy dostępności (integrowane z E2E).
- **ESLint**, **tsc** – statyczne analizy i typy.
- **GitHub Actions** – automatyzacja pipeline.

## 7. Harmonogram testów

| Faza                 | Czas trwania | Zakres                                      |
| -------------------- | ------------ | ------------------------------------------- |
| Przygotowanie        | 1 tydzień    | Konfiguracja środowisk, narzędzi, mocków    |
| Testy jednostkowe    | 2 tygodnie   | Wszystkie moduły serwisów, komponenty React |
| Testy integracyjne   | 1 tydzień    | Endpointy API, baza Supabase                |
| Testy E2E            | 2 tygodnie   | Kluczowe ścieżki użytkownika                |
| Testy wydajnościowe  | 1 tydzień    | Obciążenie API i Sharp                      |
| Testy bezpieczeństwa | 1 tydzień    | Ataki, dostęp bez autoryzacji               |
| Testy wizualne       | 1 tydzień    | Regression UI                               |
| Bufor i raport       | 1 tydzień    | Naprawa krytycznych błędów, dokumentacja    |
| Łącznie              | ~9 tygodni   |                                             |

## 8. Kryteria akceptacji testów

- 100% testów jednostkowych z pokryciem krytycznych modułów ≥ 80%.
- Wszystkie testy integracyjne i E2E zielone na środowisku CI.
- Brak krytycznych luk bezpieczeństwa (po testach pentest).
- Czas odpowiedzi API ≤ 500 ms dla 90% zapytań testowych.
- Brak regresji wizualnych na kluczowych stronach.

## 9. Role i odpowiedzialności

- **QA Engineer**: pisanie i utrzymanie testów, analiza wyników, raporty.
- **Developer**: implementacja poprawek, wsparcie w stabilizacji środowiska testowego.
- **DevOps**: konfiguracja i utrzymanie CI/CD, środowisk testowych.
- **Product Owner**: weryfikacja kryteriów akceptacji, priorytety błędów.

## 10. Procedury raportowania błędów

1. Błąd zgłaszany w JIRA/GitHub Issues z: krokiem reprodukcji, oczekiwanym i rzeczywistym wynikiem, zrzutami ekranu/logami.
2. Priorytetyzacja błędu (Critical, High, Medium, Low).
3. Automatyczne przypisanie do zespołu odpowiedzialnego.
4. Retrospektywa raz w tygodniu w celu omówienia statusu krytycznych defektów.
