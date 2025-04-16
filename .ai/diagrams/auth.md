<authentication_analysis>

- Proces logowania: Użytkownik wprowadza email i hasło, które są walidowane przez API poprzez Supabase Auth, generujący token sesji oraz token odświeżania.
- Proces rejestracji: Użytkownik podaje dane rejestracyjne, a system tworzy konto i generuje token.
- Proces odzyskiwania hasła: Użytkownik wprowadza email, a system wysyła link resetujący.
- Zarządzanie sesją: Middleware weryfikuje ważność tokenu przy każdym żądaniu. W przypadku wygaśnięcia, API żąda od Supabase Auth odświeżenia tokenu.
- Proces wylogowania: Użytkownik inicjuje wylogowanie, a system unieważnia tokeny i kończy sesję.
  Główni aktorzy: Przeglądarka, Middleware, Astro API oraz Supabase Auth.
  </authentication_analysis>

<mermaid_diagram>

```mermaid
sequenceDiagram
    autonumber
    participant Przeglądarka as Browser
    participant Middleware
    participant "Astro API" as API
    participant "Supabase Auth" as Auth

    Browser->>Middleware: Żądanie strony logowania
    Middleware->>API: Renderuj formularz logowania
    API-->>Browser: Przekazanie formularza logowania

    Browser->>API: Wysłanie danych logowania
    activate API
    API->>Auth: Walidacja danych (email, hasło)
    activate Auth
    Auth-->>API: Zwrócenie tokenu sesji oraz tokenu odświeżania
    deactivate Auth
    API-->>Browser: Ustaw token sesji (cookie)
    deactivate API

    alt Logowanie udane
      Browser->>Middleware: Żądanie zasobu chronionego
      Middleware->>API: Weryfikacja tokenu
      API->>Auth: Sprawdzenie ważności tokenu
      alt Token ważny
         Auth-->>API: Potwierdzenie ważności tokenu
         API-->>Browser: Dostarczenie zasobu
      else Token wygasł
         API->>Auth: Żądanie odświeżenia tokenu
         Auth-->>API: Nowe tokeny
         API-->>Browser: Dostarczenie zasobu z nowymi tokenami
      end
    else Logowanie nieudane
       Browser-->>API: Wyświetlenie komunikatu o błędzie
    end

    Browser->>Middleware: Żądanie wylogowania
    Middleware->>API: Inicjacja procesu wylogowania
    API->>Auth: Unieważnienie tokenu sesji
    Auth-->>API: Potwierdzenie zakończenia sesji
    API-->>Browser: Przekierowanie do strony logowania
```

</mermaid_diagram>
