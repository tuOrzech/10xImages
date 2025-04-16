# Plan implementacji widoku Panel optymalizacji (zaawansowane funkcje)

## 1. Przegląd

Widok "Panel optymalizacji (zaawansowane funkcje)" ma na celu umożliwienie użytkownikom dostępu do zaawansowanych opcji optymalizacyjnych obrazów, które wykraczają poza podstawową funkcjonalność generowania alt tekstu i sugestii nazwy pliku. Użytkownicy mogą dostosować format obrazu, rozmiar, jakość i metadane. Panel wyświetla podgląd obrazu w czasie rzeczywistym, pokazując efekty zastosowanych optymalizacji, wraz z dodatkowymi informacjami diagnostycznymi takimi jak rozmiar pliku przed i po optymalizacji.

## 2. Routing widoku

Widok będzie dostępny pod dynamiczną ścieżką: `/advanced/[id]`, gdzie `[id]` to unikalny identyfikator (UUID) zadania optymalizacji (`optimization_job`).

## 3. Struktura komponentów

Widok zostanie zaimplementowany jako strona Astro (`src/pages/advanced/[id].astro`), która będzie renderować główny komponent React (`AdvancedOptimizationComponent`) po stronie klienta.

```
src/pages/advanced/[id].astro (Server Component - handles routing, initial data fetching)
  └── src/components/AdvancedOptimizationComponent.tsx (React Client Component - client:load)
      ├── LoadingIndicator (Shared component)
      ├── ErrorDisplay (Shared component)
      ├── ImagePreviewPanel
      │   ├── BeforeAfterToggle
      │   ├── ImageDisplay (original/optimized view)
      │   └── ImageMetadata (size, dimensions, format)
      ├── OptimizationControlsPanel
      │   ├── FormatSelector (WebP, JPEG, PNG, etc.)
      │   ├── QualitySelector (slider)
      │   ├── DimensionControls
      │   │   ├── WidthInput
      │   │   ├── HeightInput
      │   │   └── MaintainAspectRatioToggle
      │   ├── CompressionOptionsPanel
      │   │   ├── CompressionMethodSelector
      │   │   └── Additional format-specific options
      │   └── MetadataControlsPanel (toggle for EXIF, copyright, etc.)
      └── ActionButtons
          ├── ApplyButton (Starts optimization with selected settings)
          ├── ResetButton (Resets all settings to defaults)
          ├── SaveButton (Saves the optimized image)
          └── BackButton (Returns to previous view)
```

## 4. Szczegóły komponentów

### AdvancedOptimizationComponent (React Client Component)

- **Opis komponentu**: Główny komponent widoku, odpowiedzialny za pobieranie danych zadania optymalizacji na podstawie ID z URL, zarządzanie stanem ustawień optymalizacji, wyświetlanie podglądu obrazu, kontrolek do modyfikacji parametrów oraz obsługę interakcji użytkownika. Renderowany po stronie klienta (`client:load`).
- **Główne elementy**: Wykorzystuje komponenty podrzędne (`ImagePreviewPanel`, `OptimizationControlsPanel`, `ActionButtons`) do budowy interfejsu. Zarządza logiką pobierania danych zadania i przesłanego obrazu oraz wywołania optymalizacji.
- **Obsługiwane interakcje**: Pobieranie danych zadania przy ładowaniu, zmiana ustawień optymalizacji, podgląd efektów, zastosowanie optymalizacji, zapis optymalizowanego obrazu, nawigacja powrotna.
- **Obsługiwana walidacja**: Sprawdza typ obrazu dla dostępnych opcji formatu, waliduje wprowadzone wymiary (minimalne/maksymalne wartości), weryfikuje zgodność ustawień kompresji z wybranym formatem.
- **Typy**: `AdvancedOptimizationViewModel` (stan lokalny), `OptimizationJobDTO` (dane z API), `OptimizationSettingsType` (ustawienia optymalizacji).
- **Propsy**: `jobId: string` (przekazane z Astro page).

### LoadingIndicator

- **Opis komponentu**: Współdzielony komponent wyświetlający wizualny wskaźnik ładowania (np. spinner), gdy aplikacja oczekuje na odpowiedź API lub przetwarza obraz.
- **Główne elementy**: Element wizualny (np. SVG spinner, komponent Shadcn/ui).
- **Obsługiwane interakcje**: Brak.
- **Obsługiwana walidacja**: Brak.
- **Typy**: `boolean` (prop `isLoading`).
- **Propsy**: `isLoading: boolean`.

