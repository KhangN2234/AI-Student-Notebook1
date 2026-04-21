const express = require('express');
const router = express.Router();
const OpenAI = require('openai');

const getOpenAI = () => new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// POST /api/summarize
router.post('/summarize', async (req, res) => {
  const { notes } = req.body;
  if (!notes) return res.status(400).json({ error: 'No notes provided.' });

  try {
    const completion = await getOpenAI().chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are a helpful study assistant. Summarize the following student notes clearly and concisely.',
        },
        { role: 'user', content: notes },
      ],
    });
    res.json({ summary: completion.choices[0].message.content });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to generate summary.' });
  }
});

// POST /api/questions
router.post('/questions', async (req, res) => {
  const { notes } = req.body;
  if (!notes) return res.status(400).json({ error: 'No notes provided.' });

  try {
    const completion = await getOpenAI().chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content:
            'You are a helpful study assistant. Generate 5 active recall practice questions based on the following student notes. Return them as a numbered list.',
        },
        { role: 'user', content: notes },
      ],
    });
    res.json({ questions: completion.choices[0].message.content });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to generate questions.' });
  }
});

module.exports = router;
