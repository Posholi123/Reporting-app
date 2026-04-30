const API_BASE = 'http://172.25.217.91:5000/api';

// Helper to handle fetch errors
const handleResponse = async (response) => {
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Request failed');
  }
  return response.json();
};

export const fetchReports = async (role, userId) => {
  const url = `${API_BASE}/reports?role=${role}&userId=${userId}`;
  const response = await fetch(url);
  return handleResponse(response);
};

export const submitReport = async (reportData, userId) => {
  const response = await fetch(`${API_BASE}/reports`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ reportData, userId })
  });
  return handleResponse(response);
};

export const updateFeedback = async (reportId, prlFeedback) => {
  const response = await fetch(`${API_BASE}/reports/${reportId}/feedback`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prlFeedback })
  });
  return handleResponse(response);
};

export const fetchClasses = async (lecturerId = null) => {
  let url = `${API_BASE}/classes`;
  if (lecturerId) url += `?lecturerId=${lecturerId}`;
  const response = await fetch(url);
  return handleResponse(response);
};

export const createClass = async (classData) => {
  const response = await fetch(`${API_BASE}/classes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(classData)
  });
  return handleResponse(response);
};

export const markAttendance = async (studentId, classId, markedAt = new Date()) => {
  const response = await fetch(`${API_BASE}/attendance`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ studentId, classId, markedAt })
  });
  return handleResponse(response);
};

export const fetchAttendance = async (studentId) => {
  const response = await fetch(`${API_BASE}/attendance/${studentId}`);
  return handleResponse(response);
};

export const fetchAttendanceCount = async (classId) => {
  const url = `${API_BASE}/attendance-count?classId=${classId}`;
  const response = await fetch(url);
  const data = await handleResponse(response);
  return data.count;
};

export const fetchCourses = async () => {
  const response = await fetch(`${API_BASE}/courses`);
  return handleResponse(response);
};

export const createCourse = async (courseData) => {
  const response = await fetch(`${API_BASE}/courses`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(courseData)
  });
  return handleResponse(response);
};

export const assignLecturer = async (lecturerId, courseId) => {
  const response = await fetch(`${API_BASE}/assignments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ lecturerId, courseId })
  });
  return handleResponse(response);
};

export const fetchAssignments = async (lecturerId = null) => {
  let url = `${API_BASE}/assignments`;
  if (lecturerId) url += `?lecturerId=${lecturerId}`;
  const response = await fetch(url);
  return handleResponse(response);
};

export const submitRating = async (studentId, lecturerId, rating) => {
  const response = await fetch(`${API_BASE}/ratings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ studentId, lecturerId, rating })
  });
  return handleResponse(response);
};

export const fetchRatings = async (studentId) => {
  const response = await fetch(`${API_BASE}/ratings/${studentId}`);
  return handleResponse(response);
};

export const fetchLecturers = async () => {
  const response = await fetch(`${API_BASE}/users?role=lecturer`);
  return handleResponse(response);
};