# Plan implementacji widoku Podgląd i edycja optymalizacji obrazu

## 1. Przegląd

Widok "Podgląd i edycja optymalizacji obrazu" ma na celu prezentację wyników przetwarzania obrazu (wygenerowany tekst alternatywny i sugestia nazwy pliku) bezpośrednio po jego przesłaniu i przetworzeniu przez AI. Umożliwia użytkownikowi przeglądanie sugestii, edycję ich oraz zapisanie zmian w bazie danych. Widok obsługuje również wyświetlanie stanu przetwarzania oraz ewentualnych błędów.

## 2. Routing widoku

Widok będzie dostępny pod dynamiczną ścieżką: `/preview/[id]`, gdzie `[id]` to unikalny identyfikator (UUID) zadania optymalizacji (`optimization_job`).

## 3. Struktura komponentów

Widok zostanie zaimplementowany jako strona Astro (`src/pages/preview/[id].astro`), która będzie renderować główny komponent React (`PreviewComponent`) po stronie klienta.

```
src/pages/preview/[id].astro (Server Component - handles routing, initial data fetching/passing ID)
  └── src/components/PreviewComponent.tsx (React Client Component - client:load)
      ├── LoadingIndicator (Shared component)
      ├── ErrorDisplay (Shared component)
      ├── ImageDisplay
      │   └── img (HTML element)
      ├── SuggestionPanel
      │   ├── EditableField (for Alt Text)
      │   │   ├── DisplayText
      │   │   └── InputField + ActionButtons (Save/Cancel)
      │   ├── EditableField (for Filename Suggestion)
      │   │   ├── DisplayText
      │   │   └── InputField + ActionButtons (Save/Cancel)
      │   └── (Optional) DisplayAIKeywords
      └── ActionButtons
          ├── SaveButton (Saves all changes)
          ├── BackButton (Navigates away)
          └── (Optional) RetryButton (if job failed)
```

## 4. Szczegóły komponentów

### PreviewComponent (React Client Component)

- **Opis komponentu**: Główny komponent widoku, odpowiedzialny za pobieranie danych zadania optymalizacji na podstawie ID z URL, zarządzanie stanem edycji, wyświetlanie podglądu obrazu, sugestii oraz obsługa interakcji użytkownika (edycja, zapis, ponowienie próby). Renderowany po stronie klienta (`client:load`).
- **Główne elementy**: Wykorzystuje komponenty podrzędne (`LoadingIndicator`, `ErrorDisplay`, `ImageDisplay`, `SuggestionPanel`, `ActionButtons`) do budowy interfejsu. Zarządza logiką pobierania danych (`useEffect` hook) i aktualizacji (`handleSave`, `handleRetry`).
- **Obsługiwane interakcje**: Pobieranie danych przy ładowaniu, przełączanie trybu edycji dla pól tekstowych, aktualizacja stanu przy zmianie wartości w polach edycji, zapisywanie zmian (wywołanie API PATCH), ponawianie zadania (wywołanie API POST /retry), nawigacja powrotna.
- **Obsługiwana walidacja**: Sprawdza stan zadania (`status`) w celu warunkowego wyświetlania elementów (np. przycisk Retry). Waliduje odpowiedź API pod kątem błędów (4xx, 5xx). Przycisk "Zapisz zmiany" jest aktywny tylko, gdy dokonano modyfikacji.
- **Typy**: `PreviewViewModel` (stan lokalny), `OptimizationJobDTO` (dane z API), `UpdateOptimizationJobCommandDTO` (payload dla PATCH API).
- **Propsy**: `jobId: string` (przekazane z Astro page).

### LoadingIndicator

