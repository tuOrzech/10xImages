import type { DimensionsType } from "@/types";

const MAX_DIMENSION = 5000; // Maximum allowed dimension in pixels
const MIN_DIMENSION = 1; // Minimum allowed dimension in pixels

export function validateDimensions(
  dimensions: DimensionsType,
  originalWidth: number,
  originalHeight: number
): string | null {
  const { width, height } = dimensions;

  // Check if dimensions are provided
  if (width === null && height === null) {
    return "At least one dimension (width or height) must be specified";
  }

  // Validate width if provided
  if (width !== null) {
    if (!Number.isInteger(width)) {
      return "Width must be an integer";
    }
    if (width < MIN_DIMENSION) {
      return `Width must be at least ${MIN_DIMENSION}px`;
    }
    if (width > MAX_DIMENSION) {
      return `Width cannot exceed ${MAX_DIMENSION}px`;
    }
  }

  // Validate height if provided
  if (height !== null) {
    if (!Number.isInteger(height)) {
      return "Height must be an integer";
    }
    if (height < MIN_DIMENSION) {
      return `Height must be at least ${MIN_DIMENSION}px`;
    }
    if (height > MAX_DIMENSION) {
      return `Height cannot exceed ${MAX_DIMENSION}px`;
    }
  }

  // Validate aspect ratio if maintainAspectRatio is true
  if (dimensions.maintainAspectRatio && width !== null && height !== null) {
    const originalAspectRatio = originalWidth / originalHeight;
    const newAspectRatio = width / height;
    const aspectRatioTolerance = 0.01; // 1% tolerance

    if (Math.abs(originalAspectRatio - newAspectRatio) > aspectRatioTolerance) {
      return "New dimensions do not maintain the original aspect ratio";
    }
  }

  return null;
}

export function calculateMaintainedAspectRatio(
  originalWidth: number,
  originalHeight: number,
  newWidth: number | null,
  newHeight: number | null
): { width: number; height: number } {
  if (newWidth === null && newHeight === null) {
    return { width: originalWidth, height: originalHeight };
  }

  const aspectRatio = originalWidth / originalHeight;

  if (newWidth !== null && newHeight === null) {
    return {
      width: newWidth,
      height: Math.round(newWidth / aspectRatio),
    };
  }

  if (newHeight !== null && newWidth === null) {
    return {
      width: Math.round(newHeight * aspectRatio),
      height: newHeight,
    };
  }

  // If both dimensions are provided and not null, return them
  if (newWidth !== null && newHeight !== null) {
    return {
      width: newWidth,
      height: newHeight,
    };
  }

  // Fallback to original dimensions
  return {
    width: originalWidth,
    height: originalHeight,
  };
}

export function isValidDimension(value: number): boolean {
  return Number.isInteger(value) && value >= MIN_DIMENSION && value <= MAX_DIMENSION;
}

export const dimensionConstraints = {
  max: MAX_DIMENSION,
  min: MIN_DIMENSION,
} as const;