### ErrorDisplay

- **Opis komponentu**: Współdzielony komponent do wyświetlania komunikatów o błędach pochodzących z API lub procesu optymalizacji.
- **Główne elementy**: Kontener tekstowy z odpowiednim stylem (np. czerwony kolor, ikona błędu).
- **Obsługiwane interakcje**: Brak (może zawierać przycisk do zamknięcia).
- **Obsługiwana walidacja**: Brak.
- **Typy**: `string | null` (prop `errorMessage`).
- **Propsy**: `errorMessage: string | null`.

### ImagePreviewPanel

- **Opis komponentu**: Wyświetla podgląd obrazu oryginalnego oraz po optymalizacji, z możliwością przełączania między nimi. Prezentuje również metadane obrazu.
- **Główne elementy**: Komponenty `BeforeAfterToggle`, `ImageDisplay` i `ImageMetadata`.
- **Obsługiwane interakcje**: Przełączanie między widokiem obrazu oryginalnego i zoptymalizowanego.
- **Obsługiwana walidacja**: Brak.
- **Typy**: `ImagePreviewProps` zawierający URL obrazu oryginalnego i zoptymalizowanego oraz metadane.
- **Propsy**: `originalImageUrl: string`, `optimizedImageUrl: string | null`, `metadata: ImageMetadataType`, `isBeforeAfterActive: boolean`, `onToggleBeforeAfter: () => void`, `isProcessing: boolean`.

### BeforeAfterToggle

- **Opis komponentu**: Umożliwia przełączanie między widokiem oryginalnego i zoptymalizowanego obrazu.
- **Główne elementy**: Przełącznik lub przyciski.
- **Obsługiwane interakcje**: Kliknięcie przełącznika zmienia widok.
- **Obsługiwana walidacja**: Brak.
- **Typy**: `boolean` (stan aktywności).
- **Propsy**: `isActive: boolean`, `onChange: () => void`, `isDisabled: boolean`.

### ImageDisplay

- **Opis komponentu**: Wyświetla obraz (oryginalny lub zoptymalizowany) w zależności od stanu przełącznika.
- **Główne elementy**: Element `<img>`.
- **Obsługiwane interakcje**: Brak.
- **Obsługiwana walidacja**: Brak (przeglądarka obsłuży błąd ładowania obrazu).
- **Typy**: `string` (URL obrazu).
- **Propsy**: `imageUrl: string`, `alt: string`, `className?: string`.

### ImageMetadata

- **Opis komponentu**: Wyświetla metadane obrazu, takie jak rozmiar, wymiary, format.
- **Główne elementy**: Panel tekstowy z danymi.
- **Obsługiwane interakcje**: Brak.
- **Obsługiwana walidacja**: Brak.
- **Typy**: `ImageMetadataType` (metadane obrazu).
- **Propsy**: `metadata: ImageMetadataType`, `originalMetadata?: ImageMetadataType` (opcjonalnie, do porównania).

### OptimizationControlsPanel

- **Opis komponentu**: Główny panel kontrolny zawierający wszystkie opcje optymalizacji, pogrupowane w sekcje tematyczne.
- **Główne elementy**: Komponenty `FormatSelector`, `QualitySelector`, `DimensionControls`, `CompressionOptionsPanel`, `MetadataControlsPanel`.
- **Obsługiwane interakcje**: Deleguje interakcje do komponentów potomnych.
- **Obsługiwana walidacja**: Deleguje walidację do komponentów potomnych.
- **Typy**: `OptimizationSettingsType` (kompletne ustawienia optymalizacji).
- **Propsy**: `settings: OptimizationSettingsType`, `onChange: (settings: OptimizationSettingsType) => void`, `originalFormat: string`, `isProcessing: boolean`.

### FormatSelector

- **Opis komponentu**: Umożliwia wybór formatu docelowego dla zoptymalizowanego obrazu.
- **Główne elementy**: Komponent `Select` (Shadcn/ui) z opcjami formatów.
- **Obsługiwane interakcje**: Zmiana wybranego formatu.
- **Obsługiwana walidacja**: Dostępność formatów w zależności od typu oryginalnego obrazu.
- **Typy**: `string` (wybrany format).
- **Propsy**: `value: string`, `onChange: (value: string) => void`, `originalFormat: string`, `isDisabled: boolean`.

