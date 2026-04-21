const request = require('supertest');
const app = require('../app');

describe('POST /api/folders', () => {
  test('creates a folder with a valid name', async () => {
    const res = await request(app)
      .post('/api/folders')
      .send({ name: 'Biology' });

    expect(res.statusCode).toBe(201);
    expect(res.body.folder).toMatchObject({ name: 'Biology' });
    expect(res.body.folder.id).toBeDefined();
  });

  test('returns 400 when folder name is missing', async () => {
    const res = await request(app).post('/api/folders').send({});

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBeDefined();
  });

  test('returns 400 when folder name is only whitespace', async () => {
    const res = await request(app).post('/api/folders').send({ name: '   ' });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBeDefined();
  });
});

describe('GET /api/folders', () => {
  test('returns a list of folders', async () => {
    const res = await request(app).get('/api/folders');

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body.folders)).toBe(true);
  });

  test('returns folders with noteCount field', async () => {
    await request(app).post('/api/folders').send({ name: 'Math' });

    const res = await request(app).get('/api/folders');
    const folder = res.body.folders.find((f) => f.name === 'Math');

    expect(folder).toBeDefined();
    expect(folder.noteCount).toBeDefined();
  });

  test('noteCount increases when a note is assigned to a folder', async () => {
    const folderRes = await request(app)
      .post('/api/folders')
      .send({ name: 'History' });

    const folderId = folderRes.body.folder.id;

    await request(app)
      .post('/api/notes')
      .send({ title: 'History Note', content: 'The fall of Rome.', folderId });

    const res = await request(app).get('/api/folders');
    const folder = res.body.folders.find((f) => f.id === folderId);

    expect(folder.noteCount).toBe(1);
  });
});
