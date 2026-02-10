const request = require('supertest');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const { MongoMemoryServer } = require('mongodb-memory-server');

// Mock geminiService before importing the app so controllers use the mock
jest.mock('../services/geminiService', () => ({
  generateQuizQuestions: jest.fn(async (topic, difficulty, numQuestions) => {
    // return deterministic set of MCQs
    const questions = Array.from({ length: numQuestions }).map((_, i) => ({
      question: `Question ${i + 1} about ${topic}`,
      options: ['A', 'B', 'C', 'D'],
      correctAnswer: 0,
      type: 'mcq',
      points: 1,
    }));
    return { success: true, questions };
  })
}));

let app;
let mongod;
let studentToken;
let studentId;

beforeAll(async () => {
  process.env.JWT_SECRET = 'test-secret';
  // Try to start in-memory MongoDB; if it fails (missing libraries), fall back to local MongoDB
  try {
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();
    process.env.MONGODB_URI = uri;
  // Connect mongoose
  await mongoose.connect(uri);
  } catch (err) {
    // Fallback to local MongoDB (must be running on the machine)
    const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/leave_test';
    process.env.MONGODB_URI = uri;
  await mongoose.connect(uri);
  }

  // Import app after DB is set
  app = require('../app');

  // Create a student user directly in DB
  const User = require('../models/User');
  const student = await User.create({ name: 'Test Student', email: 'student@example.com', password: 'password', role: 'student' });
  studentId = student._id;
  studentToken = jwt.sign({ id: student._id }, process.env.JWT_SECRET);
});

afterAll(async () => {
  await mongoose.disconnect();
  if (mongod) await mongod.stop();
});

describe('Leave assessment flow', () => {
  let leaveId;

  test('Create leave request with assessment', async () => {
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(startDate.getDate() + 1);

    const res = await request(app)
      .post('/api/leave')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({
        leaveType: 'Personal Leave',
        description: 'Need to attend personal matter',
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        assessmentRequired: true,
        assessmentSection: 'Backend'
      })
      .expect(201);

    expect(res.body.leaveRequest).toBeDefined();
    leaveId = res.body.leaveRequest.id;

    // Fetch leave from DB and ensure assessmentQuestions stored
    const LeaveRequest = require('../models/LeaveRequest');
    const lr = await LeaveRequest.findById(leaveId);
    expect(lr).toBeTruthy();
    expect(Array.isArray(lr.assessmentQuestions)).toBe(true);
    expect(lr.assessmentQuestions.length).toBe(12);
  });

  test('Get assessment questions for student (without correct answers)', async () => {
    const res = await request(app)
      .get(`/api/leave/${leaveId}/assessment`)
      .set('Authorization', `Bearer ${studentToken}`)
      .expect(200);

    expect(res.body.assessment).toBeDefined();
    expect(res.body.assessment.questions.length).toBe(12);
    // questions should not contain correctAnswer when returned to student
    const q = res.body.assessment.questions[0];
    expect(q.options).toBeDefined();
    expect(q.question).toMatch(/Question 1/);
  });

  test('Submit assessment answers and get graded result', async () => {
    // prepare all-correct answers (mocked correctAnswer = 0)
    const answers = Array.from({ length: 12 }).map((_, idx) => ({ id: idx, selectedAnswer: 0 }));
    const res = await request(app)
      .post(`/api/leave/${leaveId}/submit-assessment`)
      .set('Authorization', `Bearer ${studentToken}`)
      .send({ answers, startedAt: new Date().toISOString() })
      .expect(200);

    expect(res.body.score).toBeDefined();
    expect(res.body.passed).toBe(true);
    expect(res.body.score).toBeGreaterThanOrEqual(60);
  });
});