### QualitySelector

- **Opis komponentu**: Umożliwia dostosowanie jakości obrazu dla formatów stratnych (JPEG, WebP).
- **Główne elementy**: Komponent `Slider` (Shadcn/ui) z wartością procentową.
- **Obsługiwane interakcje**: Przesunięcie suwaka zmienia wartość jakości.
- **Obsługiwana walidacja**: Aktywny tylko dla formatów obsługujących ustawienia jakości.
- **Typy**: `number` (wartość jakości, zwykle 0-100).
- **Propsy**: `value: number`, `onChange: (value: number) => void`, `isDisabled: boolean`.

### DimensionControls

- **Opis komponentu**: Zestaw kontrolek do dostosowania wymiarów (szerokość, wysokość) obrazu oraz proporcji.
- **Główne elementy**: Komponenty `WidthInput`, `HeightInput`, `MaintainAspectRatioToggle`.
- **Obsługiwane interakcje**: Wprowadzanie wartości szerokości/wysokości, włączanie/wyłączanie zachowania proporcji.
- **Obsługiwana walidacja**: Minimalne/maksymalne dopuszczalne wymiary, walidacja poprawności wprowadzonych wartości liczbowych.
- **Typy**: `DimensionsType` (szerokość, wysokość, flaga zachowania proporcji).
- **Propsy**: `dimensions: DimensionsType`, `onChange: (dimensions: DimensionsType) => void`, `originalDimensions: { width: number, height: number }`, `isDisabled: boolean`.

### CompressionOptionsPanel

- **Opis komponentu**: Panel z zaawansowanymi opcjami kompresji, specyficznymi dla wybranego formatu.
- **Główne elementy**: `CompressionMethodSelector` oraz dodatkowe opcje zależne od formatu.
- **Obsługiwane interakcje**: Wybór metody kompresji, ustawienie specyficznych opcji formatu.
- **Obsługiwana walidacja**: Dostępność opcji w zależności od wybranego formatu.
- **Typy**: `CompressionOptionsType` (zależne od formatu).
- **Propsy**: `options: CompressionOptionsType`, `onChange: (options: CompressionOptionsType) => void`, `selectedFormat: string`, `isDisabled: boolean`.

### MetadataControlsPanel

- **Opis komponentu**: Panel umożliwiający zarządzanie metadanymi obrazu (np. zachowanie EXIF, dodanie informacji o prawach autorskich).
- **Główne elementy**: Zestaw przełączników lub pól wyboru dla różnych typów metadanych.
- **Obsługiwane interakcje**: Włączanie/wyłączanie zachowania poszczególnych metadanych.
- **Obsługiwana walidacja**: Brak.
- **Typy**: `MetadataOptionsType` (opcje dotyczące metadanych).
- **Propsy**: `options: MetadataOptionsType`, `onChange: (options: MetadataOptionsType) => void`, `isDisabled: boolean`.

### ActionButtons

- **Opis komponentu**: Panel przycisków akcji dla całego widoku.
- **Główne elementy**: Przyciski `ApplyButton`, `ResetButton`, `SaveButton`, `BackButton`.
- **Obsługiwane interakcje**: Kliknięcia przycisków wywołujące odpowiednie akcje.
- **Obsługiwana walidacja**: Przyciski są aktywne/nieaktywne w zależności od stanu aplikacji (np. `Apply` nieaktywny podczas przetwarzania).
- **Typy**: `Function` (callbacks dla akcji).
- **Propsy**: `onApply: () => void`, `onReset: () => void`, `onSave: () => void`, `onBack: () => void`, `canApply: boolean`, `canSave: boolean`, `isProcessing: boolean`.

## 5. Typy

- **Istniejące typy DTO**:

  - `OptimizationJobDTO`: Reprezentuje dane zadania optymalizacji pobrane z API.

