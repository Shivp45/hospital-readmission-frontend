export default function LoadingSpinner({ message = 'Loading...' }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-4">
      <div className="relative">
        <div className="w-12 h-12 border-4 border-slate-700 rounded-full" />
        <div className="absolute inset-0 w-12 h-12 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
      <p className="text-slate-400 text-sm font-medium animate-pulse">{message}</p>
    </div>
  );
}