- **Opis komponentu**: Współdzielony komponent wyświetlający wizualny wskaźnik ładowania (np. spinner), gdy aplikacja oczekuje na odpowiedź API (pobieranie danych, zapisywanie zmian).
- **Główne elementy**: Element wizualny (np. SVG spinner, komponent Shadcn/ui).
- **Obsługiwane interakcje**: Brak.
- **Obsługiwana walidacja**: Brak.
- **Typy**: `boolean` (prop `isLoading`).
- **Propsy**: `isLoading: boolean`.

### ErrorDisplay

- **Opis komponentu**: Współdzielony komponent do wyświetlania komunikatów o błędach pochodzących z API lub walidacji. Może wykorzystywać komponent `Alert` z Shadcn/ui.
- **Główne elementy**: Kontener tekstowy z odpowiednim stylem (np. czerwony kolor, ikona błędu).
- **Obsługiwane interakcje**: Brak (może zawierać przycisk do zamknięcia).
- **Obsługiwana walidacja**: Brak.
- **Typy**: `string | null` (prop `errorMessage`).
- **Propsy**: `errorMessage: string | null`.

### ImageDisplay

- **Opis komponentu**: Wyświetla podgląd obrazu powiązanego z zadaniem optymalizacji. Pobiera URL obrazu na podstawie danych z `OptimizationJobDTO`.
- **Główne elementy**: Element `<img>` HTML.
- **Obsługiwane interakcje**: Brak.
- **Obsługiwana walidacja**: Brak (przeglądarka obsłuży błąd ładowania obrazu).
- **Typy**: `string | null` (prop `imageUrl`).
- **Propsy**: `imageUrl: string | null`.

### SuggestionPanel

- **Opis komponentu**: Kontener grupujący wyświetlanie i edycję sugestii AI (tekst alternatywny, nazwa pliku). Może również wyświetlać wykryte słowa kluczowe.
- **Główne elementy**: Sekcje dla alt textu i nazwy pliku, każda wykorzystująca komponent `EditableField`. Opcjonalna sekcja na `ai_detected_keywords`.
- **Obsługiwane interakcje**: Deleguje obsługę edycji i zapisu z `EditableField` do `PreviewComponent`.
- **Obsługiwana walidacja**: Brak.
- **Typy**: `OptimizationJobDTO` (do przekazania danych do `EditableField`), `Function` (callbacks `onAltTextChange`, `onFilenameChange`).
- **Propsy**: `job: OptimizationJobDTO | null`, `editedAltText: string | null`, `editedFilename: string | null`, `onAltTextChange: (value: string) => void`, `onFilenameChange: (value: string) => void`, `isEditingAlt: boolean`, `setIsEditingAlt: (isEditing: boolean) => void`, `isEditingFilename: boolean`, `setIsEditingFilename: (isEditing: boolean) => void`.

### EditableField

- **Opis komponentu**: Komponent wielokrotnego użytku do wyświetlania i edycji pojedynczego pola tekstowego. Posiada dwa stany: wyświetlania (tekst) i edycji (input + przyciski Zapisz/Anuluj).
- **Główne elementy**: Warunkowo renderowany tekst lub `Input` (Shadcn/ui) wraz z przyciskami `Button` (Shadcn/ui).
- **Obsługiwane interakcje**: Kliknięcie przycisku "Edytuj" (lub samego tekstu) przełącza do trybu edycji. Zmiana wartości w inpucie aktualizuje stan w `PreviewComponent`. Kliknięcie "Zapisz" w tym komponencie może być opcjonalne (główny przycisk "Zapisz Zmiany" w `ActionButtons` jest preferowany) lub może zapisywać pojedyncze pole. Kliknięcie "Anuluj" odrzuca zmiany i wraca do trybu wyświetlania.
- **Obsługiwana walidacja**: Może implementować prostą walidację (np. minimalna długość), chociaż główna walidacja jest po stronie API.
- **Typy**: `string` (label), `string | null` (value), `string | null` (editedValue), `Function` (onChange), `boolean` (isEditing), `Function` (setIsEditing).
- **Propsy**: `label: string`, `value: string | null`, `editedValue: string | null`, `onChange: (newValue: string) => void`, `isEditing: boolean`, `setIsEditing: (isEditing: boolean) => void`.

