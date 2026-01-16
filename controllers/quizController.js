const Quiz = require('../models/Quiz');
const QuizAttempt = require('../models/QuizAttempt');

// @desc    Get all active quizzes
// @route   GET /api/quiz
// @access  Private (Student)
exports.getAllQuizzes = async (req, res) => {
  try {
    const quizzes = await Quiz.find({ isActive: true })
      .select('-questions.correctAnswer') // Don't send correct answers
      .populate('createdBy', 'name')
      .sort('-createdAt');

    res.json({
      count: quizzes.length,
      quizzes,
    });
  } catch (error) {
    console.error('Get quizzes error:', error);
    res.status(500).json({ message: 'Error fetching quizzes' });
  }
};

// @desc    Get single quiz (without correct answers)
// @route   GET /api/quiz/:id
// @access  Private (Student)
exports.getQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id)
      .select('-questions.correctAnswer')
      .populate('createdBy', 'name');

    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    // Check if student has already attempted this quiz
    const attempt = await QuizAttempt.findOne({
      student: req.user._id,
      quiz: req.params.id,
    });

    res.json({
      quiz,
      hasAttempted: !!attempt,
      lastAttempt: attempt,
    });
  } catch (error) {
    console.error('Get quiz error:', error);
    res.status(500).json({ message: 'Error fetching quiz' });
  }
};

// @desc    Submit quiz attempt
// @route   POST /api/quiz/:id/submit
// @access  Private (Student)
exports.submitQuiz = async (req, res) => {
  try {
    const { answers, startedAt } = req.body;

    // Get quiz with correct answers
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    // Check if already attempted
    const existingAttempt = await QuizAttempt.findOne({
      student: req.user._id,
      quiz: quiz._id,
    });

    if (existingAttempt) {
      return res.status(400).json({ 
        message: 'You have already attempted this quiz',
        attempt: existingAttempt,
      });
    }

    // Calculate score
    let earnedPoints = 0;
    const submittedAt = new Date();
    const timeTaken = Math.floor((submittedAt - new Date(startedAt)) / 1000);

    answers.forEach(answer => {
      const question = quiz.questions.id(answer.questionId);
      if (question && question.correctAnswer === answer.selectedAnswer) {
        earnedPoints += question.points;
      }
    });

    const totalPoints = quiz.questions.reduce((sum, q) => sum + q.points, 0);
    const percentage = (earnedPoints / totalPoints) * 100;
    const passed = percentage >= quiz.passingScore;

    // Save attempt
    const attempt = await QuizAttempt.create({
      student: req.user._id,
      quiz: quiz._id,
      answers,
      score: percentage.toFixed(2),
      percentage: percentage.toFixed(2),
      totalPoints,
      earnedPoints,
      passed,
      timeTaken,
      startedAt,
      submittedAt,
    });

    res.json({
      message: passed ? 'Congratulations! You passed!' : 'Quiz completed. Keep practicing!',
      attempt,
      passed,
      percentage: percentage.toFixed(2),
      earnedPoints,
      totalPoints,
    });
  } catch (error) {
    console.error('Submit quiz error:', error);
    res.status(500).json({ message: 'Error submitting quiz' });
  }
};

// @desc    Get student's quiz attempts
// @route   GET /api/quiz/my-attempts
// @access  Private (Student)
exports.getMyAttempts = async (req, res) => {
  try {
    const attempts = await QuizAttempt.find({ student: req.user._id })
      .populate('quiz', 'title category difficulty passingScore')
      .sort('-createdAt');

    // Calculate statistics
    const stats = {
      totalAttempts: attempts.length,
      passed: attempts.filter(a => a.passed).length,
      failed: attempts.filter(a => !a.passed).length,
      averageScore: attempts.length > 0 
        ? (attempts.reduce((sum, a) => sum + parseFloat(a.percentage), 0) / attempts.length).toFixed(2)
        : 0,
    };

    res.json({
      attempts,
      stats,
    });
  } catch (error) {
    console.error('Get attempts error:', error);
    res.status(500).json({ message: 'Error fetching quiz attempts' });
  }
};

// @desc    Get quiz results with correct answers
// @route   GET /api/quiz/:id/results
// @access  Private (Student)
exports.getQuizResults = async (req, res) => {
  try {
    const attempt = await QuizAttempt.findOne({
      student: req.user._id,
      quiz: req.params.id,
    }).populate('quiz');

    if (!attempt) {
      return res.status(404).json({ message: 'No attempt found for this quiz' });
    }

    // Get quiz with correct answers
    const quiz = await Quiz.findById(req.params.id);

    // Map answers with correct/incorrect status
    const detailedResults = attempt.answers.map(answer => {
      const question = quiz.questions.id(answer.questionId);
      return {
        question: question.question,
        options: question.options,
        selectedAnswer: answer.selectedAnswer,
        correctAnswer: question.correctAnswer,
        isCorrect: answer.selectedAnswer === question.correctAnswer,
        points: question.points,
        earnedPoints: answer.selectedAnswer === question.correctAnswer ? question.points : 0,
      };
    });

    res.json({
      attempt,
      results: detailedResults,
    });
  } catch (error) {
    console.error('Get results error:', error);
    res.status(500).json({ message: 'Error fetching quiz results' });
  }
};

// TEACHER ROUTES

// @desc    Create quiz
// @route   POST /api/quiz/create
// @access  Private (Teacher)
exports.createQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.create({
      ...req.body,
      createdBy: req.user._id,
    });

    res.status(201).json({
      message: 'Quiz created successfully',
      quiz,
    });
  } catch (error) {
    console.error('Create quiz error:', error);
    res.status(500).json({ message: 'Error creating quiz' });
  }
};

// @desc    Get all quizzes (teacher view)
// @route   GET /api/quiz/teacher/all
// @access  Private (Teacher)
exports.getAllQuizzesForTeacher = async (req, res) => {
  try {
    const quizzes = await Quiz.find()
      .populate('createdBy', 'name email')
      .sort('-createdAt');

    // Get attempt count for each quiz
    const quizzesWithStats = await Promise.all(
      quizzes.map(async (quiz) => {
        const attemptCount = await QuizAttempt.countDocuments({ quiz: quiz._id });
        const averageScore = await QuizAttempt.aggregate([
          { $match: { quiz: quiz._id } },
          { $group: { _id: null, avg: { $avg: '$percentage' } } },
        ]);

        return {
          ...quiz.toObject(),
          attemptCount,
          averageScore: averageScore.length > 0 ? averageScore[0].avg.toFixed(2) : 0,
        };
      })
    );

    res.json({
      count: quizzesWithStats.length,
      quizzes: quizzesWithStats,
    });
  } catch (error) {
    console.error('Get all quizzes error:', error);
    res.status(500).json({ message: 'Error fetching quizzes' });
  }
};

// @desc    Update quiz
// @route   PUT /api/quiz/:id
// @access  Private (Teacher)
exports.updateQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    res.json({
      message: 'Quiz updated successfully',
      quiz,
    });
  } catch (error) {
    console.error('Update quiz error:', error);
    res.status(500).json({ message: 'Error updating quiz' });
  }
};

// @desc    Delete quiz
// @route   DELETE /api/quiz/:id
// @access  Private (Teacher)
exports.deleteQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.findByIdAndDelete(req.params.id);

    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    // Delete all attempts for this quiz
    await QuizAttempt.deleteMany({ quiz: req.params.id });

    res.json({ message: 'Quiz deleted successfully' });
  } catch (error) {
    console.error('Delete quiz error:', error);
    res.status(500).json({ message: 'Error deleting quiz' });
  }
};
