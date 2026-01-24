const mongoose = require('mongoose');
const Quiz = require('./models/Quiz');
require('dotenv').config();

async function checkQuizzes() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    const quizzes = await Quiz.find().select('title class subject difficulty');
    
    console.log(`📊 Total Quizzes in Database: ${quizzes.length}\n`);
    
    if (quizzes.length === 0) {
      console.log('❌ No quizzes found! Run: node seedBCAQuizzes.js');
    } else {
      console.log('📋 Quiz List:');
      console.log('─'.repeat(80));
      quizzes.forEach((quiz, index) => {
        console.log(`${index + 1}. ${quiz.title}`);
        console.log(`   Class: ${quiz.class} | Subject: ${quiz.subject} | Difficulty: ${quiz.difficulty}`);
        console.log('');
      });
    }
    
    // Check for coding questions
    const codingQuizzes = await Quiz.find({ 'questions.type': 'coding' });
    console.log(`\n💻 Quizzes with Coding Questions: ${codingQuizzes.length}`);
    
    // Check classes
    const classes = await Quiz.distinct('class');
    console.log(`\n🎓 Classes Available: ${classes.join(', ')}`);
    
    // Check subjects
    const subjects = await Quiz.distinct('subject');
    console.log(`\n📚 Subjects Available: ${subjects.join(', ')}`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

checkQuizzes();
