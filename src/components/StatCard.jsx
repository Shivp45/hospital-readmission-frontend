export default function StatCard({ title, value, subtitle, icon, gradient, trend }) {
  return (
    <div className={`relative overflow-hidden rounded-2xl p-6 shadow-xl border border-white/5 ${gradient}`}>
      {/* Background decoration */}
      <div className="absolute -top-4 -right-4 w-24 h-24 rounded-full bg-white/5 blur-xl" />
      <div className="absolute -bottom-6 -left-6 w-32 h-32 rounded-full bg-white/5 blur-xl" />

      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center text-2xl backdrop-blur-sm">
            {icon}
          </div>
          {trend !== undefined && (
            <span className={`text-sm font-semibold px-2 py-1 rounded-lg ${
              trend >= 0 ? 'bg-emerald-900/40 text-emerald-400' : 'bg-red-900/40 text-red-400'
            }`}>
              {trend >= 0 ? '▲' : '▼'} {Math.abs(trend)}%
            </span>
          )}
        </div>
        <p className="text-white/60 text-sm font-medium mb-1">{title}</p>
        <p className="text-white text-3xl font-bold">{value}</p>
        {subtitle && <p className="text-white/50 text-xs mt-1">{subtitle}</p>}
      </div>
    </div>
  );
}
