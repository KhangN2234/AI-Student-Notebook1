const request = require('supertest');
const app = require('../app');

describe('POST /api/questions', () => {
  test('returns questions for valid note content', async () => {
    const res = await request(app)
      .post('/api/questions')
      .send({ content: 'Photosynthesis is the process by which plants convert sunlight into energy.' });

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body.questions)).toBe(true);
    expect(res.body.questions.length).toBeGreaterThan(0);
  });

  test('returns 400 when content is missing', async () => {
    const res = await request(app).post('/api/questions').send({});

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBeDefined();
  });

  test('returns 400 when content is only whitespace', async () => {
    const res = await request(app).post('/api/questions').send({ content: '   ' });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBeDefined();
  });

  test('returns fallback questions for very short content', async () => {
    const res = await request(app)
      .post('/api/questions')
      .send({ content: 'Hi' });

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body.questions)).toBe(true);
    expect(res.body.questions.length).toBeGreaterThan(0);
  });
});

describe('GET /api/health', () => {
  test('returns ok status', async () => {
    const res = await request(app).get('/api/health');

    expect(res.statusCode).toBe(200);
    expect(res.body.ok).toBe(true);
  });
});