### ActionButtons

- **Opis komponentu**: Kontener na główne przyciski akcji dla widoku: "Zapisz Zmiany", "Powrót", "Ponów próbę" (warunkowo).
- **Główne elementy**: Przyciski `Button` (Shadcn/ui).
- **Obsługiwane interakcje**: Kliknięcie przycisku "Zapisz Zmiany" wywołuje `handleSave` w `PreviewComponent`. Kliknięcie "Powrót" nawiguje użytkownika (np. `history.back()` lub do `/account`). Kliknięcie "Ponów próbę" wywołuje `handleRetry`.
- **Obsługiwana walidacja**: Przycisk "Zapisz Zmiany" jest aktywny (`disabled={false}`) tylko, gdy `editedAltText` lub `editedFilename` różnią się od wartości początkowych z `job`. Przycisk "Ponów próbę" jest widoczny/aktywny tylko gdy `job?.status === 'failed'`.
- **Typy**: `Function` (prop `onSave`), `Function` (prop `onRetry`), `Function` (prop `onBack`), `boolean` (prop `canSave`), `boolean` (prop `canRetry`).
- **Propsy**: `onSave: () => void`, `onRetry: () => void`, `onBack: () => void`, `canSave: boolean`, `canRetry: boolean`, `isSaving: boolean`, `isRetrying: boolean`.

## 5. Typy

- **Istniejące typy DTO (z `src/types.ts`)**:
  - `OptimizationJobDTO`: Reprezentuje pełne dane zadania optymalizacji pobrane z API (`GET /api/optimization-jobs/{id}`).
  - `UpdateOptimizationJobCommandDTO`: Używany do określenia struktury danych wysyłanych do API w celu aktualizacji zadania (`PATCH /api/optimization-jobs/{id}`). Główne używane pola: `generated_alt_text`, `generated_filename_suggestion`.
- **Nowe typy ViewModel**:
  - **`PreviewViewModel`** (Definiowany jako stan w `PreviewComponent.tsx`):
    - `job: OptimizationJobDTO | null`: Przechowuje dane zadania pobrane z API. Początkowo `null`.
    - `isLoading: boolean`: Flaga wskazująca, czy trwa pobieranie danych zadania.
    - `isSaving: boolean`: Flaga wskazująca, czy trwa zapisywanie zmian (wywołanie PATCH).
    * `isRetrying: boolean`: Flaga wskazująca, czy trwa ponawianie zadania (wywołanie POST /retry).
    - `error: string | null`: Przechowuje komunikaty błędów z API lub informacje o błędzie zadania.
    - `editedAltText: string`: Przechowuje bieżącą (edytowaną) wartość tekstu alternatywnego. Inicjalizowana z `job.generated_alt_text`.
    - `editedFilename: string`: Przechowuje bieżącą (edytowaną) wartość sugestii nazwy pliku. Inicjalizowana z `job.generated_filename_suggestion`.
    - `isEditingAlt: boolean`: Flaga kontrolująca tryb edycji dla pola tekstu alternatywnego.
    - `isEditingFilename: boolean`: Flaga kontrolująca tryb edycji dla pola nazwy pliku.
    - `imageUrl: string | null`: Przechowuje pełny URL do podglądu obrazu, wygenerowany na podstawie `job.storage_path`.

## 6. Zarządzanie stanem

- Stan będzie zarządzany lokalnie w komponencie `PreviewComponent.tsx` przy użyciu hooków React `useState` i `useEffect`.
- `useState` będzie używany do przechowywania wszystkich pól zdefiniowanych w `PreviewViewModel`.
- `useEffect` będzie używany do:
  - Pobrania danych zadania optymalizacji (`GET /api/optimization-jobs/{jobId}`) przy pierwszym renderowaniu komponentu (zależność od `jobId`).
  - Aktualizacji stanu lokalnego (`editedAltText`, `editedFilename`, `imageUrl`, `error`, `isLoading`) po otrzymaniu odpowiedzi z API.
  - Potencjalnie do wygenerowania `imageUrl`, gdy `job` zostanie załadowany.
