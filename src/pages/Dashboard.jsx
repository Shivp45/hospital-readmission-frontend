import { useEffect, useState } from 'react';
import { Bar, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { getStats } from '../services/api';
import StatCard from '../components/StatCard';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorAlert from '../components/ErrorAlert';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend);

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      labels: { color: '#94a3b8', font: { family: 'Inter', size: 12 } },
    },
  },
  scales: {
    x: {
      ticks: { color: '#94a3b8' },
      grid: { color: 'rgba(148,163,184,0.1)' },
    },
    y: {
      ticks: { color: '#94a3b8' },
      grid: { color: 'rgba(148,163,184,0.1)' },
    },
  },
};

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getStats();
      setStats(data);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to load stats');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchStats(); }, []);

  const barData = stats ? {
    labels: ['Not Readmitted', 'Readmitted'],
    datasets: [{
      label: 'Patient Count',
      data: [stats.not_readmitted_count, stats.readmitted_count],
      backgroundColor: ['rgba(16, 185, 129, 0.7)', 'rgba(239, 68, 68, 0.7)'],
      borderColor: ['rgb(16, 185, 129)', 'rgb(239, 68, 68)'],
      borderWidth: 2,
      borderRadius: 8,
    }],
  } : null;

  const pieData = stats ? {
    labels: ['Not Readmitted', 'Readmitted'],
    datasets: [{
      data: [stats.not_readmitted_count, stats.readmitted_count],
      backgroundColor: ['rgba(16, 185, 129, 0.8)', 'rgba(239, 68, 68, 0.8)'],
      borderColor: ['rgb(16, 185, 129)', 'rgb(239, 68, 68)'],
      borderWidth: 2,
    }],
  } : null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-1">Dashboard</h1>
        <p className="text-slate-400 text-sm">Overview of hospital readmission statistics</p>
      </div>

      {loading && <LoadingSpinner message="Fetching patient statistics..." />}
      {error && <ErrorAlert message={error} onRetry={fetchStats} />}

      {stats && (
        <>
          {/* Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatCard
              title="Total Patients"
              value={stats.total_patients.toLocaleString()}
              icon="👥"
              gradient="bg-gradient-to-br from-brand-900 to-slate-900"
            />
            <StatCard
              title="Readmission Rate"
              value={`${stats.readmission_rate}%`}
              icon="🔄"
              gradient="bg-gradient-to-br from-red-900 to-slate-900"
            />
            <StatCard
              title="Readmitted"
              value={stats.readmitted_count.toLocaleString()}
              subtitle="patients flagged"
              icon="🏥"
              gradient="bg-gradient-to-br from-orange-900 to-slate-900"
            />
            <StatCard
              title="Not Readmitted"
              value={stats.not_readmitted_count.toLocaleString()}
              subtitle="discharged successfully"
              icon="✅"
              gradient="bg-gradient-to-br from-emerald-900 to-slate-900"
            />
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="card">
              <h2 className="text-lg font-semibold text-white mb-4">Readmitted vs Not Readmitted</h2>
              <div className="h-64">
                <Bar data={barData} options={chartOptions} />
              </div>
            </div>

            <div className="card">
              <h2 className="text-lg font-semibold text-white mb-4">Outcome Distribution</h2>
              <div className="h-64 flex items-center justify-center">
                <Pie
                  data={pieData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: 'bottom',
                        labels: { color: '#94a3b8', font: { family: 'Inter', size: 12 }, padding: 16 },
                      },
                    },
                  }}
                />
              </div>
            </div>
          </div>

          {/* Info Banner */}
          <div className="mt-6 card border-brand-800/50">
            <div className="flex items-start gap-4">
              <span className="text-2xl">ℹ️</span>
              <div>
                <p className="font-semibold text-slate-200 text-sm">About this Dataset</p>
                <p className="text-slate-400 text-sm mt-1">
                  This model was trained on a synthetic dataset of {stats.total_patients} patients with features
                  including age, gender, diagnosis, length of stay, and prior admissions. Navigate to the
                  <span className="text-brand-400 font-medium"> Predict</span> page to run a new prediction.
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
