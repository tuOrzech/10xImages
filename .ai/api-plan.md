# REST API Plan

## 1. Resources

### 1.1. Optimization Jobs

- This resource maps to the `optimization_jobs` table in the database.
- Key fields include:
  - `id`: Unique identifier (UUID).
  - `user_id`: References the authenticated user (UUID).
  - `created_at` & `updated_at`: Timestamps for record creation and updates.
  - `original_filename`: The name of the uploaded image file.
  - `file_hash`: MD5 hash of the file content for deduplication.
  - `storage_path`: Path to the file in the storage bucket.
  - `user_context_subject`: An optional field to describe the image subject.
  - `user_context_keywords`: An optional array of keywords provided by the user.
  - `generated_alt_text`: AI-generated alternative text for the image.
  - `generated_filename_suggestion`: AI-generated suggestion for an SEO-friendly filename.
  - `ai_request_id`: ID to track the AI request.
  - `ai_detected_keywords`: Array of keywords detected by AI (optional).
  - `status`: Indicates the current state of the job (e.g., processing, completed, error).
  - `error_message`: Stores error details if the optimization fails.

### 1.2. Users

- User information is managed via Supabase Auth. Although not directly manipulated by our API endpoints, the `user_id` association ensures that each optimization job is tied to a specific authenticated user.

## 2. Endpoints

### 2.1. Create Optimization Job

- **Method:** POST
- **URL:** /api/optimization-jobs
- **Description:** Creates a new optimization job by accepting an image upload along with contextual information. This endpoint triggers file validation and initiates an asynchronous process to generate alt text and filename suggestions via an external AI service.
- **Request:**
  - **Content-Type:** multipart/form-data
  - **Body Fields:**
    - `image`: The image file (JPG, PNG or WEBP).
    - `original_filename`: String; required if not inferred from the file.
    - `user_context_subject`: String (optional).
    - `user_context_keywords`: Array of strings (optional).
- **Response:**
  - **Success (201):** Returns the created optimization job object in JSON format.
    ```json
    {
      "id": "uuid",
      "user_id": "uuid",
      "created_at": "timestamp",
      "updated_at": "timestamp",
      "original_filename": "string",
      "file_hash": "string",
      "storage_path": "string",
      "user_context_subject": "string",
      "user_context_keywords": ["string"],
      "generated_alt_text": "string",
      "generated_filename_suggestion": "string",
      "ai_request_id": "string",
      "ai_detected_keywords": ["string"],
      "status": "string",
      "error_message": "string"
    }
    ```
  - **Errors:**
    - 400 Bad Request: Invalid file type, missing required fields, or failed validation.
    - 401 Unauthorized: User is not authenticated.

### 2.2. List Optimization Jobs

- **Method:** GET
- **URL:** /api/optimization-jobs
- **Description:** Retrieves a paginated list of optimization jobs associated with the authenticated user.
- **Query Parameters:**
  - `page` (number, optional, default: 1)
  - `limit` (number, optional, default: 10)
  - `sort` (string, optional e.g., `created_at_desc`)
- **Response:**
  - **Success (200):** Returns a JSON object containing an array of optimization job objects and pagination metadata.
    ```json
    {
      "data": [
        {
          /* optimization_job_obj */
        }
      ],
      "page": 1,
      "limit": 10,
      "total": 50
    }
    ```
  - **Errors:**
    - 401 Unauthorized: User not authenticated.

### 2.3. Retrieve Optimization Job

- **Method:** GET
- **URL:** /api/optimization-jobs/{id}
- **Description:** Retrieves details of a specific optimization job that belongs to the authenticated user.
- **Path Parameter:**
  - `id`: UUID of the optimization job.
- **Response:**
  - **Success (200):** Returns the optimization job object in JSON format.
  - **Errors:**
    - 401 Unauthorized: User not authenticated.
    - 403 Forbidden: Attempt to access a job that does not belong to the user.
    - 404 Not Found: Optimization job not found.

### 2.4. Update Optimization Job

