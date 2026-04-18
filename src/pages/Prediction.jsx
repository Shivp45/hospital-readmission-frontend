import { useState } from 'react';
import { predictReadmission } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorAlert from '../components/ErrorAlert';

const DIAGNOSES = ['Diabetes', 'Heart Failure', 'Pneumonia', 'COPD', 'Hypertension', 'Sepsis'];

const INITIAL_FORM = {
  age: '',
  gender: '',
  num_prev_admissions: '',
  diagnosis: '',
  length_of_stay: '',
};

export default function Prediction() {
  const [form, setForm] = useState(INITIAL_FORM);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setResult(null);
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    const payload = {
      age: parseInt(form.age),
      gender: form.gender,
      num_prev_admissions: parseInt(form.num_prev_admissions),
      diagnosis: form.diagnosis,
      length_of_stay: parseInt(form.length_of_stay),
    };

    try {
      const data = await predictReadmission(payload);
      setResult(data);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Prediction failed. Is the backend running?');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setForm(INITIAL_FORM);
    setResult(null);
    setError(null);
  };

  const isFormComplete = Object.values(form).every((v) => v !== '');

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-1">Readmission Predictor</h1>
        <p className="text-slate-400 text-sm">Enter patient details to predict hospital readmission risk</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Form */}
        <div className="card">
          <h2 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
            <span>📋</span> Patient Information
          </h2>
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Age */}
            <div>
              <label className="label" htmlFor="age">Age</label>
              <input
                id="age"
                name="age"
                type="number"
                min="0"
                max="120"
                required
                value={form.age}
                onChange={handleChange}
                placeholder="e.g. 65"
                className="input-field"
              />
            </div>

            {/* Gender */}
            <div>
              <label className="label" htmlFor="gender">Gender</label>
              <select
                id="gender"
                name="gender"
                required
                value={form.gender}
                onChange={handleChange}
                className="input-field"
              >
                <option value="">Select gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>

            {/* Previous Admissions */}
            <div>
              <label className="label" htmlFor="num_prev_admissions">
                Number of Previous Admissions
              </label>
              <input
                id="num_prev_admissions"
                name="num_prev_admissions"
                type="number"
                min="0"
                required
                value={form.num_prev_admissions}
                onChange={handleChange}
                placeholder="e.g. 2"
                className="input-field"
              />
            </div>

            {/* Diagnosis */}
            <div>
              <label className="label" htmlFor="diagnosis">Diagnosis</label>
              <select
                id="diagnosis"
                name="diagnosis"
                required
                value={form.diagnosis}
                onChange={handleChange}
                className="input-field"
              >
                <option value="">Select diagnosis</option>
                {DIAGNOSES.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>

            {/* Length of Stay */}
            <div>
              <label className="label" htmlFor="length_of_stay">Length of Stay (days)</label>
              <input
                id="length_of_stay"
                name="length_of_stay"
                type="number"
                min="1"
                required
                value={form.length_of_stay}
                onChange={handleChange}
                placeholder="e.g. 7"
                className="input-field"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                disabled={loading || !isFormComplete}
                className="btn-primary flex-1 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <><span>🔮</span> Predict Readmission</>
                )}
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="px-4 py-3 border border-slate-700 text-slate-400 hover:text-slate-200 hover:border-slate-600 rounded-xl transition-all duration-200 text-sm font-medium"
              >
                Reset
              </button>
            </div>
          </form>
        </div>

        {/* Result Panel */}
        <div className="space-y-4">
          {!result && !loading && !error && (
            <div className="card flex flex-col items-center justify-center py-16 text-center">
              <span className="text-5xl mb-4">🔮</span>
              <p className="text-slate-400 text-sm">Fill in the patient details and click<br/>
                <span className="text-brand-400 font-medium">Predict Readmission</span> to see results
              </p>
            </div>
          )}

          {loading && (
            <div className="card">
              <LoadingSpinner message="Running prediction model..." />
            </div>
          )}

          {error && <ErrorAlert message={error} />}

          {result && (
            <div className="space-y-4 animate-[fadeIn_0.4s_ease-out]">
              {/* Main Result */}
              <div className={`card border-2 ${
                result.readmitted
                  ? 'border-red-700/60 bg-gradient-to-br from-red-950/40 to-slate-900'
                  : 'border-emerald-700/60 bg-gradient-to-br from-emerald-950/40 to-slate-900'
              }`}>
                <div className="flex items-center gap-4">
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl ${
                    result.readmitted ? 'bg-red-900/50' : 'bg-emerald-900/50'
                  }`}>
                    {result.readmitted ? '🔴' : '🟢'}
                  </div>
                  <div>
                    <p className="text-slate-400 text-sm mb-1">Prediction Result</p>
                    <p className={`text-2xl font-bold ${
                      result.readmitted ? 'text-red-400' : 'text-emerald-400'
                    }`}>
                      {result.prediction}
                    </p>
                    <p className="text-slate-400 text-sm mt-0.5">
                      Confidence: <span className="text-white font-semibold">{result.confidence}%</span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Probability Breakdown */}
              <div className="card">
                <h3 className="text-sm font-semibold text-slate-300 mb-4">Probability Breakdown</h3>

                <div className="space-y-3">
                  {/* Not Readmitted Bar */}
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-slate-400">Not Readmitted</span>
                      <span className="text-emerald-400 font-semibold">
                        {result.probability.not_readmitted}%
                      </span>
                    </div>
                    <div className="h-2.5 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 rounded-full transition-all duration-700"
                        style={{ width: `${result.probability.not_readmitted}%` }}
                      />
                    </div>
                  </div>

                  {/* Readmitted Bar */}
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-slate-400">Readmitted</span>
                      <span className="text-red-400 font-semibold">
                        {result.probability.readmitted}%
                      </span>
                    </div>
                    <div className="h-2.5 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-red-700 to-red-400 rounded-full transition-all duration-700"
                        style={{ width: `${result.probability.readmitted}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Input Summary */}
              <div className="card">
                <h3 className="text-sm font-semibold text-slate-300 mb-3">Patient Summary</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {[
                    ['Age', `${form.age} years`],
                    ['Gender', form.gender],
                    ['Diagnosis', form.diagnosis],
                    ['Prev. Admissions', form.num_prev_admissions],
                    ['Length of Stay', `${form.length_of_stay} days`],
                  ].map(([label, val]) => (
                    <div key={label} className="bg-slate-800/60 rounded-lg px-3 py-2">
                      <p className="text-slate-500 text-xs">{label}</p>
                      <p className="text-slate-200 font-medium">{val}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
