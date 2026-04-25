const express = require('express');
const router = express.Router();

const { generateReviewSchedule } = require('../services/reviewScheduler');

router.post('/', (req, res) => {
  const { results } = req.body || {};

  if (!results || !Array.isArray(results)) {
    return res.status(400).json({ message: 'Results array is required.' });
  }

  try {
    const schedule = generateReviewSchedule(results);
    res.json({ schedule });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to generate schedule.' });
  }
});

module.exports = router;