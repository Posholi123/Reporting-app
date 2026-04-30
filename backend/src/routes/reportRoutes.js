const express = require('express');
const router = express.Router();
const { db } = require('../config/firebaseAdmin');

// GET all reports (with optional filters)
router.get('/', async (req, res) => {
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

// POST a new report
router.post('/', async (req, res) => {
  try {
    const { reportData, userId } = req.body;
    const docRef = db.collection('reports').doc();
    await docRef.set({
      ...reportData,
      submittedAt: admin.firestore.FieldValue.serverTimestamp(),
      backendProcessed: true
    });
    res.status(201).json({ success: true, id: docRef.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT update feedback (PRL)
router.put('/:id/feedback', async (req, res) => {
  try {
    const { id } = req.params;
    const { prlFeedback } = req.body;
    await db.collection('reports').doc(id).update({
      prlFeedback,
      reviewedByPRL: true,
      feedbackProvidedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;