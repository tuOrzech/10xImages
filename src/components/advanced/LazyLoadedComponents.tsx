import { lazy } from "react";

// Lazy load the compression options panel as it's not immediately visible
export const LazyCompressionOptionsPanel = lazy(() => import("../CompressionOptionsPanel"));

// Lazy load the metadata controls panel as it's not immediately visible
export const LazyMetadataControlsPanel = lazy(() => import("../MetadataControlsPanel"));
