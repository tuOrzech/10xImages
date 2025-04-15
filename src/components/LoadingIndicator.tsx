interface LoadingIndicatorProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function LoadingIndicator({ size = "md", className = "" }: LoadingIndicatorProps) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-8 h-8",
  };

  return (
    <div className={`flex justify-center items-center ${className}`}>
      <div
        className={`${sizeClasses[size]} animate-spin rounded-full border-2 border-t-transparent border-gray-800 dark:border-gray-200`}
        role="status"
        aria-label="Ładowanie"
      >
        <span className="sr-only">Ładowanie...</span>
      </div>
    </div>
  );
}
