## Analiza Podróży Użytkownika

### Ścieżki użytkownika:

- Użytkownik wchodzi na stronę główną jako gość.
- Gość może korzystać z publicznej funkcji przesyłania obrazu (ad-hoc upload, US-001).
- Gość próbuje uzyskać dostęp do Historii (US-002) lub Kolekcji (US-005) -> zostaje przekierowany na stronę logowania (US-006).
- Na stronie logowania użytkownik może:
  - Wprowadzić dane i spróbować się zalogować.
  - Przejść do strony rejestracji.
  - Przejść do strony odzyskiwania hasła.
- **Logowanie (US-006):** Podanie emaila i hasła -> Walidacja -> Sukces (zalogowany) / Porażka (błąd logowania).
- **Rejestracja (US-006):** Podanie emaila, hasła, potwierdzenia hasła -> Walidacja -> Sukces (konto utworzone, użytkownik zalogowany) / Porażka (błąd rejestracji). _Zakładam brak kroku potwierdzenia email zgodnie z PRD/Spec, ale Supabase może go domyślnie wymuszać - diagram można dostosować, jeśli będzie taka potrzeba._
- **Odzyskiwanie hasła (US-006):** Podanie emaila -> Walidacja -> Email z linkiem wysłany / Błąd -> Użytkownik klika link w emailu -> Strona resetowania hasła -> Podanie nowego hasła -> Sukces (hasło zmienione, przekierowanie do logowania) / Porażka.
- **Zalogowany użytkownik:** Może korzystać ze wszystkich funkcji (Upload, Historia - US-002, Edycja - US-003, Usuwanie - US-004, Kolekcje - US-005). Może się wylogować.
- **Wylogowanie (US-006):** Kliknięcie przycisku "Wyloguj się" -> Sesja zakończona -> Powrót do stanu gościa na stronie głównej.

### Główne podróże i stany:

- **Gość:** Stan początkowy, dostęp do publicznych funkcji.
- **Proces Autentykacji:** Obejmuje logowanie, rejestrację i odzyskiwanie hasła.
- **Zalogowany Użytkownik:** Stan po pomyślnej autentykacji, pełen dostęp.

### Punkty decyzyjne:

- Potrzeba dostępu do funkcji chronionych.
- Wybór akcji na stronie logowania (Login / Register / Forgot Password).
- Wynik walidacji danych (Sukces / Porażka).

### Cel każdego stanu:

- **Odwiedzający (Gość):** Umożliwia interakcję z publiczną częścią aplikacji.
- **StronaLogowania:** Punkt wejścia do procesów autentykacji.
- **StronaRejestracji:** Umożliwia utworzenie nowego konta.
- **StronaOdzyskiwaniaHasla:** Inicjuje proces resetowania hasła przez email.
- **StronaResetowaniaHasla:** Pozwala użytkownikowi ustawić nowe hasło po kliknięciu linku.
- **Zalogowany:** Zapewnia dostęp do pełnej funkcjonalności aplikacji.
- **KomunikatBledu:** Informuje użytkownika o problemie.
- **KomunikatSukcesu:** Informuje użytkownika o pomyślnym zakończeniu akcji (np. wysłaniu emaila).

## Diagram Podróży Użytkownika

```mermaid
stateDiagram-v2
    [*] --> Odwiedzajacy

    state Odwiedzajacy {
        [*] --> PrzegladaniePubliczne
        PrzegladaniePubliczne --> PrzesylanieObrazuPubliczne : "Kliknij 'Upload'"
        PrzesylanieObrazuPubliczne --> PrzegladaniePubliczne : "Zakończono / Anulowano"
        PrzegladaniePubliczne --> ChceDostepDoChronionych : "Kliknij 'Historia' lub 'Kolekcje'"
    }

    state ChceDostepDoChronionych <<choice>>
    Odwiedzajacy --> ChceDostepDoChronionych

    state Logowanie {
      [*] --> StronaLogowania
      StronaLogowania --> ProcesLogowania : "Wprowadź dane i kliknij 'Zaloguj'"
      ProcesLogowania --> WalidacjaLogowania <<choice>>
      WalidacjaLogowania --> Zalogowany : Dane poprawne
      WalidacjaLogowania --> StronaLogowania : Dane niepoprawne [Wyświetl błąd]

      StronaLogowania --> Rejestracja : "Kliknij 'Zarejestruj się'"
      StronaLogowania --> OdzyskiwanieHaslaEmail : "Kliknij 'Zapomniałem hasła'"
    }

    ChceDostepDoChronionych --> Logowanie : Użytkownik niezalogowany

    state Rejestracja {
      [*] --> StronaRejestracji
      StronaRejestracji --> ProcesRejestracji : "Wprowadź dane i kliknij 'Zarejestruj'"
      ProcesRejestracji --> WalidacjaRejestracji <<choice>>
      WalidacjaRejestracji --> Zalogowany : Dane poprawne [Konto utworzone]
      WalidacjaRejestracji --> StronaRejestracji : Dane niepoprawne [Wyświetl błąd]
      StronaRejestracji --> Logowanie : "Kliknij 'Zaloguj się'"
    }

    state OdzyskiwanieHasla {
        state OdzyskiwanieHaslaEmail {
          [*] --> StronaOdzyskiwaniaEmail
          StronaOdzyskiwaniaEmail --> ProcesWysylkiEmaila : "Wprowadź email i kliknij 'Wyślij'"
          ProcesWysylkiEmaila --> WalidacjaEmaila <<choice>>
          WalidacjaEmaila --> StronaOdzyskiwaniaEmail : Email nie istnieje [Wyświetl błąd]
          WalidacjaEmaila --> EmailWyslany : Email poprawny [Wyświetl sukces]
          EmailWyslany --> Logowanie : "Kliknij 'Powrót do logowania'"
          StronaOdzyskiwaniaEmail --> Logowanie : "Kliknij 'Anuluj' / 'Zaloguj się'"
        }

        state ResetowanieHaslaPoLinku {
          [*] --> StronaResetowaniaHasla : Użytkownik klika link z emaila
          StronaResetowaniaHasla --> ProcesResetowaniaHasla : "Wprowadź nowe hasło i kliknij 'Zapisz'"
          ProcesResetowaniaHasla --> WalidacjaNowegoHasla <<choice>>
          WalidacjaNowegoHasla --> Logowanie : Hasło zmienione [Wyświetl sukces]
          WalidacjaNowegoHasla --> StronaResetowaniaHasla : Dane niepoprawne [Wyświetl błąd]
        }
    }


    state Zalogowany {
        [*] --> PanelUzytkownika
        note right of PanelUzytkownika
            Użytkownik ma dostęp do:
            - Upload (Publiczny i prywatny?)
            - Historia (Przeglądanie, Edycja, Usuwanie)
            - Kolekcje (Tworzenie, Edycja, Usuwanie)
        end note
        PanelUzytkownika --> Odwiedzajacy : "Kliknij 'Wyloguj się'"
        ChceDostepDoChronionych --> PanelUzytkownika : Użytkownik zalogowany
    }

    Zalogowany --> [*]

```
