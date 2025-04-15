# Status implementacji widoku Panel przesyłania plików

## Zrealizowane kroki

1. Zaktualizowano typy bazy danych w `src/db/database.types.ts` o dodanie pola `file_hash` do tabeli `optimization_jobs`:
   - Dodano pole `file_hash` do typów `Row`, `Insert` i `Update` w definicji tabeli
   - Prawidłowo określono typ pola jako `string | null`
2. Wdrożono migrację SQL `20240321000000_add_file_hash_to_optimization_jobs.sql` dodającą pole `file_hash` do bazy danych
3. Zintegrowano pole `file_hash` z serwisem API w `src/lib/services/api.service.ts`
4. Utworzono widok w ścieżce `/upload` w pliku `src/pages/upload.astro`
5. Zaimplementowano komponent `UploadForm` w pliku `src/components/UploadForm.tsx` zawierający:
   - Logikę obsługi formularza
   - Zarządzanie stanem formularza i przesyłania pliku
   - Obsługę postępu przesyłania pliku
   - Integrację z API przez wywołanie `createOptimizationJob`
   - Obsługę błędów i komunikatów
   - Skróty klawiszowe (Ctrl+Enter, Esc)
6. Utworzono hook `useFileUpload` do obsługi logiki walidacji pliku i podglądu
7. Zaimplementowano wszystkie potrzebne podkomponenty:
   - `FileInput` - do wyboru i walidacji pliku obrazu
   - `ImagePreview` - do wyświetlania podglądu wybranego obrazu
   - `ContextForm` - do wprowadzania kontekstu (subject i słowa kluczowe)
   - `LoadingIndicator` - do wskazywania stanu ładowania

## Kolejne kroki

1. Utworzenie nowego widoku w ścieżce `/upload` z odpowiednią konfiguracją routingu.
2. Stworzenie komponentu `UploadForm` i jego podkomponentów:
   - `FileInput` - do wyboru i walidacji pliku obrazu
   - `ImagePreview` - do wyświetlania podglądu wybranego obrazu
   - `ContextForm` - formularz do wprowadzania kontekstu (subject oraz opcjonalne słowa kluczowe)
   - `SubmitButton` - przycisk do wysyłki formularza
   - `ToastNotification` - komunikaty błędów lub informacji
   - `LoadingIndicator` - wskaźnik ładowania podczas przetwarzania
3. Implementacja logiki walidacji pliku oraz generowania URL do podglądu.
4. Implementacja obsługi stanu za pomocą hooków.
5. Integracja z API przez wysłanie żądania do endpointu `POST /api/optimization-jobs`.
6. Implementacja obsługi błędów i wyświetlanie komunikatów.
7. Testowanie widoku pod kątem walidacji, poprawności wyświetlania podglądu oraz integracji z API.
8. Zastosowanie Tailwind CSS oraz komponentów Shadcn/ui dla spójności interfejsu i responsywności.
9. Przeprowadzenie testów manualnych oraz wprowadzenie poprawek na podstawie feedbacku.
