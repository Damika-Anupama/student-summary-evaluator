// API Configuration
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

export const API_ENDPOINTS = {
  text: `${API_BASE_URL}/text/`,
  summaries: `${API_BASE_URL}/summaries/`,
  assignments: `${API_BASE_URL}/assignments/`,
  students: `${API_BASE_URL}/students/`,
  teachers: `${API_BASE_URL}/teachers/`,
  summaryView: `${API_BASE_URL}/summaryview/`,
};
