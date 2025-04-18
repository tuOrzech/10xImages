import type { Locator, Page } from "@playwright/test";
import { expect } from "@playwright/test";

/**
 * Page Object Model for the Home Page
 * Encapsulates all interactions with the home page
 */
export class HomePage {
  readonly page: Page;
  readonly uploadButton: Locator;
  readonly fileInput: Locator;
  readonly optimizeButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.uploadButton = page.getByRole("button", { name: /upload/i });
    this.fileInput = page.locator('input[type="file"]');
    this.optimizeButton = page.getByRole("button", { name: /optimize/i });
  }

  /**
   * Navigate to the home page
   */
  async goto() {
    await this.page.goto("/");
    await expect(this.page).toHaveTitle(/AltImageOptimizer/);
  }

  /**
   * Upload an image file
   * @param filePath Path to the file to upload
   */
  async uploadImage(filePath: string) {
    await this.uploadButton.click();
    await this.fileInput.setInputFiles(filePath);
  }

  /**
   * Click the optimize button and wait for optimization to complete
   */
  async optimizeImage() {
    await this.optimizeButton.click();
    // Wait for the optimization process to complete
    await this.page.waitForSelector(".optimization-result", { state: "visible" });
  }

  /**
   * Get the generated alt text from the results
   */
  async getGeneratedAltText() {
    const altTextElement = this.page.locator(".alt-text-result");
    await expect(altTextElement).toBeVisible();
    return altTextElement.textContent();
  }
}
