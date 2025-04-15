# Plan implementacji widoku Panel przesyłania plików

## 1. Przegląd

Widok "Panel przesyłania plików" ma na celu umożliwienie użytkownikowi przesłania obrazu, wprowadzenia kontekstu optymalizacji oraz rozpoczęcia procesu generowania sugestii (alt text i nazwy pliku) przy użyciu endpointu API. Widok realizuje walidację obrazu (typ, rozmiar, MIME, wymiary) oraz prezentuje podgląd przesłanego obrazu, komunikaty o błędach oraz stan przetwarzania.

## 2. Routing widoku

Widok będzie dostępny pod ścieżką: `/upload`

## 3. Struktura komponentów

- **UploadForm** – główny kontener widoku, zarządza stanem formularza i integracją z API.
  - **FileInput** – komponent do wyboru i walidacji pliku obrazu.
  - **ImagePreview** – komponent wyświetlający podgląd wybranego obrazu.
  - **ContextForm** – formularz do wprowadzania kontekstu (subject oraz opcjonalne słowa kluczowe).
  - **SubmitButton** – przycisk do wysyłki formularza.
  - **ToastNotification** – komponent do wyświetlania komunikatów błędów lub informacji.
  - **LoadingIndicator** – opcjonalny komponent wyświetlający stan ładowania podczas przetwarzania.

## 4. Szczegóły komponentów

### UploadForm

- Opis komponentu: Główny komponent widoku, który scala wszystkie mniejsze komponenty oraz zarządza logiką walidacji i integracją z API.
- Główne elementy: Formularz HTML obejmujący komponenty `FileInput`, `ContextForm`, `ImagePreview` i `SubmitButton`; obsługa zdarzenia `onSubmit` do wysyłki danych do endpointu.
- Obsługiwane interakcje: Wybór pliku, wprowadzanie tekstu w polach kontekstu, kliknięcie przycisku submit.
- Obsługiwana walidacja: Sprawdzenie formatu obrazu (JPG, PNG, WEBP), weryfikacja rozmiaru pliku (maks. 10MB), walidacja obecności nazwy pliku.
- Typy: `UploadViewModel` – stan widoku zawierający: wybrany plik, URL podglądu, subject, keywords, error message, flagę isLoading.
- Propsy: Zarządzany jako widok, stan lokalny bez dodatkowych propsów.

### FileInput

- Opis komponentu: Umożliwia wybór pliku obrazu z dysku oraz wstępną walidację (typ, rozmiar).
- Główne elementy: Element `<input type="file">` z obsługą zmian.
- Obsługiwane interakcje: Zmiana wartości inputa – wywołanie funkcji walidującej plik.
- Obsługiwana walidacja: Sprawdzenie, czy wybrany plik jest typu JPG, PNG lub WEBP oraz weryfikacja, że rozmiar nie przekracza 10MB.
- Typy: Wykorzystuje typ `File` oraz dodatkowe informacje o pliku (nazwa, typ).
- Propsy: Callback do przekazywania wybranego pliku do komponentu nadrzędnego.

### ImagePreview

- Opis komponentu: Odpowiedzialny za wyświetlenie podglądu przesłanego obrazu.
- Główne elementy: Element `<img>` z dynamicznie ustawianym `src` po konwersji wybranego pliku na URL.
- Obsługiwane interakcje: Aktualizacja podglądu przy zmianie pliku.
- Typy: Prosty typ string dla URL.
- Propsy: `previewUrl: string`

### ContextForm

- Opis komponentu: Formularz umożliwiający wprowadzenie dodatkowych danych kontekstowych obrazu, np. subject oraz słów kluczowych.
- Główne elementy: Pole tekstowe dla subject (opcjonalne, ale zalecane) oraz pole lub komponent multi-input dla słów kluczowych (opcjonalne).
- Obsługiwane interakcje: Zmiana wartości pól wejściowych.
- Obsługiwana walidacja: Upewnienie się, że jeżeli wartość subject jest podana, spełnia wymagania walidacyjne (np. minimalna długość), lecz pozostaje opcjonalna.
- Typy: `ContextViewModel` zawierający `subject?: string` i opcjonalnie `keywords?: string[]`
- Propsy: Callback do aktualizacji stanu kontekstowego w komponencie nadrzędnym.

### SubmitButton

- Opis komponentu: Przycisk odpowiedzialny za wywołanie akcji przesłania formularza.
- Główne elementy: Element `<button>` z etykietą np. "Prześlij".
- Obsługiwane interakcje: Kliknięcie wywołujące funkcję submit.
- Obsługiwana walidacja: Przycisk aktywowany tylko, gdy wszystkie wymagane dane są poprawne.
- Typy: Standardowy element przycisku.
- Propsy: Callback onClick.

### ToastNotification

