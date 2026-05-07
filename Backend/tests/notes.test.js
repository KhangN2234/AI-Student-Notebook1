const request = require('supertest');
const app = require('../app');
const {
  setupMongoTestDatabase,
  clearMongoTestDatabase,
  teardownMongoTestDatabase,
} = require('./mongoTestHelper');

beforeAll(async () => {
  await setupMongoTestDatabase();
});

afterEach(async () => {
  await clearMongoTestDatabase();
});

afterAll(async () => {
  await teardownMongoTestDatabase();
});

describe('POST /api/notes', () => {
  test('creates a note with valid title and content', async () => {
    const res = await request(app)
      .post('/api/notes')
      .send({ title: 'Biology Chapter 4', content: 'Cells are the basic unit of life.' });

    expect(res.statusCode).toBe(201);
    expect(res.body.note).toMatchObject({
      title: 'Biology Chapter 4',
      content: 'Cells are the basic unit of life.',
    });
    expect(res.body.note.id).toBeDefined();
    expect(res.body.note.createdAt).toBeDefined();
  });

  test('creates a note without a folderId (unsorted)', async () => {
    const res = await request(app)
      .post('/api/notes')
      .send({ title: 'Unsorted Note', content: 'Some content here.' });

    expect(res.statusCode).toBe(201);
    expect(res.body.note.folderId).toBeNull();
  });

  test('returns 400 when title is missing', async () => {
    const res = await request(app)
      .post('/api/notes')
      .send({ content: 'Content without a title.' });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBeDefined();
  });

  test('returns 400 when content is missing', async () => {
    const res = await request(app)
      .post('/api/notes')
      .send({ title: 'Title without content' });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBeDefined();
  });

  test('returns 400 when title is only whitespace', async () => {
    const res = await request(app)
      .post('/api/notes')
      .send({ title: '   ', content: 'Some content.' });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBeDefined();
  });

  test('returns 400 when content is only whitespace', async () => {
    const res = await request(app)
      .post('/api/notes')
      .send({ title: 'Valid Title', content: '   ' });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBeDefined();
  });

  test('returns 400 when folderId does not exist', async () => {
    const res = await request(app)
      .post('/api/notes')
      .send({ title: 'Note', content: 'Content', folderId: 'nonexistent-id' });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBeDefined();
  });

  test('returns 400 when body is empty', async () => {
    const res = await request(app).post('/api/notes').send({});

    expect(res.statusCode).toBe(400);
  });
});

describe('GET /api/notes', () => {
  test('returns a list of notes', async () => {
    const res = await request(app).get('/api/notes');

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body.notes)).toBe(true);
  });

  test('returns notes with expected fields', async () => {
    await request(app)
      .post('/api/notes')
      .send({ title: 'Field Check Note', content: 'Checking fields.' });

    const res = await request(app).get('/api/notes');
    const note = res.body.notes.find((n) => n.title === 'Field Check Note');

    expect(note).toBeDefined();
    expect(note.id).toBeDefined();
    expect(note.title).toBeDefined();
    expect(note.content).toBeDefined();
    expect(note.createdAt).toBeDefined();
  });
});

describe('GET /api/notes/:id', () => {
  test('returns a note by id', async () => {
    const created = await request(app)
      .post('/api/notes')
      .send({ title: 'Fetch By ID', content: 'Content for fetch test.' });

    const noteId = created.body.note.id;
    const res = await request(app).get(`/api/notes/${noteId}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.note.id).toBe(noteId);
    expect(res.body.note.title).toBe('Fetch By ID');
  });

  test('returns 404 for a non-existent note id', async () => {
    const res = await request(app).get('/api/notes/99999');

    expect(res.statusCode).toBe(404);
    expect(res.body.message).toBeDefined();
  });
});
