const mongoose = require('mongoose');
const Quiz = require('./models/Quiz');
const User = require('./models/User');
require('dotenv').config();

// BCA-Level Programming Quizzes
const getBCAQuizzes = (teacherId) => [
  // Data Structures & Algorithms
  {
    title: 'Data Structures Fundamentals - Arrays & Linked Lists',
    description: 'Comprehensive test on Array and Linked List data structures, operations, and complexity analysis.',
    category: 'DSA',
    class: 'BCA 2nd Year',
    subject: 'Data Structures',
    difficulty: 'Medium',
    duration: 25,
    passingScore: 75,
    createdBy: teacherId,
    questions: [
      {
        question: 'What is the time complexity of accessing an element in an array by index?',
        options: ['O(1)', 'O(n)', 'O(log n)', 'O(n²)'],
        correctAnswer: 0,
        points: 10
      },
      {
        question: 'Which operation is more efficient in a Singly Linked List compared to an Array?',
        options: ['Random access', 'Insertion at beginning', 'Binary search', 'Memory utilization'],
        correctAnswer: 1,
        points: 10
      },
      {
        question: 'In a circular linked list, what does the last node point to?',
        options: ['NULL', 'First node', 'Previous node', 'Itself'],
        correctAnswer: 1,
        points: 10
      },
      {
        question: 'What is the space complexity of merge sort algorithm?',
        options: ['O(1)', 'O(log n)', 'O(n)', 'O(n log n)'],
        correctAnswer: 2,
        points: 10
      },
      {
        question: 'Write a function to reverse a singly linked list in C++.',
        type: 'coding',
        starterCode: `struct Node {
    int data;
    Node* next;
    Node(int val) : data(val), next(nullptr) {}
};

Node* reverseList(Node* head) {
    // Your code here
    
}`,
        points: 20
      }
    ],
    isActive: true
  },

  // C Programming
  {
    title: 'C Programming - Pointers & Memory Management',
    description: 'Advanced concepts in C including pointers, dynamic memory allocation, and memory management.',
    category: 'General',
    class: 'BCA 1st Year',
    subject: 'C Programming',
    difficulty: 'Hard',
    duration: 30,
    passingScore: 70,
    createdBy: teacherId,
    questions: [
      {
        question: 'What is a dangling pointer?',
        options: [
          'A pointer pointing to NULL',
          'A pointer pointing to deallocated memory',
          'A pointer pointing to an invalid address',
          'A pointer not initialized'
        ],
        correctAnswer: 1,
        points: 10
      },
      {
        question: 'Which function is used to allocate memory dynamically in C?',
        options: ['alloc()', 'malloc()', 'new()', 'create()'],
        correctAnswer: 1,
        points: 10
      },
      {
        question: 'What does the following code print? int x = 5; int *p = &x; printf("%d", *p);',
        options: ['Address of x', '5', 'Garbage value', 'Compiler error'],
        correctAnswer: 1,
        points: 10
      },
      {
        question: 'What is the difference between malloc() and calloc()?',
        options: [
          'malloc initializes to 0, calloc does not',
          'calloc initializes to 0, malloc does not',
          'No difference',
          'malloc is faster than calloc'
        ],
        correctAnswer: 1,
        points: 10
      },
      {
        question: 'Write a C program to swap two numbers using pointers.',
        type: 'coding',
        starterCode: `#include <stdio.h>

void swap(int *a, int *b) {
    // Your code here
    
}

int main() {
    int x = 10, y = 20;
    swap(&x, &y);
    printf("x = %d, y = %d", x, y);
    return 0;
}`,
        points: 20
      }
    ],
    isActive: true
  },

  // Object-Oriented Programming with C++
  {
    title: 'OOP Concepts with C++',
    description: 'Test your understanding of Object-Oriented Programming principles using C++.',
    category: 'General',
    class: 'BCA 2nd Year',
    subject: 'Object Oriented Programming',
    difficulty: 'Medium',
    duration: 30,
    passingScore: 75,
    createdBy: teacherId,
    questions: [
      {
        question: 'Which of the following is NOT a pillar of OOP?',
        options: ['Abstraction', 'Encapsulation', 'Compilation', 'Inheritance'],
        correctAnswer: 2,
        points: 10
      },
      {
        question: 'What is the correct syntax for a copy constructor in C++?',
        options: [
          'ClassName(ClassName obj)',
          'ClassName(const ClassName& obj)',
          'ClassName(ClassName* obj)',
          'ClassName(ClassName obj&)'
        ],
        correctAnswer: 1,
        points: 10
      },
      {
        question: 'What is the order of constructor calls when using inheritance?',
        options: [
          'Child then Parent',
          'Parent then Child',
          'Depends on access specifier',
          'Random order'
        ],
        correctAnswer: 1,
        points: 10
      },
      {
        question: 'Can we have virtual constructors in C++?',
        options: ['Yes', 'No', 'Only in derived class', 'Only in base class'],
        correctAnswer: 1,
        points: 10
      },
      {
        question: 'Implement a C++ class "Rectangle" with constructor, area() and perimeter() methods.',
        type: 'coding',
        starterCode: `#include <iostream>
using namespace std;

class Rectangle {
private:
    double length, width;
    
public:
    // Constructor
    
    // area() method
    
    // perimeter() method
    
};

int main() {
    Rectangle r(5.0, 3.0);
    cout << "Area: " << r.area() << endl;
    cout << "Perimeter: " << r.perimeter() << endl;
    return 0;
}`,
        points: 20
      }
    ],
    isActive: true
  },

  // Java Programming
  {
    title: 'Java Programming - Core Concepts',
    description: 'Essential Java programming concepts including classes, interfaces, and exception handling.',
    category: 'General',
    class: 'BCA 2nd Year',
    subject: 'Java Programming',
    difficulty: 'Medium',
    duration: 30,
    passingScore: 75,
    createdBy: teacherId,
    questions: [
      {
        question: 'Which of these is the correct way to create an object in Java?',
        options: [
          'MyClass obj = new MyClass;',
          'MyClass obj = new MyClass();',
          'MyClass obj = MyClass();',
          'new MyClass obj;'
        ],
        correctAnswer: 1,
        points: 10
      },
      {
        question: 'What is the default value of a boolean variable in Java?',
        options: ['true', 'false', '0', 'null'],
        correctAnswer: 1,
        points: 10
      },
      {
        question: 'Which keyword is used to inherit a class in Java?',
        options: ['extends', 'inherits', 'implements', 'super'],
        correctAnswer: 0,
        points: 10
      },
      {
        question: 'Can we override static methods in Java?',
        options: ['Yes', 'No', 'Only in abstract classes', 'Only if they are public'],
        correctAnswer: 1,
        points: 10
      },
      {
        question: 'Write a Java program to check if a number is prime.',
        type: 'coding',
        starterCode: `public class PrimeCheck {
    
    public static boolean isPrime(int n) {
        // Your code here
        
    }
    
    public static void main(String[] args) {
        System.out.println(isPrime(17)); // Should print true
        System.out.println(isPrime(18)); // Should print false
    }
}`,
        points: 20
      }
    ],
    isActive: true
  },

  // Python Programming
  {
    title: 'Python Programming - Advanced Concepts',
    description: 'Advanced Python concepts including list comprehensions, decorators, and generators.',
    category: 'Python',
    class: 'BCA 3rd Year',
    subject: 'Python Programming',
    difficulty: 'Hard',
    duration: 30,
    passingScore: 70,
    createdBy: teacherId,
    questions: [
      {
        question: 'What is the output of: print(type([]))?',
        options: ["<class 'list'>", "<class 'array'>", "<class 'tuple'>", "Error"],
        correctAnswer: 0,
        points: 10
      },
      {
        question: 'Which of the following is mutable in Python?',
        options: ['Tuple', 'String', 'List', 'Integer'],
        correctAnswer: 2,
        points: 10
      },
      {
        question: 'What does the zip() function do in Python?',
        options: [
          'Compresses files',
          'Combines multiple iterables',
          'Encrypts data',
          'Imports modules'
        ],
        correctAnswer: 1,
        points: 10
      },
      {
        question: 'What is a lambda function in Python?',
        options: [
          'A recursive function',
          'An anonymous function',
          'A built-in function',
          'A class method'
        ],
        correctAnswer: 1,
        points: 10
      },
      {
        question: 'Write a Python function to find the factorial of a number using recursion.',
        type: 'coding',
        starterCode: `def factorial(n):
    # Your code here
    
    
# Test cases
print(factorial(5))  # Should print 120
print(factorial(0))  # Should print 1`,
        points: 20
      }
    ],
    isActive: true
  },

  // Database Management System
  {
    title: 'Database Management System - SQL & Normalization',
    description: 'Comprehensive test on SQL queries, database design, and normalization techniques.',
    category: 'Database',
    class: 'BCA 2nd Year',
    subject: 'Database Management',
    difficulty: 'Hard',
    duration: 30,
    passingScore: 70,
    createdBy: teacherId,
    questions: [
      {
        question: 'Which SQL clause is used to filter records?',
        options: ['SELECT', 'WHERE', 'FILTER', 'HAVING'],
        correctAnswer: 1,
        points: 10
      },
      {
        question: 'What does ACID stand for in database transactions?',
        options: [
          'Atomicity, Consistency, Isolation, Durability',
          'Accuracy, Consistency, Integrity, Durability',
          'Atomicity, Completeness, Isolation, Dependency',
          'Accuracy, Completeness, Integrity, Dependency'
        ],
        correctAnswer: 0,
        points: 10
      },
      {
        question: 'Which normal form eliminates transitive dependencies?',
        options: ['1NF', '2NF', '3NF', 'BCNF'],
        correctAnswer: 2,
        points: 10
      },
      {
        question: 'What is the purpose of the JOIN operation in SQL?',
        options: [
          'To delete records',
          'To combine rows from multiple tables',
          'To update records',
          'To create new tables'
        ],
        correctAnswer: 1,
        points: 10
      },
      {
        question: 'Write an SQL query to find the second highest salary from an Employee table.',
        type: 'coding',
        starterCode: `-- Employee table structure:
-- CREATE TABLE Employee (
--     id INT PRIMARY KEY,
--     name VARCHAR(100),
--     salary DECIMAL(10,2)
-- );

-- Your SQL query here:
SELECT 
`,
        points: 20
      }
    ],
    isActive: true
  },

  // Web Technologies
  {
    title: 'Web Technologies - HTML, CSS & JavaScript',
    description: 'Test your knowledge of modern web development including HTML5, CSS3, and JavaScript ES6+.',
    category: 'JavaScript',
    class: 'BCA 3rd Year',
    subject: 'Web Development',
    difficulty: 'Medium',
    duration: 25,
    passingScore: 75,
    createdBy: teacherId,
    questions: [
      {
        question: 'Which HTML5 element is used for semantic navigation?',
        options: ['<navigation>', '<nav>', '<menu>', '<navbar>'],
        correctAnswer: 1,
        points: 10
      },
      {
        question: 'What is the CSS property to make text bold?',
        options: ['text-style: bold', 'font-weight: bold', 'text-weight: bold', 'font-style: bold'],
        correctAnswer: 1,
        points: 10
      },
      {
        question: 'What does DOM stand for?',
        options: [
          'Document Object Model',
          'Data Object Model',
          'Document Oriented Model',
          'Dynamic Object Model'
        ],
        correctAnswer: 0,
        points: 10
      },
      {
        question: 'Which method is used to add an event listener in JavaScript?',
        options: ['attachEvent()', 'addEventListener()', 'addEvent()', 'on()'],
        correctAnswer: 1,
        points: 10
      },
      {
        question: 'Write a JavaScript function to validate an email address using regex.',
        type: 'coding',
        starterCode: `function validateEmail(email) {
    // Your code here using regex
    
}

// Test cases
console.log(validateEmail("test@example.com")); // true
console.log(validateEmail("invalid.email")); // false`,
        points: 20
      }
    ],
    isActive: true
  },

  // Operating Systems
  {
    title: 'Operating Systems - Process & Memory Management',
    description: 'Advanced concepts in OS including process scheduling, deadlocks, and memory management.',
    category: 'General',
    class: 'BCA 3rd Year',
    subject: 'Operating Systems',
    difficulty: 'Hard',
    duration: 30,
    passingScore: 70,
    createdBy: teacherId,
    questions: [
      {
        question: 'Which scheduling algorithm may cause starvation?',
        options: ['FCFS', 'Round Robin', 'Priority Scheduling', 'SJF'],
        correctAnswer: 2,
        points: 10
      },
      {
        question: 'What are the four necessary conditions for deadlock?',
        options: [
          'Mutual Exclusion, Hold & Wait, No Preemption, Circular Wait',
          'Mutual Exclusion, Hold & Wait, Preemption, Linear Wait',
          'Shared Resources, Hold & Wait, No Preemption, Circular Wait',
          'Mutual Exclusion, Release & Wait, No Preemption, Circular Wait'
        ],
        correctAnswer: 0,
        points: 10
      },
      {
        question: 'In paging, what is a page fault?',
        options: [
          'A hardware error',
          'When the required page is not in main memory',
          'When memory is full',
          'A software bug'
        ],
        correctAnswer: 1,
        points: 10
      },
      {
        question: 'What is the purpose of the Translation Lookaside Buffer (TLB)?',
        options: [
          'To store frequently used pages',
          'To speed up virtual to physical address translation',
          'To manage disk I/O',
          'To handle interrupts'
        ],
        correctAnswer: 1,
        points: 10
      },
      {
        question: 'Calculate the average waiting time for processes with arrival times [0,1,2] and burst times [4,3,1] using FCFS.',
        type: 'coding',
        starterCode: `// Process scheduling simulation
// Process P1: arrival=0, burst=4
// Process P2: arrival=1, burst=3
// Process P3: arrival=2, burst=1

function calculateAverageWaitingTime() {
    // Your code here
    // Return the average waiting time
    
}

console.log(calculateAverageWaitingTime());`,
        points: 20
      }
    ],
    isActive: true
  },

  // Computer Networks
  {
    title: 'Computer Networks - TCP/IP & Protocols',
    description: 'Comprehensive test on networking concepts, protocols, and network security.',
    category: 'General',
    class: 'BCA 3rd Year',
    subject: 'Computer Networks',
    difficulty: 'Medium',
    duration: 25,
    passingScore: 75,
    createdBy: teacherId,
    questions: [
      {
        question: 'Which layer of the OSI model is responsible for routing?',
        options: ['Data Link Layer', 'Network Layer', 'Transport Layer', 'Session Layer'],
        correctAnswer: 1,
        points: 10
      },
      {
        question: 'What is the default port number for HTTP?',
        options: ['21', '22', '80', '443'],
        correctAnswer: 2,
        points: 10
      },
      {
        question: 'Which protocol is used to resolve IP addresses to MAC addresses?',
        options: ['DNS', 'DHCP', 'ARP', 'RARP'],
        correctAnswer: 2,
        points: 10
      },
      {
        question: 'In a Class C network, how many bits are used for the host portion?',
        options: ['8', '16', '24', '32'],
        correctAnswer: 0,
        points: 10
      },
      {
        question: 'Write a Python script to check if a given IP address is valid (IPv4).',
        type: 'coding',
        starterCode: `def is_valid_ipv4(ip):
    # Your code here
    # Return True if valid, False otherwise
    

# Test cases
print(is_valid_ipv4("192.168.1.1"))    # True
print(is_valid_ipv4("256.1.1.1"))      # False
print(is_valid_ipv4("192.168.1"))      # False`,
        points: 20
      }
    ],
    isActive: true
  },

  // React.js Advanced
  {
    title: 'React.js - Hooks & State Management',
    description: 'Advanced React concepts including hooks, context API, and component lifecycle.',
    category: 'React',
    class: 'BCA 3rd Year',
    subject: 'Web Development',
    difficulty: 'Hard',
    duration: 30,
    passingScore: 70,
    createdBy: teacherId,
    questions: [
      {
        question: 'Which hook is used for side effects in React?',
        options: ['useState', 'useEffect', 'useContext', 'useReducer'],
        correctAnswer: 1,
        points: 10
      },
      {
        question: 'What is the purpose of the dependency array in useEffect?',
        options: [
          'To pass dependencies to components',
          'To control when the effect runs',
          'To define state variables',
          'To handle errors'
        ],
        correctAnswer: 1,
        points: 10
      },
      {
        question: 'What does React.memo() do?',
        options: [
          'Stores component state',
          'Prevents unnecessary re-renders',
          'Creates a new component',
          'Handles memory leaks'
        ],
        correctAnswer: 1,
        points: 10
      },
      {
        question: 'Which hook would you use to access the previous value of a state?',
        options: ['useState', 'useEffect', 'useRef', 'useMemo'],
        correctAnswer: 2,
        points: 10
      },
      {
        question: 'Create a custom React hook called useCounter that manages a counter with increment and decrement functions.',
        type: 'coding',
        starterCode: `import { useState } from 'react';

function useCounter(initialValue = 0) {
    // Your code here
    // Return { count, increment, decrement, reset }
    
}

// Example usage:
// const { count, increment, decrement, reset } = useCounter(0);`,
        points: 20
      }
    ],
    isActive: true
  }
];

