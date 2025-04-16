<architecture_analysis>

- Komponenty:

  - Strony Astro:
    - /pages/auth/login – Strona logowania
    - /pages/auth/register – Strona rejestracji
    - /pages/auth/password-recovery – Strona odzyskiwania hasła
  - Komponenty React (z użyciem Shadcn/ui):
    - LoginForm, RegisterForm, PasswordRecoveryForm
    - AuthContext – mechanizm zarządzający stanem autentykacji
  - Główny Layout:
    - @Layout.astro – dynamiczne przyciski (Login, Rejestracja, Wyloguj się) oraz zabezpieczenie stron chronionych
  - API Endpoints:
    - src/pages/api/auth/register.ts (rejestracja)
    - src/pages/api/auth/login.ts (logowanie)
    - src/pages/api/auth/logout.ts (wylogowywanie)
    - src/pages/api/auth/password-recovery.ts (odzyskiwanie hasła)
  - Supabase Client:
    - src/db/supabase.client.ts – integracja z Supabase Auth

- Przepływ danych:

  - Użytkownik wprowadza dane w formularzach (LoginForm, RegisterForm, PasswordRecoveryForm)
  - Formularze przesyłają dane do odpowiednich API Endpointów
  - API komunikuje się z Supabase (przez Supabase Client) i zwraca token/sesję
  - AuthContext aktualizuje stan autentykacji, co wpływa na dynamiczny interfejs @Layout.astro

- Opis funkcjonalności:
  - LoginForm: Pobiera dane logowania i wysyła do API logowania; otrzymuje token, aktualizuje AuthContext
  - RegisterForm: Zbiera dane rejestracji, weryfikuje je, wysyła do API rejestracji; po sukcesie tworzy nowy stan autentykacji
  - PasswordRecoveryForm: Umożliwia wysyłkę danych do API odzyskiwania hasła, które wysyła email z linkiem resetującym
  - @Layout.astro: Wyświetla dynamiczne przyciski i zabezpiecza dostęp do chronionych stron (historia optymalizacji, kolekcje)
    </architecture_analysis>

<mermaid_diagram>

```mermaid
flowchart TD
    %% Layout i Strony Autoryzacji
    A["@Layout.astro"] --> B["/pages/auth/login\n(Strona Login -> LoginForm)"]
    A --> C["/pages/auth/register\n(Strona Rejestracji -> RegisterForm)"]
    A --> D["/pages/auth/password-recovery\n(Strona Odzyskiwania Hasła -> PasswordRecoveryForm)"]

    %% Komponenty React i Zarządzanie Stanem
    B --> E["AuthContext\n(Zarządzanie stanem autentykacji)"]
    C --> E
    D --> E

    %% API Endpoints
    subgraph "API Endpoints"
      F["API: Rejestracja\n(src/pages/api/auth/register.ts)"]
      G["API: Logowanie\n(src/pages/api/auth/login.ts)"]
      H["API: Wylogowanie\n(src/pages/api/auth/logout.ts)"]
      I["API: Odzyskiwanie Hasła\n(src/pages/api/auth/password-recovery.ts)"]
    end

    %% Supabase Integracja
    J["Supabase Client\n(src/db/supabase.client.ts)"]
    E --> J

    %% Przepływ Danych z Formularzy do API
    B -- "Dane logowania" --> G
    C -- "Dane rejestracji" --> F
    D -- "Dane odzyskiwania" --> I

    %% Aktualizacja stanu przez API
    G --> E
    F --> E
    I --> E

    %% Proces wylogowywania
    E -- "Wyloguj się" --> H

    %% Aktualizacja Layoutu w oparciu o stan autentykacji
    E -- "Aktualizacja stanu (token, sesja)" --> A

    %% Uwaga: Publiczny moduł przesyłania obrazów (ad-hoc upload)
    X((Upload obrazu publiczny))
    A --- X
```

</mermaid_diagram>