- **Niestandardowe hooki (propozycja):**
  - `useOptimisationJob(jobId: string)`: Może hermetyzować logikę pobierania danych zadania (`GET /api/optimization-jobs/{id}`), zarządzanie stanami `isLoading`, `error` oraz zwracać `job` i funkcję `refetch`.
  - `useUpdateOptimisationJob()`: Może hermetyzować logikę aktualizacji zadania (`PATCH /api/optimization-jobs/{id}`), zarządzanie stanami `isSaving`, `error` oraz zwracać funkcję `updateJob`.
  - `useImageUrl(storagePath: string | undefined)`: Może hermetyzować logikę budowania publicznego URL obrazu z Supabase na podstawie ścieżki przechowywania. Wymaga dostępu do publicznego URL bazy Supabase (np. z zmiennych środowiskowych).

## 7. Integracja API

- **Pobieranie danych zadania**:
  - Po zamontowaniu komponentu `PreviewComponent`, wywoływane jest żądanie `GET /api/optimization-jobs/{jobId}` za pomocą `fetch`.
  - `jobId` jest pobierane z propsów (przekazanych przez Astro z parametrów URL).
  - Odpowiedź (typu `OptimizationJobDTO`) jest zapisywana w stanie `job`.
  - Obsługiwane są stany `isLoading` i `error`.
  - Sprawdzany jest `job.status`. Jeśli jest `processing`, można wyświetlić odpowiedni komunikat. Jeśli `failed`, wyświetlany jest `job.error_message`.
  - Generowany jest `imageUrl`.
- **Aktualizacja zadania**:
  - Wywoływana po kliknięciu przycisku "Zapisz Zmiany".
  - Konstruowany jest obiekt `UpdateOptimizationJobCommandDTO` zawierający tylko zmienione pola (`generated_alt_text`, `generated_filename_suggestion`).
  - Wywoływane jest żądanie `PATCH /api/optimization-jobs/{jobId}` z payloadem JSON (`Content-Type: application/json`).
  - Obsługiwane są stany `isSaving` i `error`. Po sukcesie, stan `job` może zostać zaktualizowany odpowiedzią API, a flagi edycji zresetowane. Wyświetlany jest komunikat sukcesu (np. Toast).
- **Ponawianie zadania**:
  - Wywoływane po kliknięciu przycisku "Ponów próbę" (dostępnego tylko dla `job.status === 'failed'`).
  - Wywoływane jest żądanie `POST /api/optimization-jobs/{jobId}/retry`.
  - Obsługiwane są stany `isRetrying` i `error`. Po sukcesie, stan `job` jest aktualizowany (status powinien się zmienić), a użytkownik informowany. Może być konieczne odświeżenie danych po chwili.

## 8. Interakcje użytkownika