- **Method:** PATCH
- **URL:** /api/optimization-jobs/{id}
- **Description:** Updates an existing optimization job (e.g., editing the generated alt text or filename suggestion).
- **Path Parameter:**
  - `id`: UUID of the optimization job.
- **Request:**
  - **Content-Type:** application/json
  - **Body Fields (optional):**
    - `generated_alt_text`
    - `generated_filename_suggestion`
    - `user_context_subject`
    - `user_context_keywords`
    - `status`
    - `error_message`
- **Response:**
  - **Success (200):** Returns the updated optimization job object in JSON format.
  - **Errors:**
    - 400 Bad Request: Invalid update data.
    - 401 Unauthorized: User not authenticated.
    - 403 Forbidden: Attempt to update a job that does not belong to the user.
    - 404 Not Found: Optimization job not found.

### 2.5. Delete Optimization Job

- **Method:** DELETE
- **URL:** /api/optimization-jobs/{id}
- **Description:** Deletes an optimization job from the user's history.
- **Path Parameter:**
  - `id`: UUID of the optimization job.
- **Response:**
  - **Success (204):** No Content.
  - **Errors:**
    - 401 Unauthorized: User not authenticated.
    - 403 Forbidden: Attempt to delete a job that does not belong to the user.
    - 404 Not Found: Optimization job not found.

### 2.6. Retry Optimization Job (Optional)

- **Method:** POST
- **URL:** /api/optimization-jobs/{id}/retry
- **Description:** Retries the optimization process for a job that encountered an error, thereby triggering the AI service to regenerate suggestions.
- **Path Parameter:**
  - `id`: UUID of the optimization job.
- **Response:**
  - **Success (200):** Returns the updated optimization job object with the new status.
  - **Errors:**
    - 400 Bad Request: Job is not eligible for a retry (e.g., already in processing or completed successfully).
    - 401 Unauthorized: User not authenticated.
    - 403 Forbidden: Attempt to modify a job that does not belong to the user.
    - 404 Not Found: Optimization job not found.

## 3. Authentication and Authorization

- **Authentication Mechanism:**
  - All endpoints require a valid JSON Web Token (JWT) provided in the `Authorization` header as a Bearer token.
  - Authentication is managed via Supabase Auth.
- **Authorization:**
  - The API enforces that users can only access and modify their own optimization jobs.
  - Database Row Level Security (RLS) policies ensure that operations on the `optimization_jobs` table are permitted only for the associated user.
- **Additional Security Measures:**
  - Implement rate limiting and input sanitization to mitigate abuse and injection attacks.

## 4. Validation and Business Logic

- **Validation:**
  - For file uploads, validate that the file is either a JPG, PNG or WEBP, has an acceptable size (max 10MB), and matches the expected MIME type.
  - Generate MD5 hash of file content for deduplication checks.
  - Ensure unique combination of user_id and file_hash to prevent duplicate uploads.
  - For JSON bodies, ensure that required fields (e.g., `original_filename` in job creation) are present.
- **Business Logic:**
  - **File Storage:**
    - Files are stored in a Supabase Storage bucket with path pattern: `{user_id}/{file_hash}.{extension}`.
    - File deduplication is handled at the user level using MD5 hashes.
  - **Image Processing & AI Integration:** The POST endpoint initiates an asynchronous process that calls an external AI service to generate alt text and filename suggestions. The job's status is updated as responses are received.
  - **Error Handling:**
    - If the AI service fails or returns errors, the API records the error message in the `error_message` field and adjusts the `status` accordingly.
    - The client is provided clear error messages and appropriate HTTP status codes (e.g., 400, 401, 403, 404, 500).
  - **Update Logic:** Allows users to manually edit the generated alt text or filename suggestion if needed.
  - The API uses early validation checks and guard clauses to simplify the logic flow and improve readability.

This plan ensures a robust, secure, and maintainable REST API that aligns with the database schema, product requirements, and technical stack of AltImageOptimizer.
