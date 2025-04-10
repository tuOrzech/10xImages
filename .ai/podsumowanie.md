<conversation_summary>
<decisions>
1. Walidacja plików będzie dwuetapowa: wstępna w UI (na podstawie rozszerzenia/rozmiaru) oraz ostateczna w backendzie (MIME, rozmiar).
2. Komunikaty walidacyjne będą szczegółowe i informatywne, ale bez technicznych kodów błędów.
3. Pole status w historii będzie odzwierciedlać tylko wynik pierwotnego przetworzenia, bez aktualizacji przy edycji.
4. Odpowiedź AI będzie wymuszona w formacie JSON z kluczami description i keywords.
5. Logi będą zapisywane lokalnie, z podstawowymi informacjami (timestamp, poziom, wiadomość, opcjonalnie user/job ID).
6. UI przy błędach będzie wyświetlać sugestie ponowienia próby.
7. Rate limiting i zaawansowane zabezpieczenia DoS pozostają poza zakresem MVP.
8. Testy jednostkowe będą implementowane dla kluczowych funkcji (walidacja plików, parsowanie odpowiedzi AI).
</decisions>

<matched_recommendations>
1. Zaimplementować dwustopniową walidację plików z precyzyjnymi komunikatami o błędach.
2. Ustalić spójny schemat przechowywania danych w historii optymalizacji.
3. Zdefiniować ścisły format odpowiedzi AI w JSON z ograniczeniami na długość opisu i liczbę słów kluczowych.
4. Zaprojektować mechanizm fallback w przypadku błędów AI.
5. Wdrożyć podstawowy system logowania z poziomami ERROR, WARN, INFO.
6. Zapewnić przejrzyste potwierdzenia dla operacji usuwania.
7. Zaimplementować testy jednostkowe dla kluczowych funkcji.
</matched_recommendations>

<prd_planning_summary>
Główne wymagania funkcjonalne:
- Upload pojedynczego pliku obrazu (JPG, PNG)
- Wprowadzanie uniwersalnego kontekstu dla obrazu
- Generowanie sugestii alt text i nazwy pliku przez AI
- Zarządzanie historią optymalizacji (CRUD)
- Prosta autentykacja użytkowników

Historie użytkownika i ścieżki:
1. Upload obrazu -> wprowadzenie kontekstu -> otrzymanie sugestii -> zapis do historii
2. Przeglądanie historii optymalizacji
3. Edycja zapisanych sugestii
4. Usuwanie wpisów z historii

Kryteria sukcesu:
- Trafność alt textu >75%
- 100% poprawnych nazw plików
- Możliwość pomyślnego przejścia przez główne ścieżki
- Średni czas przetwarzania <10-15 sekund
- Wskaźnik sukcesu przetwarzania
- Liczba rekordów w historii na użytkownika
- Częstotliwość użycia funkcji Edytuj/Usuń

Ograniczenia techniczne:
- Maksymalny rozmiar pliku: 10MB
- Dozwolone formaty: JPG, PNG
- Brak konwersji formatów/zmiany rozmiaru
- Brak przetwarzania wsadowego
- Brak zaawansowanych zabezpieczeń DoS
</prd_planning_summary>

<unresolved_issues>
1. Czy w przyszłości planowane jest rozszerzenie o wielojęzyczność komunikatów?
2. Czy w kolejnych wersjach zostanie dodany mechanizm rate limitingu?
3. Czy w przyszłości zostanie wdrożone centralne logowanie?
4. Czy planowane jest rozszerzenie o zaawansowane funkcje optymalizacji obrazów?
5. Czy w przyszłości zostanie dodana integracja z zewnętrznymi systemami CMS?
</unresolved_issues>
</conversation_summary>
