const mongoose = require('mongoose');
const Quiz = require('./models/Quiz');
const User = require('./models/User');
require('dotenv').config();

// Sample quizzes data (will add createdBy after finding/creating a teacher)
const getSampleQuizzes = (teacherId) => [
  {
    title: 'JavaScript Fundamentals',
    description: 'Test your knowledge of JavaScript basics including variables, functions, and control flow.',
    category: 'JavaScript',
    class: 'Class 10',
    subject: 'Programming',
    difficulty: 'Easy',
    duration: 15,
    passingScore: 70,
    createdBy: teacherId,
    questions: [
      {
        question: 'What is the correct way to declare a variable in JavaScript?',
        options: ['var x = 5;', 'variable x = 5;', 'v x = 5;', 'int x = 5;'],
        correctAnswer: 0,
        points: 10
      },
      {
        question: 'Which of the following is NOT a JavaScript data type?',
        options: ['String', 'Boolean', 'Float', 'Undefined'],
        correctAnswer: 2,
        points: 10
      },
      {
        question: 'What does "===" operator do in JavaScript?',
        options: ['Assigns a value', 'Checks value equality', 'Checks value and type equality', 'None of the above'],
        correctAnswer: 2,
        points: 10
      },
      {
        question: 'How do you create a function in JavaScript?',
        options: ['function myFunction()', 'def myFunction()', 'create myFunction()', 'func myFunction()'],
        correctAnswer: 0,
        points: 10
      },
      {
        question: 'What is the output of: console.log(typeof null)?',
        options: ['null', 'undefined', 'object', 'number'],
        correctAnswer: 2,
        points: 10
      }
    ],
    isActive: true,
    createdBy: teacherId
  },
  {
    title: 'React Basics',
    description: 'Test your understanding of React components, props, and state management.',
    category: 'React',
    class: 'Class 11',
    subject: 'Programming',
    difficulty: 'Medium',
    duration: 20,
    passingScore: 75,
    createdBy: teacherId,
    questions: [
      {
        question: 'What is JSX in React?',
        options: ['A JavaScript library', 'A syntax extension for JavaScript', 'A CSS framework', 'A database'],
        correctAnswer: 1,
        points: 10
      },
      {
        question: 'Which hook is used to manage state in functional components?',
        options: ['useEffect', 'useState', 'useContext', 'useReducer'],
        correctAnswer: 1,
        points: 10
      },
      {
        question: 'What is the purpose of useEffect hook?',
        options: ['To manage state', 'To handle side effects', 'To create refs', 'To optimize performance'],
        correctAnswer: 1,
        points: 10
      },
      {
        question: 'How do you pass data from parent to child component?',
        options: ['Using state', 'Using props', 'Using context', 'Using events'],
        correctAnswer: 1,
        points: 10
      },
      {
        question: 'What is the virtual DOM?',
        options: ['A real DOM copy', 'An in-memory representation of the real DOM', 'A database', 'A CSS framework'],
        correctAnswer: 1,
        points: 10
      },
      {
        question: 'Which method is called when a component is first created?',
        options: ['componentDidMount', 'componentWillMount', 'constructor', 'render'],
        correctAnswer: 0,
        points: 10
      }
    ],
    isActive: true,
    createdBy: teacherId
  },
  {
    title: 'Node.js & Express',
    description: 'Evaluate your knowledge of Node.js runtime and Express framework.',
    category: 'Node.js',
    class: 'Class 12',
    subject: 'Programming',
    difficulty: 'Medium',
    duration: 25,
    passingScore: 70,
    createdBy: teacherId,
    questions: [
      {
        question: 'What is Node.js?',
        options: ['A JavaScript framework', 'A JavaScript runtime', 'A database', 'A web browser'],
        correctAnswer: 1,
        points: 10
      },
      {
        question: 'Which module is used to create a web server in Node.js?',
        options: ['fs', 'http', 'path', 'url'],
        correctAnswer: 1,
        points: 10
      },
      {
        question: 'What does npm stand for?',
        options: ['Node Package Manager', 'New Project Manager', 'Node Program Manager', 'Network Package Manager'],
        correctAnswer: 0,
        points: 10
      },
      {
        question: 'What is middleware in Express?',
        options: ['A database', 'Functions that execute during request-response cycle', 'A routing method', 'A template engine'],
        correctAnswer: 1,
        points: 10
      },
      {
        question: 'Which HTTP method is used to update data?',
        options: ['GET', 'POST', 'PUT', 'DELETE'],
        correctAnswer: 2,
        points: 10
      }
    ],
    isActive: true,
    createdBy: teacherId
  },
  {
    title: 'Database Concepts',
    description: 'Test your understanding of databases, SQL, and MongoDB.',
    category: 'Database',
    class: 'Class 11',
    subject: 'Computer Science',
    difficulty: 'Easy',
    duration: 20,
    passingScore: 65,
    createdBy: teacherId,
    questions: [
      {
        question: 'What does SQL stand for?',
        options: ['Structured Query Language', 'Simple Query Language', 'Standard Query Language', 'Structured Question Language'],
        correctAnswer: 0,
        points: 10
      },
      {
        question: 'Which type of database is MongoDB?',
        options: ['Relational', 'NoSQL', 'Graph', 'Object-oriented'],
        correctAnswer: 1,
        points: 10
      },
      {
        question: 'What is a primary key in a database?',
        options: ['A unique identifier for a record', 'A foreign key', 'An index', 'A query'],
        correctAnswer: 0,
        points: 10
      },
      {
        question: 'Which command is used to retrieve data from a SQL database?',
        options: ['INSERT', 'UPDATE', 'SELECT', 'DELETE'],
        correctAnswer: 2,
        points: 10
      },
      {
        question: 'What is an index in a database?',
        options: ['A data structure to improve query performance', 'A primary key', 'A table', 'A relationship'],
        correctAnswer: 0,
        points: 10
      }
    ],
    isActive: true,
    createdBy: teacherId
  },
  {
    title: 'Data Structures & Algorithms',
    description: 'Challenge yourself with fundamental DSA concepts.',
    category: 'DSA',
    class: 'Class 12',
    subject: 'Computer Science',
    difficulty: 'Hard',
    duration: 30,
    passingScore: 80,
    createdBy: teacherId,
    questions: [
      {
        question: 'What is the time complexity of binary search?',
        options: ['O(n)', 'O(log n)', 'O(n log n)', 'O(1)'],
        correctAnswer: 1,
        points: 15
      },
      {
        question: 'Which data structure uses LIFO principle?',
        options: ['Queue', 'Stack', 'Array', 'Tree'],
        correctAnswer: 1,
        points: 15
      },
      {
        question: 'What is the worst-case time complexity of quicksort?',
        options: ['O(n)', 'O(log n)', 'O(n log n)', 'O(n²)'],
        correctAnswer: 3,
        points: 15
      },
      {
        question: 'Which traversal visits the root node last?',
        options: ['Preorder', 'Inorder', 'Postorder', 'Level-order'],
        correctAnswer: 2,
        points: 15
      },
      {
        question: 'What is a hash collision?',
        options: ['When two keys hash to the same index', 'When hash function fails', 'When hash table is full', 'When hash is null'],
        correctAnswer: 0,
        points: 15
      }
    ],
    isActive: true,
    createdBy: teacherId
  },
  {
    title: 'Python Programming',
    description: 'Test your Python programming skills.',
    category: 'Python',
    class: 'Class 10',
    subject: 'Programming',
    difficulty: 'Easy',
    duration: 15,
    passingScore: 70,
    createdBy: teacherId,
    questions: [
      {
        question: 'Which keyword is used to define a function in Python?',
        options: ['function', 'def', 'func', 'define'],
        correctAnswer: 1,
        points: 10
      },
      {
        question: 'What is the output of: print(type([]))?',
        options: ['<class \'array\'>', '<class \'list\'>', '<class \'tuple\'>', '<class \'dict\'>'],
        correctAnswer: 1,
        points: 10
      },
      {
        question: 'How do you create a comment in Python?',
        options: ['// comment', '/* comment */', '# comment', '<!-- comment -->'],
        correctAnswer: 2,
        points: 10
      },
      {
        question: 'Which method is used to add an element to a list?',
        options: ['add()', 'append()', 'insert()', 'push()'],
        correctAnswer: 1,
        points: 10
      },
      {
        question: 'Write a function that returns the length of a list without using built-in len()',
        type: 'coding',
        starterCode: "def custom_len(arr):\n    # your code here",
        points: 20
      }
    ],
    isActive: true,
    createdBy: teacherId
  },
  {
    title: 'Mathematics - Algebra Basics',
    description: 'Test your understanding of basic algebraic concepts.',
    category: 'General',
    class: 'Class 8',
    subject: 'Mathematics',
    difficulty: 'Easy',
    duration: 20,
    passingScore: 70,
    createdBy: teacherId,
    questions: [
      {
        question: 'What is the value of x if 2x + 5 = 15?',
        options: ['5', '10', '7.5', '15'],
        correctAnswer: 0,
        points: 10
      },
      {
        question: 'Simplify: 3(x + 4)',
        options: ['3x + 4', '3x + 12', 'x + 12', '3x + 7'],
        correctAnswer: 1,
        points: 10
      },
      {
        question: 'What is the square root of 144?',
        options: ['11', '12', '13', '14'],
        correctAnswer: 1,
        points: 10
      },
      {
        question: 'If a² = 25, what is the value of a?',
        options: ['5 only', '-5 only', '5 or -5', '25'],
        correctAnswer: 2,
        points: 10
      },
      {
        question: 'Solve for y: y/3 = 9',
        options: ['3', '6', '27', '12'],
        correctAnswer: 2,
        points: 10
      }
    ],
    isActive: true,
    createdBy: teacherId
  },
  {
    title: 'Science - Physics Fundamentals',
    description: 'Basic concepts of motion, force, and energy.',
    category: 'General',
    class: 'Class 9',
    subject: 'Physics',
    difficulty: 'Medium',
    duration: 25,
    passingScore: 65,
    createdBy: teacherId,
    questions: [
      {
        question: 'What is the SI unit of force?',
        options: ['Joule', 'Newton', 'Watt', 'Pascal'],
        correctAnswer: 1,
        points: 10
      },
      {
        question: 'The formula for speed is:',
        options: ['Distance/Time', 'Time/Distance', 'Distance × Time', 'Force × Distance'],
        correctAnswer: 0,
        points: 10
      },
      {
        question: 'What is the acceleration due to gravity on Earth?',
        options: ['9.8 m/s²', '8.9 m/s²', '10 m/s²', '11 m/s²'],
        correctAnswer: 0,
        points: 10
      },
      {
        question: 'Which law states "For every action, there is an equal and opposite reaction"?',
        options: ['First Law', 'Second Law', 'Third Law', 'Law of Gravity'],
        correctAnswer: 2,
        points: 10
      },
      {
        question: 'What type of energy does a moving object have?',
        options: ['Potential', 'Kinetic', 'Chemical', 'Nuclear'],
        correctAnswer: 1,
        points: 10
      }
    ],
    isActive: true,
    createdBy: teacherId
  },
  {
    title: 'English Grammar & Vocabulary',
    description: 'Test your English language skills.',
    category: 'General',
    class: 'Class 7',
    subject: 'English',
    difficulty: 'Easy',
    duration: 15,
    passingScore: 70,
    createdBy: teacherId,
    questions: [
      {
        question: 'Which word is a noun?',
        options: ['Quickly', 'Beautiful', 'Book', 'Run'],
        correctAnswer: 2,
        points: 10
      },
      {
        question: 'Identify the verb in: "She sings beautifully."',
        options: ['She', 'Sings', 'Beautifully', 'None'],
        correctAnswer: 1,
        points: 10
      },
      {
        question: 'What is the plural of "child"?',
        options: ['Childs', 'Children', 'Childes', 'Childrens'],
        correctAnswer: 1,
        points: 10
      },
      {
        question: 'Choose the correct sentence:',
        options: ['He don\'t like pizza', 'He doesn\'t likes pizza', 'He doesn\'t like pizza', 'He not like pizza'],
        correctAnswer: 2,
        points: 10
      },
      {
        question: 'What is a synonym for "happy"?',
        options: ['Sad', 'Joyful', 'Angry', 'Tired'],
        correctAnswer: 1,
        points: 10
      }
    ],
    isActive: true,
    createdBy: teacherId
  }
];