- **Nowe typy ViewModel**:

  - **`AdvancedOptimizationViewModel`**:

    - `job: OptimizationJobDTO | null`: Dane zadania optymalizacji.
    - `settings: OptimizationSettingsType`: Bieżące ustawienia optymalizacji.
    - `defaultSettings: OptimizationSettingsType`: Domyślne ustawienia optymalizacji.
    - `originalImageUrl: string | null`: URL oryginalnego obrazu.
    - `optimizedImageUrl: string | null`: URL zoptymalizowanego obrazu.
    - `originalMetadata: ImageMetadataType | null`: Metadane oryginalnego obrazu.
    - `optimizedMetadata: ImageMetadataType | null`: Metadane zoptymalizowanego obrazu.
    - `isLoading: boolean`: Stan ładowania danych zadania.
    - `isProcessing: boolean`: Stan przetwarzania optymalizacji.
    - `isSaving: boolean`: Stan zapisywania zoptymalizowanego obrazu.
    - `isBeforeAfterActive: boolean`: Stan przełącznika podglądu (oryginał/optymalizacja).
    - `error: string | null`: Komunikat błędu.

  - **`OptimizationSettingsType`**:

    - `format: string`: Format docelowy obrazu (WebP, JPEG, PNG, itp.).
    - `quality: number`: Jakość obrazu (0-100, dla formatów stratnych).
    - `dimensions: DimensionsType`: Wymiary obrazu.
    - `compressionOptions: CompressionOptionsType`: Opcje kompresji.
    - `metadataOptions: MetadataOptionsType`: Opcje metadanych.

  - **`DimensionsType`**:

    - `width: number | null`: Szerokość obrazu w pikselach.
    - `height: number | null`: Wysokość obrazu w pikselach.
    - `maintainAspectRatio: boolean`: Flaga zachowania proporcji.

  - **`CompressionOptionsType`**:

    - `method: string`: Metoda kompresji.
    - `level: number`: Poziom kompresji (dla formatów bezstratnych).
    - formatSpecificOptions: Specyficzne opcje formatu (różne dla WebP, JPEG, PNG).

  - **`MetadataOptionsType`**:

    - `keepExif: boolean`: Zachowanie danych EXIF.
    - `keepIptc: boolean`: Zachowanie danych IPTC.
    - `keepXmp: boolean`: Zachowanie danych XMP.
    - `keepColorProfile: boolean`: Zachowanie profilu kolorów / ICC.
    - `addCopyright: boolean`: Dodanie informacji o prawach autorskich.
    - `copyrightText: string`: Tekst praw autorskich.

  - **`ImageMetadataType`**:
    - `width: number`: Szerokość obrazu.
    - `height: number`: Wysokość obrazu.
    - `format: string`: Format obrazu.
    - `size: number`: Rozmiar pliku w bajtach.
    - `hasExif: boolean`: Informacja o obecności danych EXIF.
    - `hasIptc: boolean`: Informacja o obecności danych IPTC.
    - `hasXmp: boolean`: Informacja o obecności danych XMP.

## 6. Zarządzanie stanem

- **Stan lokalny**: Wykorzystanie hooków React do zarządzania stanem komponentu głównego:

  - `useState` dla wszystkich pól zdefiniowanych w `AdvancedOptimizationViewModel`.
  - `useEffect` do:
    - Pobierania danych zadania oraz oryginalnego obrazu przy pierwszym renderowaniu.
    - Inicjalizacji domyślnych ustawień optymalizacji na podstawie metadanych oryginalnego obrazu.
    - Aktualizacji podglądu po zmianie ustawień optymalizacji.

- **Niestandardowe hooki**:
  - `useOptimizationJob(jobId: string)`: Pobieranie i zarządzanie danymi zadania optymalizacji.
  - `useImageMetadata(imageUrl: string | null)`: Pobieranie metadanych obrazu.
  - `useOptimizationProcess(originalImageUrl: string | null, settings: OptimizationSettingsType)`: Zarządzanie procesem optymalizacji obrazu.

## 7. Integracja API

- **Pobieranie danych zadania**:

  - Endpoint: `GET /api/optimization-jobs/{id}`
  - Po zamontowaniu komponentu, pobierane są dane zadania.
  - Z danych zadania pobierany jest URL oryginalnego obrazu.

- **Pobieranie metadanych obrazu**:

  - Nie wymaga osobnego endpointu API - metadane są ekstrahowane z obrazu po jego załadowaniu.
  - Alternatywnie, możemy utworzyć endpoint `GET /api/images/{id}/metadata` do pobierania metadanych z serwera.

