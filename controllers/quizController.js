const Quiz = require('../models/Quiz');
const QuizAttempt = require('../models/QuizAttempt');
const { executeCode, runTestCases } = require('../services/codeExecutionService');

// @desc    Get all active quizzes
// @route   GET /api/quiz
// @access  Private (Student)
exports.getAllQuizzes = async (req, res) => {
  try {
    console.log('GET /api/quiz called by user:', req.user?.name);
    
    const quizzes = await Quiz.find({ isActive: true })
      .select('-questions.correctAnswer') // Don't send correct answers
      .populate('createdBy', 'name')
      .sort('-createdAt');

    console.log(`Found ${quizzes.length} quizzes`);
    console.log('First quiz:', quizzes[0]?.title);

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

    console.log('Quiz found:', quiz.title);
    console.log('Questions count:', quiz.questions?.length);
    console.log('First question:', quiz.questions?.[0]);

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


    // Calculate score for MCQ questions only. Coding questions are stored for manual/async evaluation.
    let earnedPoints = 0;
    const submittedAt = new Date();
    const timeTaken = Math.floor((submittedAt - new Date(startedAt)) / 1000);

    // Build answersWithMeta to store in attempt and calculate MCQ points
    const answersWithMeta = answers.map((answer) => {
      const question = quiz.questions.id(answer.questionId);
      if (!question) return { ...answer, _meta: { points: 0 } };

      if (question.type === 'mcq') {
        const isCorrect = question.correctAnswer === answer.selectedAnswer;
        if (isCorrect) earnedPoints += question.points;
        return { ...answer, _meta: { type: 'mcq', points: question.points, isCorrect } };
      }

      // coding question: store code, language and mark for review
      return { ...answer, _meta: { type: 'coding', points: question.points, reviewed: false } };
    });

    const totalPoints = quiz.questions.reduce((sum, q) => sum + q.points, 0);
    const percentage = totalPoints > 0 ? (earnedPoints / totalPoints) * 100 : 0;
    const passed = percentage >= quiz.passingScore;

    // Save attempt (coding answers saved but not auto-graded)
    const attempt = await QuizAttempt.create({
      student: req.user._id,
      quiz: quiz._id,
      answers: answersWithMeta,
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

    // Map answers with correct/incorrect status (handle MCQ and coding)
    const detailedResults = attempt.answers.map((answer) => {
      const question = quiz.questions.id(answer.questionId);
      if (!question) return { question: 'Unknown question', answer };

      if (question.type === 'mcq') {
        const isCorrect = answer.selectedAnswer === question.correctAnswer;
        return {
          question: question.question,
          type: 'mcq',
          options: question.options,
          selectedAnswer: answer.selectedAnswer,
          correctAnswer: question.correctAnswer,
          isCorrect,
          points: question.points,
          earnedPoints: isCorrect ? question.points : 0,
        };
      }

      // coding question - include submitted code and mark for review
      return {
        question: question.question,
        type: 'coding',
        starterCode: question.starterCode,
        submittedCode: answer.code || answer.submittedCode || null,
        language: answer.language || null,
        points: question.points,
        reviewed: answer._meta?.reviewed || false,
        earnedPoints: answer._meta?.isCorrect ? question.points : 0,
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

// CODING EXECUTION ROUTES

// @desc    Execute code (test run during quiz)
// @route   POST /api/quiz/execute-code
// @access  Private (Student)
exports.executeCode = async (req, res) => {
  try {
    const { code, language, stdin } = req.body;

    if (!code || !language) {
      return res.status(400).json({ 
        message: 'Code and language are required' 
      });
    }

    console.log(`Executing ${language} code for user: ${req.user.name}`);

    const result = await executeCode(code, language, stdin || '');

    if (!result.success) {
      return res.status(400).json({
        success: false,
        error: result.error
      });
    }

    res.json({
      success: true,
      output: result.stdout,
      error: result.stderr,
      compileOutput: result.compile_output,
      status: result.status,
      time: result.time,
      memory: result.memory
    });
  } catch (error) {
    console.error('Code execution error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Error executing code' 
    });
  }
};

// @desc    Run code against test cases
// @route   POST /api/quiz/run-tests
// @access  Private (Student)
exports.runTestCases = async (req, res) => {
  try {
    const { code, language, testCases } = req.body;

    if (!code || !language || !testCases || !Array.isArray(testCases)) {
      return res.status(400).json({ 
        message: 'Code, language, and testCases array are required' 
      });
    }

    console.log(`Running ${testCases.length} test cases for ${language} code`);

    const result = await runTestCases(code, language, testCases);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        error: result.error
      });
    }

    res.json({
      success: true,
      passedCount: result.passedCount,
      totalCount: result.totalCount,
      allPassed: result.allPassed,
      results: result.results
    });
  } catch (error) {
    console.error('Test cases execution error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Error running test cases' 
    });
  }
};