async function seedQuizzes() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Find or create a teacher user for quiz creation
    let teacher = await User.findOne({ role: 'teacher' });
    
    if (!teacher) {
      console.log('No teacher found, creating a default teacher account...');
      const bcrypt = require('bcryptjs');
      const hashedPassword = await bcrypt.hash('teacher123', 10);
      
      teacher = await User.create({
        name: 'Quiz Administrator',
        email: 'quiz_admin@navgurukul.org',
        password: hashedPassword,
        role: 'teacher'
      });
      console.log('✓ Created default teacher account');
      console.log('  Email: quiz_admin@navgurukul.org');
      console.log('  Password: teacher123');
    } else {
      console.log(`✓ Using existing teacher: ${teacher.name}`);
    }

    // Get sample quizzes with teacher ID
    const sampleQuizzes = getSampleQuizzes(teacher._id);

    // Clear existing quizzes to avoid duplicates
    await Quiz.deleteMany({});
    console.log('Cleared existing quizzes');

    // Insert sample quizzes
    const insertedQuizzes = await Quiz.insertMany(sampleQuizzes);
    console.log(`\n✓ Successfully inserted ${insertedQuizzes.length} quizzes`);

    // Display inserted quizzes
    insertedQuizzes.forEach((quiz, index) => {
      console.log(`\n${index + 1}. ${quiz.title}`);
      console.log(`   Category: ${quiz.category} | Difficulty: ${quiz.difficulty}`);
      console.log(`   Duration: ${quiz.duration} mins | Passing: ${quiz.passingScore}%`);
      console.log(`   Questions: ${quiz.questions.length} | Total Points: ${quiz.totalPoints}`);
    });

    console.log('\n✓ Quiz seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding quizzes:', error);
    process.exit(1);
  }
}

// Run the seed function
seedQuizzes();