async function seedBCAQuizzes() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Find or create a teacher user
    let teacher = await User.findOne({ role: 'teacher' });
    
    if (!teacher) {
      console.log('No teacher found, creating one...');
      teacher = await User.create({
        name: 'Prof. Admin',
        email: 'admin@bca.edu',
        password: 'admin123', // Will be hashed by pre-save hook
        role: 'teacher',
        phoneNumber: '9999999999'
      });
      console.log('Teacher created:', teacher.email);
    }

    // Clear existing quizzes (optional - comment out if you want to keep old quizzes)
    console.log('Clearing existing quizzes...');
    await Quiz.deleteMany({});
    console.log('Existing quizzes cleared');

    // Get BCA quizzes with teacher ID
    const bcaQuizzes = getBCAQuizzes(teacher._id);

    // Insert all quizzes
    console.log(`Inserting ${bcaQuizzes.length} BCA-level quizzes...`);
    const result = await Quiz.insertMany(bcaQuizzes);
    
    console.log(`✅ Successfully seeded ${result.length} BCA-level quizzes!`);
    
    // Display summary
    console.log('\n📊 Quiz Summary:');
    bcaQuizzes.forEach((quiz, index) => {
      const codingQuestions = quiz.questions.filter(q => q.type === 'coding').length;
      const mcqQuestions = quiz.questions.length - codingQuestions;
      console.log(`${index + 1}. ${quiz.title}`);
      console.log(`   Class: ${quiz.class} | Subject: ${quiz.subject} | Difficulty: ${quiz.difficulty}`);
      console.log(`   Questions: ${mcqQuestions} MCQ + ${codingQuestions} Coding`);
      console.log('');
    });

    process.exit(0);
  } catch (error) {
    console.error('Error seeding BCA quizzes:', error);
    process.exit(1);
  }
}

// Run the seeder
seedBCAQuizzes();
