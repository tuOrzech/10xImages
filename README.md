# AltImageOptimizer

## Project Description

AltImageOptimizer is a web-based application designed to optimize images for websites by automating the generation of SEO-friendly alt text and file names. Users can upload JPEG or PNG images along with contextual information. The application validates the file (checking extension, size, MIME type, and actual file size), generates AI-powered suggestions for alt text and file names, and saves each optimization action to a history tied to user accounts. This process streamlines image management while improving SEO, UX/UI, and accessibility compliance.

## Tech Stack

- **Frontend:** Astro 5, React 19, TypeScript 5, Tailwind CSS 4, Shadcn/ui
- **Backend:** Supabase (PostgreSQL, Authentication)
- **AI Integration:** OpenRouter.ai (access to models such as OpenAI, Anthropic, Google, etc.)
- **Image Processing:** Sharp (for image conversion to WebP, resizing, and quality optimization)
- **CI/CD and Hosting:** GitHub Actions, DigitalOcean (Docker)
- **Testing:**
  - **Unit/Integration:** Vitest, React Testing Library
  - **E2E:** Playwright

## Getting Started Locally

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd AltImageOptimizer
   ```
2. **Install dependencies:**
   ```bash
   npm install
   ```
3. **Ensure you are using the correct Node.js version:**
   This project requires Node.js version `22.14.0` as specified in the `.nvmrc` file. If you use [nvm](https://github.com/nvm-sh/nvm), run:
   ```bash
   nvm use
   ```
4. **Run the development server:**
   ```bash
   npm run dev
   ```
   The application will be available at `http://localhost:3000`.

## Available Scripts

- **`npm run dev`**: Starts the development server.
- **`npm run build`**: Builds the application for production deployment.
- **`npm run preview`**: Serves the production build locally.
- **`npm run astro`**: Runs Astro commands.
- **`npm run lint`**: Analyzes the codebase for linting issues.
- **`npm run lint:fix`**: Automatically fixes linting issues.
- **`npm run format`**: Formats the codebase using Prettier.

## Project Scope

AltImageOptimizer focuses on automating the process of image optimization through:

- **Image Upload & Validation:** Supporting JPEG and PNG files with initial file extension and size checks, followed by MIME type and actual file size validation.
- **AI-Powered Suggestions:** Generating SEO-friendly alt text and file name suggestions using AI.
- **Optimization History:** Saving each optimization action, enabling users to review, edit, and delete past optimizations.
- **User Authentication:** Tying each user's optimization history to their authenticated account.

## Project Status

The project is currently in its MVP stage. Core functionalities have been implemented, with ongoing improvements and future feature additions planned.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
