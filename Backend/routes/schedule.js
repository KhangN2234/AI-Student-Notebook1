const express = require('express');
const router = express.Router();

const { generateReviewSchedule } = require('../services/reviewScheduler');
const requireAuth = require('../src/middleware/requireAuth');
const {
  listReviewSchedule,
  createReviewScheduleEntries,
  clearReviewSchedule,
} = require('../src/models/reviewScheduleRepository');

router.use(requireAuth);

router.get('/', async (req, res) => {
  try {
    const schedule = await listReviewSchedule(req.user.id);
    res.json({ schedule });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to load review schedule.' });
  }
});

router.post('/', async (req, res) => {
  const { results, noteId } = req.body || {};

  if (!results || !Array.isArray(results)) {
    return res.status(400).json({ message: 'Results array is required.' });
  }

  try {
    const schedule = generateReviewSchedule(results);
    await createReviewScheduleEntries(schedule, req.user.id, noteId || null);
    res.json({ schedule });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to generate schedule.' });
  }
});

router.delete('/', async (req, res) => {
  try {
    await clearReviewSchedule(req.user.id);
    res.json({ message: 'Review schedule cleared.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to clear review schedule.' });
  }
});

module.exports = router;