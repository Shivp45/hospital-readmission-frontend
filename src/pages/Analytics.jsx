import { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { getMetrics } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorAlert from '../components/ErrorAlert';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const METRIC_COLORS = {
  accuracy:  { bg: 'from-brand-900 to-slate-900', text: 'text-brand-400'   },
  precision: { bg: 'from-sky-900 to-slate-900',   text: 'text-sky-400'     },
  recall:    { bg: 'from-violet-900 to-slate-900', text: 'text-violet-400'  },
  f1_score:  { bg: 'from-amber-900 to-slate-900',  text: 'text-amber-400'   },
};

const METRIC_LABELS = {
  accuracy:  { label: 'Accuracy',  icon: '🎯' },
  precision: { label: 'Precision', icon: '🔍' },
  recall:    { label: 'Recall',    icon: '📡' },
  f1_score:  { label: 'F1-Score',  icon: '⚖️' },
};

export default function Analytics() {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchMetrics = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getMetrics();
      setMetrics(data);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to load metrics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchMetrics(); }, []);

  const featureImportanceChart = metrics ? {
    labels: metrics.features.map((f) =>
      f.replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase())
    ),
    datasets: [{
      label: 'Importance Score',
      data: metrics.features.map((f) => metrics.feature_importances[f]),
      backgroundColor: [
        'rgba(99,102,241,0.75)',
        'rgba(14,165,233,0.75)',
        'rgba(167,139,250,0.75)',
        'rgba(251,191,36,0.75)',
        'rgba(34,197,94,0.75)',
      ],
      borderRadius: 8,
      borderSkipped: false,
    }],
  } : null;

  const featureChartOptions = {
    indexAxis: 'y',
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx) => ` ${(ctx.raw * 100).toFixed(1)}%`,
        },
      },
    },
    scales: {
      x: {
        ticks: { color: '#94a3b8', callback: (v) => `${(v * 100).toFixed(0)}%` },
        grid: { color: 'rgba(148,163,184,0.1)' },
      },
      y: { ticks: { color: '#e2e8f0', font: { size: 13 } }, grid: { display: false } },
    },
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-1">Model Analytics</h1>
        <p className="text-slate-400 text-sm">Random Forest Classifier — evaluation results on test split</p>
      </div>

      {loading && <LoadingSpinner message="Loading model metrics..." />}
      {error && <ErrorAlert message={error} onRetry={fetchMetrics} />}

      {metrics && (
        <>
          {/* Metric Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {['accuracy', 'precision', 'recall', 'f1_score'].map((key) => {
              const { bg, text } = METRIC_COLORS[key];
              const { label, icon } = METRIC_LABELS[key];
              const value = metrics[key];
              const pct = (value * 100).toFixed(1);
              return (
                <div key={key} className={`relative overflow-hidden rounded-2xl p-5 border border-white/5 bg-gradient-to-br ${bg} shadow-xl`}>
                  <div className="absolute -top-4 -right-4 w-20 h-20 rounded-full bg-white/5 blur-xl" />
                  <p className="text-slate-400 text-xs font-medium mb-2">{icon} {label}</p>
                  <p className={`text-3xl font-bold ${text}`}>{pct}%</p>
                  <div className="mt-2 h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${text.replace('text-', 'bg-')}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Confusion Matrix */}
            <div className="card">
              <h2 className="text-lg font-semibold text-white mb-2">Confusion Matrix</h2>
              <p className="text-slate-500 text-xs mb-5">Rows = Actual, Columns = Predicted</p>

              <div className="flex flex-col items-center gap-2">
                {/* Column labels */}
                <div className="grid grid-cols-3 w-full max-w-xs">
                  <div />
                  <div className="text-center text-xs text-slate-400 font-medium pb-1">Not Readmitted</div>
                  <div className="text-center text-xs text-slate-400 font-medium pb-1">Readmitted</div>
                </div>

                {/* Row: Actual Not Readmitted */}
                {metrics.confusion_matrix.map((row, rowIdx) => (
                  <div key={rowIdx} className="grid grid-cols-3 w-full max-w-xs gap-2 items-center">
                    <div className="text-xs text-slate-400 font-medium text-right pr-2">
                      {rowIdx === 0 ? 'Not Readmitted' : 'Readmitted'}
                    </div>
                    {row.map((val, colIdx) => {
                      const isDiagonal = rowIdx === colIdx;
                      return (
                        <div
                          key={colIdx}
                          className={`aspect-square flex items-center justify-center rounded-xl text-2xl font-bold transition-all ${
                            isDiagonal
                              ? 'bg-emerald-900/60 text-emerald-300 border-2 border-emerald-600/50'
                              : 'bg-red-900/40 text-red-300 border-2 border-red-700/30'
                          }`}
                        >
                          {val}
                        </div>
                      );
                    })}
                  </div>
                ))}

                <div className="flex gap-4 mt-3">
                  <span className="flex items-center gap-1.5 text-xs text-slate-400">
                    <span className="w-3 h-3 rounded bg-emerald-600" /> Correct
                  </span>
                  <span className="flex items-center gap-1.5 text-xs text-slate-400">
                    <span className="w-3 h-3 rounded bg-red-700" /> Incorrect
                  </span>
                </div>
              </div>
            </div>

            {/* Metrics Summary Table */}
            <div className="card">
              <h2 className="text-lg font-semibold text-white mb-5">Metrics Summary</h2>
              <div className="space-y-3">
                {[
                  { key: 'accuracy',  label: 'Accuracy',  color: 'bg-brand-500', icon: '🎯' },
                  { key: 'precision', label: 'Precision', color: 'bg-sky-500',   icon: '🔍' },
                  { key: 'recall',    label: 'Recall',    color: 'bg-violet-500',icon: '📡' },
                  { key: 'f1_score',  label: 'F1-Score',  color: 'bg-amber-500', icon: '⚖️' },
                ].map(({ key, label, color, icon }) => {
                  const val = (metrics[key] * 100).toFixed(1);
                  return (
                    <div key={key} className="flex items-center gap-3">
                      <span className="text-base w-6 text-center">{icon}</span>
                      <span className="text-slate-300 text-sm w-20 flex-shrink-0">{label}</span>
                      <div className="flex-1 h-3 bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${color} rounded-full transition-all duration-700`}
                          style={{ width: `${val}%` }}
                        />
                      </div>
                      <span className="text-slate-200 text-sm font-semibold w-12 text-right">{val}%</span>
                    </div>
                  );
                })}
              </div>

              <div className="mt-5 pt-4 border-t border-slate-800">
                <p className="text-xs text-slate-500">
                  Model: <span className="text-slate-400">RandomForestClassifier</span> ·
                  Trees: <span className="text-slate-400">100</span> ·
                  Class weight: <span className="text-slate-400">balanced</span> ·
                  Test split: <span className="text-slate-400">20%</span>
                </p>
              </div>
            </div>
          </div>

          {/* Feature Importance */}
          <div className="card">
            <h2 className="text-lg font-semibold text-white mb-1">Feature Importance</h2>
            <p className="text-slate-500 text-xs mb-5">How much each feature contributes to the model's decisions</p>
            <div className="h-56">
              <Bar data={featureImportanceChart} options={featureChartOptions} />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