- **Ładowanie widoku**: Użytkownik widzi wskaźnik ładowania. Po załadowaniu danych, widzi podgląd obrazu i sugestie.
- **Błąd ładowania**: Użytkownik widzi komunikat błędu (np. "Nie znaleziono zadania" dla 404, "Błąd serwera").
- **Zadanie w trakcie przetwarzania**: Użytkownik widzi komunikat "Przetwarzanie..." (pola sugestii mogą być puste lub wyświetlać poprzednie wartości, jeśli istnieją). Edycja może być zablokowana.
- **Zadanie zakończone niepowodzeniem**: Użytkownik widzi komunikat błędu (`job.error_message`) i przycisk "Ponów próbę".
- **Edycja pola**: Użytkownik klika ikonę edycji lub tekst sugestii. Pole przechodzi w tryb edycji (input).
- **Anulowanie edycji**: Użytkownik klika "Anuluj" w `EditableField` - zmiany w danym polu są odrzucane, pole wraca do trybu wyświetlania.
- **Wprowadzanie zmian**: Użytkownik modyfikuje tekst w inpucie. Stan (`editedAltText` / `editedFilename`) jest aktualizowany. Przycisk "Zapisz Zmiany" staje się aktywny.
- **Zapisywanie zmian**: Użytkownik klika "Zapisz Zmiany". Wyświetlany jest wskaźnik ładowania (`isSaving`). Po sukcesie - komunikat potwierdzający, pola wracają do trybu wyświetlania z nowymi wartościami. Po błędzie - komunikat błędu.
- **Ponawianie zadania**: Użytkownik klika "Ponów próbę". Wyświetlany jest wskaźnik ładowania (`isRetrying`). Po sukcesie - status zadania się zmienia (np. na `pending` lub `processing`), przycisk "Ponów próbę" znika. Po błędzie - komunikat błędu.
- **Powrót**: Użytkownik klika "Powrót". Następuje nawigacja do poprzedniej strony lub zdefiniowanej strony (np. `/account`).

## 9. Warunki i walidacja

- **Poziom komponentu**:
  - `jobId` musi być poprawnym UUID (walidacja po stronie API, ale komponent oczekuje stringa).
  - Przycisk "Zapisz Zmiany" jest aktywny (`disabled=false`) tylko wtedy, gdy `editedAltText !== job.generated_alt_text` LUB `editedFilename !== job.generated_filename_suggestion`.
  - Przycisk "Ponów próbę" jest widoczny i aktywny tylko gdy `job?.status === 'failed'`.
  - Pola edycji mogą być zablokowane (`disabled=true`) gdy `job?.status === 'processing'` lub gdy trwa zapisywanie (`isSaving`).
- **Poziom API (Frontend musi obsłużyć odpowiedzi)**:
  - `GET /api/optimization-jobs/{id}`: Obsługa 404 (Not Found), 401/403 (Unauthorized/Forbidden).
  - `PATCH /api/optimization-jobs/{id}`: Wymaga `Content-Type: application/json`. Obsługa 400 (Bad Request - np. niepoprawny status), 404, 401/403.
  - `POST /api/optimization-jobs/{id}/retry`: Obsługa 400 (Bad Request - np. zadanie nie jest w stanie 'failed'), 404, 401/403.

## 10. Obsługa błędów

- **Błędy API**: Wszelkie błędy zwracane przez API (`fetch` catch, statusy 4xx, 5xx) powinny być przechwytywane. Komunikat błędu powinien być wyświetlany użytkownikowi za pomocą komponentu `ErrorDisplay` lub `ToastNotification` (preferowane dla błędów akcji jak zapis/retry).
- **Nie znaleziono zadania (404)**: Wyświetlić dedykowany komunikat "Nie znaleziono zadania optymalizacji o podanym ID."
- **Brak autoryzacji (401/403)**: Wyświetlić komunikat "Brak dostępu" lub przekierować do logowania (zależnie od globalnej strategii).
- **Błąd walidacji (400)**: Wyświetlić komunikat błędu zwrócony przez API.
- **Błąd serwera (500)**: Wyświetlić generyczny komunikat "Wystąpił błąd serwera. Spróbuj ponownie później."
- **Błąd ponowienia próby (400 - nie można ponowić)**: Wyświetlić komunikat z API ("Tylko zadania zakończone niepowodzeniem mogą być ponowione").
- **Nieudane zadanie (`job.status === 'failed'`)**: Wyświetlić `job.error_message` w widocznym miejscu (np. `ErrorDisplay`) i udostępnić przycisk "Ponów próbę".
- **Problem z załadowaniem obrazu**: Standardowe zachowanie przeglądarki (ikona zepsutego obrazu). Można dodać obsługę zdarzenia `onError` na elemencie `<img>` i wyświetlić placeholder lub komunikat.

