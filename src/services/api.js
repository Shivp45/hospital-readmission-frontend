import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

/**
 * POST /predict
 * @param {Object} patientData - { age, gender, num_prev_admissions, diagnosis, length_of_stay }
 */
export const predictReadmission = (patientData) =>
  api.post('/predict', patientData).then((r) => r.data);

/**
 * GET /metrics
 * Returns accuracy, precision, recall, f1_score, confusion_matrix, feature_importances
 */
export const getMetrics = () =>
  api.get('/metrics').then((r) => r.data);

/**
 * GET /stats
 * Returns total_patients, readmitted_count, not_readmitted_count, readmission_rate
 */
export const getStats = () =>
  api.get('/stats').then((r) => r.data);

export default api;
