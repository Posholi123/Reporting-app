require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { db } = require('./config/firebaseAdmin');

const app = express();
app.use(cors());
app.use(express.json());

// HEALTH 
app.get('/api/health', (req, res) => {
  res.json({ message: 'Backend is running' });
});

// USERS 
// Get all users (optionally filter by role)
app.get('/api/users', async (req, res) => {
  try {
    const { role } = req.query;
    let query = db.collection('users');
    if (role) query = query.where('role', '==', role);
    const snapshot = await query.get();
    const users = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get single user by UID (includes role)
app.get('/api/users/:uid', async (req, res) => {
  try {
    const { uid } = req.params;
    const userDoc = await db.collection('users').doc(uid).get();
    if (!userDoc.exists) return res.status(404).json({ error: 'User not found' });
    res.json({ id: userDoc.id, ...userDoc.data() });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// COURSES 
app.get('/api/courses', async (req, res) => {
  try {
    const snapshot = await db.collection('courses').get();
    const courses = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(courses);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/courses', async (req, res) => {
  try {
    const courseData = req.body;
    const docRef = db.collection('courses').doc();
    await docRef.set({ ...courseData, createdAt: new Date() });
    res.status(201).json({ success: true, id: docRef.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ASSIGNMENTS
app.get('/api/assignments', async (req, res) => {
  try {
    const { lecturerId } = req.query;
    let query = db.collection('assignments');
    if (lecturerId) query = query.where('lecturerId', '==', lecturerId);
    const snapshot = await query.get();
    const assignments = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(assignments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/assignments', async (req, res) => {
  try {
    const { lecturerId, courseId } = req.body;
    const docRef = db.collection('assignments').doc();
    await docRef.set({ lecturerId, courseId, assignedAt: new Date() });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/assignments/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await db.collection('assignments').doc(id).delete();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// CLASSES 
app.get('/api/classes', async (req, res) => {
  try {
    const { lecturerId } = req.query;
    let query = db.collection('classes');
    if (lecturerId) query = query.where('lecturerId', '==', lecturerId);
    const snapshot = await query.orderBy('date', 'desc').get();
    const classes = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(classes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/classes', async (req, res) => {
  try {
    const classData = req.body;
    const docRef = db.collection('classes').doc();
    await docRef.set({ ...classData, createdAt: new Date() });
    res.status(201).json({ success: true, id: docRef.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get single class by ID
app.get('/api/classes/:classId', async (req, res) => {
  try {
    const { classId } = req.params;
    const doc = await db.collection('classes').doc(classId).get();
    if (!doc.exists) {
      return res.status(404).json({ error: 'Class not found' });
    }
    res.json({ id: doc.id, ...doc.data() });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ATTENDANCE

app.post('/api/attendance', async (req, res) => {
  try {
    const { studentId, classId, markedAt } = req.body;
    const docId = `${studentId}_${classId}`;
    await db.collection('attendance').doc(docId).set({
      studentId,
      classId,
      markedAt: new Date(markedAt)
    }, { merge: true });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Count attendance for a class
app.get('/api/attendance-count', async (req, res) => {
  try {
    const { classId } = req.query;
    const snapshot = await db.collection('attendance').where('classId', '==', classId).get();
    res.json({ count: snapshot.size });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get students who marked attendance for a specific class
app.get('/api/attendance/by-class', async (req, res) => {
  try {
    const { classId } = req.query;
    if (!classId) {
      return res.status(400).json({ error: 'classId required' });
    }
    const snapshot = await db.collection('attendance').where('classId', '==', classId).get();
    const attendanceRecords = snapshot.docs.map(doc => doc.data());
    const studentIds = [...new Set(attendanceRecords.map(record => record.studentId))];
    const students = [];
    for (const studentId of studentIds) {
      const userDoc = await db.collection('users').doc(studentId).get();
      if (userDoc.exists) {
        students.push({ id: studentId, ...userDoc.data() });
      }
    }
    res.json(students);
  } catch (err) {
    console.error('Error fetching attendance by class:', err);
    res.status(500).json({ error: err.message });
  }
});

// Generic route for a single student's attendance  
app.get('/api/attendance/:studentId', async (req, res) => {
  try {
    const { studentId } = req.params;
    const snapshot = await db.collection('attendance').where('studentId', '==', studentId).get();
    const attendance = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(attendance);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// REPORTS 
app.get('/api/reports', async (req, res) => {
  try {
    const { role, userId } = req.query;
    let query = db.collection('reports');
    if (role === 'lecturer') query = query.where('lecturerId', '==', userId);
    if (role === 'pl') query = query.where('reviewedByPRL', '==', true);
    const snapshot = await query.orderBy('submittedAt', 'desc').get();
    const reports = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(reports);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/reports', async (req, res) => {
  try {
    const { reportData, userId } = req.body;
    const docRef = db.collection('reports').doc();
    await docRef.set({
      ...reportData,
      submittedAt: new Date(),
      backendProcessed: true
    });
    res.status(201).json({ success: true, id: docRef.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/reports/:id/feedback', async (req, res) => {
  try {
    const { id } = req.params;
    const { prlFeedback } = req.body;
    await db.collection('reports').doc(id).update({
      prlFeedback,
      reviewedByPRL: true,
      feedbackProvidedAt: new Date()
    });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// RATINGS 
app.post('/api/ratings', async (req, res) => {
  try {
    const { studentId, lecturerId, rating } = req.body;
    const docId = `${studentId}_${lecturerId}`;
    await db.collection('ratings').doc(docId).set({
      studentId,
      lecturerId,
      rating,
      updatedAt: new Date()
    }, { merge: true });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all ratings (used by PL/PRL and filtered for lecturer in frontend)
app.get('/api/ratings/all', async (req, res) => {
  try {
    const snapshot = await db.collection('ratings').get();
    const ratings = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(ratings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get ratings for a specific student (used for student view)
app.get('/api/ratings/:studentId', async (req, res) => {
  try {
    const { studentId } = req.params;
    const snapshot = await db.collection('ratings').where('studentId', '==', studentId).get();
    const ratings = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(ratings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// START SERVER 
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});