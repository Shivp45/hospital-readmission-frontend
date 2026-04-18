export default function ErrorAlert({ message, onRetry }) {
  return (
    <div className="flex items-start gap-4 bg-red-950/40 border border-red-800/60 text-red-300 rounded-2xl p-5">
      <span className="text-2xl mt-0.5 flex-shrink-0">⚠️</span>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-red-200 text-sm mb-0.5">Something went wrong</p>
        <p className="text-red-300/80 text-sm break-words">{message}</p>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="flex-shrink-0 text-xs font-semibold px-3 py-1.5 bg-red-900/60 hover:bg-red-800/60 rounded-lg transition-colors border border-red-700/50"
        >
          Retry
        </button>
      )}
    </div>
  );
}