- **Optymalizacja obrazu**:

  - Endpoint: `POST /api/images/optimize`
  - Metoda żądania: `application/json`
  - Ciało żądania:
    ```json
    {
      "job_id": "string",
      "settings": {
        "format": "string",
        "quality": number,
        "dimensions": {
          "width": number | null,
          "height": number | null,
          "maintainAspectRatio": boolean
        },
        "compression_options": { ... },
        "metadata_options": { ... }
      }
    }
    ```
  - Odpowiedź:
    ```json
    {
      "optimized_image_url": "string",
      "metadata": {
        "width": number,
        "height": number,
        "format": "string",
        "size": number,
        "hasExif": boolean,
        "hasIptc": boolean,
        "hasXmp": boolean
      }
    }
    ```

- **Zapisywanie zoptymalizowanego obrazu**:
  - Endpoint: `POST /api/optimization-jobs/{id}/save-optimized`
  - Metoda żądania: `application/json`
  - Ciało żądania:
    ```json
    {
      "settings": {
        "format": "string",
        "quality": number,
        "dimensions": { ... },
        "compression_options": { ... },
        "metadata_options": { ... }
      }
    }
    ```
  - Odpowiedź: `OptimizationJobDTO` z zaktualizowanymi informacjami.

## 8. Interakcje użytkownika

- **Ładowanie widoku**: Użytkownik widzi wskaźnik ładowania. Po załadowaniu danych, wyświetlany jest oryginalny obraz oraz kontrolki optymalizacji.
- **Zmiana ustawień**:
  - Użytkownik wybiera format docelowy, który determinuje dostępne opcje (jakość, kompresja).
  - Użytkownik dostosowuje jakość obrazu suwakiem.
  - Użytkownik wprowadza nowe wymiary obrazu, z możliwością zachowania proporcji.
  - Użytkownik wybiera opcje kompresji i metadanych.
- **Podgląd optymalizacji**:
  - Użytkownik klika "Zastosuj", co inicjuje proces optymalizacji z wybranymi ustawieniami.
  - Podczas przetwarzania, wyświetlany jest wskaźnik ładowania.
  - Po zakończeniu optymalizacji, użytkownik może przełączać między widokiem oryginalnym a zoptymalizowanym.
  - Wyświetlane są metadane obrazu, w tym porównanie rozmiaru pliku przed i po optymalizacji.
- **Zapisywanie obrazu**:
  - Użytkownik klika "Zapisz", co zapisuje zoptymalizowaną wersję obrazu.
  - Po zapisaniu, użytkownik ma opcję pobrania obrazu lub przejścia do poprzedniego widoku.
- **Resetowanie ustawień**:
  - Użytkownik klika "Reset", co przywraca wszystkie ustawienia do wartości domyślnych.
- **Nawigacja**:
  - Użytkownik klika "Powrót", co przenosi do poprzedniego widoku (np. `/preview/{id}`).

## 9. Warunki i walidacja

- **Walidacja wymiarów obrazu**:

  - Szerokość i wysokość muszą być wartościami liczbowymi większymi od zera.
  - Maksymalne wymiary mogą być ograniczone (np. do 5000px).
  - Jeśli zachowanie proporcji jest włączone, zmiana jednego wymiaru automatycznie aktualizuje drugi.

- **Walidacja formatu i jakości**:

  - Opcje jakości są dostępne tylko dla formatów stratnych (JPEG, WebP).
  - Dostępne opcje kompresji zależą od wybranego formatu.

+- **Inteligentna walidacja kombinacji ustawień**:

-
- - System wykrywa potencjalnie problematyczne lub nieoptymalne kombinacje ustawień i wyświetla kontekstowe ostrzeżenia:
- - Format PNG + metadane XMP → ostrzeżenie o kompatybilności
- - Zachowanie EXIF + obraz wygenerowany cyfrowo → sugestia usunięcia zbędnych metadanych
- - Bardzo wysoka jakość JPEG (>95%) → ostrzeżenie o nieoptymalnym stosunku jakości do rozmiaru
- - Zmniejszanie wymiarów + wysoka jakość → sugestia dopasowania jakości do nowego rozmiaru
- - Dla każdego ostrzeżenia system wyświetla przyczynę, potencjalne konsekwencje i sugerowane rozwiązanie
- - Ostrzeżenia nie blokują użytkownika, ale wymagają świadomego potwierdzenia przez kliknięcie przycisku "Rozumiem, kontynuuj"
- +- **Informacje kontekstowe o wpływie na rozmiar pliku**:
-
- - System dynamicznie oblicza i wyświetla wpływ każdej opcji na końcowy rozmiar pliku
- - Przy każdej zmianie ustawień aktualizowana jest informacja o przewidywanym rozmiarze pliku
- - Wyświetlanie procentowej i bezwzględnej redukcji rozmiaru w stosunku do oryginału
- - Wizualizacja struktury rozmiaru pliku (ile zajmują dane obrazu, metadane, profil kolorów)