- Opis komponentu: Komponent odpowiedzialny za wyświetlanie komunikatów informacyjnych i błędów w widoku, wykorzystując powiadomienia toast.
- Główne elementy: Wizualna prezentacja komunikatów, ikony wskazujące typ komunikatu (sukces, błąd, informacja).
- Obsługiwane interakcje: Automatyczne ukrywanie komunikatu po określonym czasie oraz możliwość ręcznego zamknięcia.
- Obsługiwana walidacja: Komponent nie waliduje danych, a jedynie prezentuje przekazane komunikaty.
- Typy: Oczekuje wiadomości typu string.
- Propsy: `message: string`, `type: 'success' | 'error' | 'info'`, `duration?: number`.

### LoadingIndicator

- Opis komponentu: Komponent wyświetlający animację stanu ładowania, gdy trwa przetwarzanie danych lub wysyłka formularza do API.
- Główne elementy: Animacja lub spinner, który informuje użytkownika o trwającym procesie.
- Obsługiwane interakcje: Brak bezpośrednich interakcji; komponent jest wyświetlany automatycznie na podstawie stanu `isLoading`.
- Obsługiwana walidacja: Nie dotyczy – komponent jest czysto wizualny.
- Typy: Może przyjmować ustawienia dotyczące stylizacji, np. klasy CSS.
- Propsy: Opcjonalne ustawienia stylizacji (np. klasy CSS, rozmiar spinnera).

## 5. Typy

- **UploadViewModel**:
  - `file: File | null`
  - `previewUrl: string | null`
  - `subject?: string`
  - `keywords: string[]`
  - `error: string | null`
  - `isLoading: boolean`
- **ContextViewModel**:
  - `subject?: string`
  - `keywords?: string[]`
- Wykorzystanie istniejącego typu `CreateOptimizationJobCommandDTO` dla integracji z API.

## 6. Zarządzanie stanem

- Użycie hooków `useState` do zarządzania stanem:
  - `file`, `previewUrl`, `subject`, `keywords`, `isLoading`, `error`
- Rozważenie utworzenia customowego hooka `useFileUpload` do obsługi logiki walidacji pliku i generowania URL podglądu.

## 7. Integracja API

- Endpoint: `POST /api/optimization-jobs`
- Żądanie realizowane w formacie `multipart/form-data`, zawierające:
  - `image`: przesłany plik,
  - `original_filename`: nazwa pliku,
  - `user_context_subject`: subject,
  - `user_context_keywords`: słowa kluczowe.
- Typ odpowiedzi oparty na DTO `OptimizationJobDTO`.
- Po udanej odpowiedzi, przekierowanie użytkownika do widoku `/preview` w celu dalszej edycji wyników.

## 8. Interakcje użytkownika

- Użytkownik wybiera plik za pomocą FileInput, co powoduje walidację i generowanie podglądu.
- Użytkownik wprowadza dane kontekstowe w ContextForm.
- Kliknięcie SubmitButton wywołuje wysyłkę danych do API:
  - W przypadku sukcesu, użytkownik jest przekierowywany do widoku podglądu.
  - W przypadku błędu, wyświetlany jest komunikat (ToastNotification).

## 9. Warunki i walidacja

- Walidacja lokalna:
  - Typ pliku musi być JPG, PNG lub WEBP.
  - Rozmiar pliku nie przekracza 10MB.
  - Pole subject nie może być puste.
- Walidacja na poziomie API:
  - Sprawdzenie odpowiedzi i obsługa błędów (np. błąd walidacji, błąd serwera).

## 10. Obsługa błędów

- Wyświetlanie komunikatów błędów za pomocą ToastNotification przy:
  - Błędach walidacji lokalnej.
  - Błędach zwróconych przez API.
- Ustawienie stanu `error` i odpowiednia obsługa w interfejsie.
- Mechanizm retry dla operacji API, jeśli jest to konieczne.

## 11. Kroki implementacji

1. Utworzenie nowego widoku w ścieżce `/upload` z odpowiednią konfiguracją routingu.
2. Stworzenie komponentu `UploadForm` i jego podkomponentów (`FileInput`, `ImagePreview`, `ContextForm`, `SubmitButton`).
3. Implementacja logiki walidacji pliku oraz generowania URL do podglądu.
4. Implementacja obsługi stanu za pomocą hooków (useState lub custom hook `useFileUpload`).
5. Integracja z API przez wysłanie żądania do endpointu `POST /api/optimization-jobs`.
6. Implementacja obsługi błędów i wyświetlanie komunikatów za pomocą komponentu `ToastNotification`.
7. Testowanie widoku pod kątem walidacji, poprawności wyświetlania podglądu oraz integracji z API.
8. Zastosowanie Tailwind CSS oraz komponentów Shadcn/ui dla spójności interfejsu i responsywności.
9. Przeprowadzenie testów manualnych oraz wprowadzenie ewentualnych poprawek na podstawie feedbacku.
