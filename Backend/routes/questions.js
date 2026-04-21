const express = require('express');
const axios = require('axios');

const router = express.Router();

router.post('/', async (req, res) => {
  const { content } = req.body || {};

  if (!content || !content.trim()) {
    return res.status(400).json({ message: 'Note content is required.' });
  }

  if (!process.env.GROQ_API_KEY) {
    return res.status(500).json({ message: 'Missing GROQ_API_KEY.' });
  }

  try {
    const response = await axios.post(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        model: 'llama-3.3-70b-versatile',
        messages: [
          {
            role: 'system',
            content: `
Generate 3-5 study questions from the notes.
For each question, provide:
- question
- correct answer
- short explanation

Return ONLY JSON in this format:
[
  {
    "question": "...",
    "answer": "...",
    "explanation": "..."
  }
]
            `,
          },
          {
            role: 'user',
            content,
          },
        ],
        temperature: 0.7,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const raw = response.data.choices[0].message.content;

    // Try parsing AI output
    let questions;
    try {
      questions = JSON.parse(raw);
    } catch {
      return res.status(500).json({ message: 'AI returned invalid format.' });
    }

    res.json({ questions });

  } catch (error) {
    console.error(error.response?.data || error.message);
    res.status(500).json({ message: 'Failed to generate questions.' });
  }
});

module.exports = router;