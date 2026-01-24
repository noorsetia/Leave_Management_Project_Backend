const mongoose = require('mongoose');
const Quiz = require('./models/Quiz');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const quiz = await Quiz.findOne({ title: 'Python Programming' });
  console.log('Python Programming Quiz found:', !!quiz);
  if (quiz) {
    console.log('Number of questions:', quiz.questions.length);
    quiz.questions.forEach((q, i) => {
      console.log(`\nQuestion ${i + 1}:`);
      console.log('  Type:', q.type || 'undefined');
      console.log('  Has options:', !!q.options && q.options.length > 0);
      console.log('  Options count:', q.options?.length || 0);
      console.log('  Question text:', q.question.substring(0, 80));
      if (q.starterCode) {
        console.log('  Has starterCode: YES');
      }
    });
  }
  process.exit(0);
}).catch(err => {
  console.error(err);
  process.exit(1);
});