* **Stany komponentów**:

  - Przyciski akcji są wyłączone podczas ładowania lub przetwarzania.
  - Przycisk "Zapisz" jest aktywny tylko gdy optymalizacja została zastosowana.
  - Przycisk "Zastosuj" jest aktywny tylko gdy ustawienia różnią się od aktualnie zastosowanych.

* **Walidacja API**:
  - Obsługa błędów API (4xx, 5xx).
  - Walidacja dostępności zadania optymalizacji.
  - Walidacja uprawnień użytkownika do modyfikacji zadania.

## 10. Obsługa błędów

- **Błędy API**:

  - Wyświetlanie komunikatów błędów zwróconych przez API.
  - Obsługa braku dostępu do zadania (404, 403).
  - Obsługa błędów serwera (500).

- **Błędy przetwarzania obrazu**:

  - Wyświetlanie komunikatów o błędach podczas optymalizacji.
  - Informowanie o ograniczeniach wybranego formatu.
  - Obsługa błędów ładowania obrazu.

- **Problemy z przeglądarką**:

  - Obsługa braku wsparcia dla wybranych formatów.
  - Obsługa ograniczeń przetwarzania dużych obrazów w przeglądarce.

- **Komunikaty użytkownika**:
  - Jasne komunikaty o błędach walidacji.
  - Informacje o postępie długotrwałych operacji.
  - Potwierdzenia pomyślnego zakończenia operacji.

## 11. Kroki implementacji

1. **Przygotowanie struktury projektu**:

   - Utworzenie pliku routingu (`src/pages/advanced/[id].astro`).
   - Utworzenie głównego komponentu React (`src/components/AdvancedOptimizationComponent.tsx`).

2. **Implementacja podstawowej struktury komponentu**:

   - Zdefiniowanie typów (ViewModel, Settings, etc.).
   - Utworzenie struktury stanu i efektów (useState, useEffect).
   - Implementacja metod do obsługi zdarzeń (handleApply, handleSave, handleReset, handleBack).

3. **Implementacja komponentów podrzędnych**:

   - Implementacja komponentów panelu podglądu (`ImagePreviewPanel`, `BeforeAfterToggle`, `ImageDisplay`, `ImageMetadata`).
   - Implementacja komponentów kontrolek optymalizacji (`OptimizationControlsPanel` i podkomponenty).
   - Implementacja komponentów przycisków akcji (`ActionButtons`).

4. **Integracja z API**:

   - Implementacja logiki pobierania danych zadania.
   - Implementacja logiki optymalizacji obrazu.
   - Implementacja logiki zapisywania zoptymalizowanego obrazu.

5. **Implementacja niestandardowych hooków**:

   - Utworzenie hooka `useOptimizationJob`.
   - Utworzenie hooka `useImageMetadata`.
   - Utworzenie hooka `useOptimizationProcess`.

6. **Implementacja walidacji**:

   - Walidacja wymiarów obrazu.
   - Walidacja ustawień formatu i jakości.
   - Walidacja stanu przycisków akcji.

7. **Implementacja obsługi błędów**:

   - Obsługa błędów API.
   - Obsługa błędów przetwarzania obrazu.
   - Implementacja komunikatów użytkownika.

8. **Stylizacja komponentów**:

   - Zastosowanie Tailwind CSS i komponentów Shadcn/ui.
   - Implementacja responsywnego układu.
   - Dostosowanie styli do design systemu aplikacji.

## 12. Elementy edukacyjne w UI

W interfejsie zaawansowanej optymalizacji obrazów wprowadzamy elementy edukacyjne, które pomagają użytkownikom podejmować świadome decyzje:

### Domyślne ustawienia z kontekstem