## 11. Kroki implementacji

1.  **Utworzenie pliku routingu**: Stworzyć plik `src/pages/preview/[id].astro`.
2.  **Utworzenie komponentu React**: Stworzyć plik `src/components/PreviewComponent.tsx`.
3.  **Struktura strony Astro**: W `[id].astro`, zaimportować `PreviewComponent`, pobrać `id` z `Astro.params` i przekazać jako prop do `PreviewComponent` renderowanego po stronie klienta (`client:load`). Dodać podstawowy layout Astro.
4.  **Implementacja `PreviewComponent`**:
    - Zdefiniować stan `PreviewViewModel` używając `useState`.
    - Implementacja logiki pobierania danych w `useEffect` (wywołanie `GET /api/optimization-jobs/{jobId}`).
    - Implementacja podstawowego renderowania: wyświetlanie `LoadingIndicator`, `ErrorDisplay` oraz danych `job` (jeśli dostępne).
5.  **Implementacja `ImageDisplay`**: Stworzyć komponent wyświetlający obraz na podstawie `imageUrl` ze stanu. Zaimplementować logikę generowania `imageUrl` (np. w `useEffect` lub custom hook `useImageUrl`).
6.  **Implementacja `EditableField`**: Stworzyć komponent do wyświetlania i edycji tekstu, zarządzający swoim stanem `isEditing`. Powinien przyjmować `value`, `editedValue`, `onChange`, `isEditing`, `setIsEditing` jako propsy. Wykorzystać komponenty `Input`, `Button` z Shadcn/ui.
7.  **Implementacja `SuggestionPanel`**: Stworzyć komponent grupujący dwa `EditableField` (dla alt textu i nazwy pliku), przekazując odpowiednie propsy ze stanu `PreviewComponent`.
8.  **Implementacja `ActionButtons`**: Stworzyć komponent z przyciskami "Zapisz Zmiany", "Powrót", "Ponów próbę". Implementacja logiki `disabled` dla przycisków na podstawie stanu (`canSave`, `canRetry`, `isSaving`, `isRetrying`). Podpięcie funkcji `onSave`, `onRetry`, `onBack` z propsów.
9.  **Integracja API (Zapis/Ponów)**: Zaimplementować funkcje `handleSave` i `handleRetry` w `PreviewComponent`, które wywołują odpowiednie żądania API (PATCH, POST /retry), zarządzają stanami `isSaving`/`isRetrying` oraz `error`.
10. **Obsługa błędów i komunikatów**: Zintegrować komponent `ToastNotification` (lub podobny) do wyświetlania potwierdzeń sukcesu i błędów operacji zapisu/ponowienia. Upewnić się, że `ErrorDisplay` poprawnie pokazuje błędy ładowania lub statusu zadania.
11. **Styling**: Zastosować Tailwind CSS i komponenty Shadcn/ui do stylizacji wszystkich elementów zgodnie z design systemem aplikacji.
12. **Testowanie**: Przeprowadzić manualne testy obejmujące:
    - Ładowanie widoku dla istniejącego ID.
    - Ładowanie widoku dla nieistniejącego ID (404).
    - Wyświetlanie różnych statusów zadania (`completed`, `failed`, `processing`).
    - Edycję i zapisywanie zmian.
    - Próbę zapisu bez zmian.
    - Anulowanie edycji.
    - Ponawianie zadania zakończonego niepowodzeniem.
    - Obsługę błędów API (symulacja np. przez narzędzia deweloperskie).
    - Responsywność widoku.
13. **Refaktoryzacja**: Wprowadzenie ewentualnych poprawek, refaktoryzacja kodu, rozważenie użycia custom hooków (`useOptimisationJob`, `useUpdateOptimisationJob`, `useImageUrl`).
