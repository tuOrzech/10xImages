# Database Schema Plan for AltImageOptimizer

## 1. Tabele i kolumny

### 1.1. Tabela: optimization_jobs

- **id**: UUID, PRIMARY KEY, NOT NULL, DEFAULT uuid_generate_v4()
- **user_id**: UUID, NOT NULL, FOREIGN KEY referencing auth.users(id) with ON DELETE CASCADE
- **created_at**: TIMESTAMP WITH TIME ZONE, NOT NULL, DEFAULT now()
- **updated_at**: TIMESTAMP WITH TIME ZONE, NOT NULL, DEFAULT now()
- **original_filename**: TEXT, NOT NULL
- **user_context_subject**: TEXT NULL
- **user_context_keywords**: TEXT[] NULL
- **generated_alt_text**: TEXT NULL
- **generated_filename_suggestion**: TEXT NULL
- **ai_request_id**: TEXT NULL
- **ai_detected_keywords**: TEXT[] NULL
- **status**: TEXT NULL
- **error_message**: TEXT NULL

## 2. Relacje między tabelami

- Jeden użytkownik z tabeli auth.users może posiadać wiele rekordów w tabeli optimization_jobs (relacja 1:N).

## 3. Indeksy

- Indeks na kolumnie **user_id**:
  ```sql
  CREATE INDEX idx_optimization_jobs_user_id ON optimization_jobs(user_id);
  ```
- Indeks na kolumnie **created_at** (w porządku malejącym):
  ```sql
  CREATE INDEX idx_optimization_jobs_created_at ON optimization_jobs(created_at DESC);
  ```

## 4. Ograniczenia i mechanizmy

- **Ograniczenia NOT NULL**: id, user_id, created_at, updated_at, original_filename.
- **Klucz główny**: id
- **Klucz obcy**: user_id odnosi się do auth.users(id) z ON DELETE CASCADE.
- **Domyślne wartości**: created_at i updated_at ustawione na now().

## 5. Automatyczna aktualizacja pola updated_at

- Użycie triggera w PostgreSQL do automatycznej aktualizacji kolumny updated_at przy każdej modyfikacji:

  ```sql
  CREATE OR REPLACE FUNCTION update_updated_at_column()
  RETURNS TRIGGER AS $$
  BEGIN
    NEW.updated_at = now();
    RETURN NEW;
  END;
  $$ LANGUAGE plpgsql;

  CREATE TRIGGER update_optimization_job_updated_at
  BEFORE UPDATE ON optimization_jobs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
  ```

## 6. Zasady bezpieczeństwa na poziomie wiersza (RLS)

- Włączenie RLS na tabeli optimization_jobs:
  ```sql
  ALTER TABLE optimization_jobs ENABLE ROW LEVEL SECURITY;
  ```
- Przykładowe polityki RLS:
  - **SELECT**:
    ```sql
    CREATE POLICY "Select own optimization jobs" ON optimization_jobs
    FOR SELECT
    TO authenticated
    USING ((select auth.uid()) = user_id);
    ```
  - **INSERT**:
    ```sql
    CREATE POLICY "Insert own optimization jobs" ON optimization_jobs
    FOR INSERT
    TO authenticated
    WITH CHECK ((select auth.uid()) IS NOT NULL AND user_id = auth.uid());
    ```
  - **UPDATE**:
    ```sql
    CREATE POLICY "Update own optimization jobs" ON optimization_jobs
    FOR UPDATE
    TO authenticated
    USING ((select auth.uid()) = user_id)
    WITH CHECK ((select auth.uid()) = user_id);
    ```
  - **DELETE**:
    ```sql
    CREATE POLICY "Delete own optimization jobs" ON optimization_jobs
    FOR DELETE
    TO authenticated
    USING ((select auth.uid()) = user_id);
    ```

## 7. Uwagi dodatkowe

- Plan uwzględnia możliwość przyszłego rozszerzenia o mechanizmy soft delete lub wersjonowanie rekordów.