- **Profil kolorów ICC**: Domyślnie ustawione na `true` z informacją wyjaśniającą: "Zachowanie profilu kolorów zapewnia spójność kolorów na różnych urządzeniach. Wyłącz tylko jeśli potrzebujesz zmniejszyć rozmiar pliku."
- **Jakość obrazu**: Domyślna wartość 85% z informacją: "Wartość 85% oferuje optymalny balans między jakością a rozmiarem pliku. Wartości powyżej 90% znacząco zwiększają rozmiar pliku przy niewielkiej poprawie jakości."
- **Format WebP**: Przy wyborze formatu WebP: "WebP to nowoczesny format oferujący lepszą kompresję niż JPEG i PNG przy zachowaniu podobnej jakości. Nie jest jednak wspierany przez przeglądarki Internet Explorer."

### Informacje o wpływie na rozmiar pliku

- **Kalkulacja wpływu metadanych**: Wyświetlanie informacji "Metadane dodają ~X kB do rozmiaru pliku" na podstawie analizy oryginalnego obrazu.
- **Podgląd oszczędności**: Dynamiczna informacja o przewidywanej redukcji rozmiaru: "Wybrane ustawienia zmniejszą rozmiar pliku o około X% (z YMB do ZMB)."
- **Wykres porównawczy**: Prosty wykres porównujący rozmiar oryginalny i przewidywany rozmiar po optymalizacji.

### Walidacja z edukacją

- **Ostrzeżenia kontekstowe**: Przy problematycznych kombinacjach ustawień:
  - Format PNG + keepXmp: true → "XMP w plikach PNG może powodować problemy w niektórych przeglądarkach. Rozważ wyłączenie tej opcji."
  - Wysoka jakość (>95%) w JPEG → "Bardzo wysoka jakość JPEG znacząco zwiększa rozmiar pliku przy minimalnej poprawie wizualnej. Rozważ niższą wartość."
  - Format WebP + stare przeglądarki → "Format WebP nie jest wspierany przez starsze przeglądarki. Jeśli kompatybilność jest priorytetem, rozważ JPEG."
- **Porady dotyczące formatu**: Sugestie dotyczące optymalnego formatu na podstawie zawartości obrazu:
  - Dla zdjęć → "JPEG lub WebP są rekomendowane dla zdjęć."
  - Dla grafik z przezroczystością → "PNG lub WebP są odpowiednie dla obrazów z przezroczystością."
  - Dla grafik wektorowych → "Rozważ SVG zamiast rastrowego formatu dla grafik wektorowych."

### Tooltips i podpowiedzi

- **Wyjaśnienia techniczne**: Ikony informacyjne (ⓘ) przy opcjach technicznych z wyjaśnieniami po najechaniu:
  - EXIF → "EXIF to metadane zawierające informacje o aparacie, ustawieniach i lokalizacji zdjęcia."
  - ICC → "Profil kolorów ICC zapewnia spójne odwzorowanie kolorów na różnych urządzeniach i ekranach."
  - Kompresja bezstratna → "Kompresja bezstratna zachowuje 100% jakości obrazu, ale oferuje mniejszą redukcję rozmiaru pliku."
- **Artykuły pomocy**: Linki do rozszerzonych artykułów na temat optymalizacji obrazów, np. "Dowiedz się więcej o wpływie jakości JPEG na rozmiar pliku."
- **Wskazówki optymalizacyjne**: Kontekstowe wskazówki dotyczące optymalnych ustawień, np. "Dla obrazów na stronę główną zalecamy szerokość max. 1920px (Full-hd) i format WebP."

### Implementacja elementów edukacyjnych

Elementy edukacyjne zostaną zaimplementowane poprzez:

1. **Komponenty Tooltip**: Wykorzystanie komponentu Tooltip z biblioteki Shadcn/ui do wyświetlania informacji kontekstowych po najechaniu na ikonę informacyjną.
2. **Komponenty Alert**: Wyświetlanie alertów i ostrzeżeń przy problematycznych kombinacjach ustawień.
3. **Dynamiczne kalkulacje**: Wykorzystanie useEffect do obliczania i aktualizowania informacji o wpływie ustawień na rozmiar pliku.
4. **Kontekstowe etykiety i opisy**: Dodanie opisowych etykiet i tekstów pomocniczych do kontrolek interfejsu.
5. **Stylizacja informacji**: Wykorzystanie ikon i kolorów do wizualnego oznaczania typów informacji (porady, ostrzeżenia, fakty).
