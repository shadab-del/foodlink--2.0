export default function LoadingSpinner({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const sizeClasses = {
    sm: "w-6 h-6 border-2",
    md: "w-12 h-12 border-3",
    lg: "w-16 h-16 border-4"
  };

  return (
    <div className="flex items-center justify-center p-6" id="loading-spinner-wrapper">
      <div className="relative" id="spinner-relative-container">
        <div 
          className={`${sizeClasses[size]} border-t-orange-500 border-r-transparent border-b-emerald-600 border-l-transparent rounded-full animate-spin`}
          id="loading-spinner-circle"
        ></div>
        <div 
          className="absolute inset-0 m-auto w-3 h-3 bg-orange-600 rounded-full animate-ping opacity-75"
          id="loading-spinner-inner"
        ></div>
      </div>
    </div>
  );
}
