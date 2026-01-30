const axios = require('axios');

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';

/**
 * Generate quiz questions using Gemini AI
 * @param {string} topic - Topic for quiz generation
 * @param {string} difficulty - Difficulty level (Easy, Medium, Hard)
 * @param {number} numQuestions - Number of questions to generate
 * @returns {Promise<Object>} Generated questions
 */
const generateQuizQuestions = async (topic, difficulty = 'Medium', numQuestions = 5) => {
  try {
    if (!GEMINI_API_KEY || GEMINI_API_KEY === 'your-gemini-api-key-here') {
      throw new Error('Gemini API key not configured. Please set GEMINI_API_KEY in .env file');
    }

    const prompt = `Generate ${numQuestions} multiple choice quiz questions about "${topic}" with ${difficulty} difficulty level.

For each question, provide:
1. The question text
2. Four options (A, B, C, D)
3. The correct answer (0-3 index)
4. A brief explanation

Format the response as a JSON array like this:
[
  {
    "question": "What is...",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctAnswer": 0,
    "explanation": "Brief explanation..."
  }
]

Make questions relevant for BCA/Computer Science students. Focus on practical knowledge and real-world applications.`;

    const response = await axios.post(
      `${GEMINI_API_URL}?key=${GEMINI_API_KEY}`,
      {
        contents: [{
          parts: [{
            text: prompt
          }]
        }]
      },
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    const generatedText = response.data.candidates[0].content.parts[0].text;
    
    // Extract JSON from the response (handle markdown code blocks)
    let jsonText = generatedText;
    if (generatedText.includes('```json')) {
      jsonText = generatedText.split('```json')[1].split('```')[0].trim();
    } else if (generatedText.includes('```')) {
      jsonText = generatedText.split('```')[1].split('```')[0].trim();
    }

    const questions = JSON.parse(jsonText);

    return {
      success: true,
      questions,
      topic,
      difficulty,
      generatedBy: 'Gemini AI'
    };
  } catch (error) {
    console.error('Error generating quiz questions:', error.response?.data || error.message);
    return {
      success: false,
      error: error.response?.data?.error?.message || error.message
    };
  }
};

/**
 * Evaluate coding answer using Gemini AI
 * @param {string} question - The coding question
 * @param {string} code - Student's code submission
 * @param {string} language - Programming language
 * @param {string} expectedOutput - Expected output (optional)
 * @returns {Promise<Object>} Evaluation result
 */
const evaluateCodingAnswer = async (question, code, language, expectedOutput = null) => {
  try {
    if (!GEMINI_API_KEY || GEMINI_API_KEY === 'your-gemini-api-key-here') {
      throw new Error('Gemini API key not configured. Please set GEMINI_API_KEY in .env file');
    }

    const prompt = `As a programming instructor, evaluate this coding solution:

**Question:** ${question}

**Language:** ${language}

**Student's Code:**
\`\`\`${language.toLowerCase()}
${code}
\`\`\`

${expectedOutput ? `**Expected Output:** ${expectedOutput}` : ''}

Please evaluate and provide:
1. **Correctness** (0-100%): Does the code solve the problem correctly?
2. **Code Quality** (0-100%): Is the code well-written, readable, and efficient?
3. **Best Practices** (0-100%): Does it follow language best practices?
4. **Detailed Feedback**: Specific suggestions for improvement
5. **Strengths**: What the student did well
6. **Areas for Improvement**: What could be better
7. **Overall Score** (0-100): Combined assessment
8. **Pass/Fail**: Pass if overall score >= 60

Format response as JSON:
{
  "correctness": 85,
  "codeQuality": 80,
  "bestPractices": 75,
  "overallScore": 80,
  "passed": true,
  "feedback": "Detailed feedback...",
  "strengths": ["Point 1", "Point 2"],
  "improvements": ["Suggestion 1", "Suggestion 2"]
}`;

    const response = await axios.post(
      `${GEMINI_API_URL}?key=${GEMINI_API_KEY}`,
      {
        contents: [{
          parts: [{
            text: prompt
          }]
        }]
      },
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    const generatedText = response.data.candidates[0].content.parts[0].text;
    
    // Extract JSON from the response
    let jsonText = generatedText;
    if (generatedText.includes('```json')) {
      jsonText = generatedText.split('```json')[1].split('```')[0].trim();
    } else if (generatedText.includes('```')) {
      jsonText = generatedText.split('```')[1].split('```')[0].trim();
    }

    const evaluation = JSON.parse(jsonText);

    return {
      success: true,
      evaluation,
      evaluatedBy: 'Gemini AI'
    };
  } catch (error) {
    console.error('Error evaluating code:', error.response?.data || error.message);
    return {
      success: false,
      error: error.response?.data?.error?.message || error.message
    };
  }
};

/**
 * Generate coding question using Gemini AI
 * @param {string} topic - Topic/concept for the coding question
 * @param {string} difficulty - Difficulty level
 * @param {string} language - Preferred programming language
 * @returns {Promise<Object>} Generated coding question
 */
const generateCodingQuestion = async (topic, difficulty = 'Medium', language = 'Python') => {
  try {
    if (!GEMINI_API_KEY || GEMINI_API_KEY === 'your-gemini-api-key-here') {
      throw new Error('Gemini API key not configured. Please set GEMINI_API_KEY in .env file');
    }

    const prompt = `Generate a ${difficulty} level coding question about "${topic}" for ${language}.

Provide:
1. Clear problem statement
2. Input/output examples
3. Constraints
4. Starter code template
5. Expected time complexity
6. Test cases (3-5 cases with input and expected output)

Format as JSON:
{
  "question": "Problem statement...",
  "examples": [
    {"input": "...", "output": "...", "explanation": "..."}
  ],
  "constraints": ["Constraint 1", "Constraint 2"],
  "starterCode": "def function_name():\\n    # Your code here\\n    pass",
  "timeComplexity": "O(n)",
  "testCases": [
    {"input": "...", "expectedOutput": "..."}
  ]
}`;

    const response = await axios.post(
      `${GEMINI_API_URL}?key=${GEMINI_API_KEY}`,
      {
        contents: [{
          parts: [{
            text: prompt
          }]
        }]
      },
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    const generatedText = response.data.candidates[0].content.parts[0].text;
    
    // Extract JSON from the response
    let jsonText = generatedText;
    if (generatedText.includes('```json')) {
      jsonText = generatedText.split('```json')[1].split('```')[0].trim();
    } else if (generatedText.includes('```')) {
      jsonText = generatedText.split('```')[1].split('```')[0].trim();
    }

    const codingQuestion = JSON.parse(jsonText);

    return {
      success: true,
      codingQuestion,
      topic,
      difficulty,
      language,
      generatedBy: 'Gemini AI'
    };
  } catch (error) {
    console.error('Error generating coding question:', error.response?.data || error.message);
    return {
      success: false,
      error: error.response?.data?.error?.message || error.message
    };
  }
};

/**
 * Get hints for solving a coding problem
 * @param {string} question - The coding question
 * @param {string} code - Current student code (optional)
 * @returns {Promise<Object>} Hints and suggestions
 */
const getCodeHints = async (question, code = '') => {
  try {
    if (!GEMINI_API_KEY || GEMINI_API_KEY === 'your-gemini-api-key-here') {
      throw new Error('Gemini API key not configured. Please set GEMINI_API_KEY in .env file');
    }

    const prompt = `As a helpful programming tutor, provide hints for this problem:

**Question:** ${question}

${code ? `**Student's current attempt:**\n\`\`\`\n${code}\n\`\`\`` : ''}

Provide 3 progressive hints (from general to specific) without giving away the complete solution:
1. Hint 1 (High-level approach)
2. Hint 2 (Algorithm/data structure suggestion)
3. Hint 3 (Implementation tip)

Format as JSON:
{
  "hints": [
    "Hint 1...",
    "Hint 2...",
    "Hint 3..."
  ],
  "approach": "General approach description",
  "timeComplexity": "Expected time complexity"
}`;

    const response = await axios.post(
      `${GEMINI_API_URL}?key=${GEMINI_API_KEY}`,
      {
        contents: [{
          parts: [{
            text: prompt
          }]
        }]
      },
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    const generatedText = response.data.candidates[0].content.parts[0].text;
    
    // Extract JSON from the response
    let jsonText = generatedText;
    if (generatedText.includes('```json')) {
      jsonText = generatedText.split('```json')[1].split('```')[0].trim();
    } else if (generatedText.includes('```')) {
      jsonText = generatedText.split('```')[1].split('```')[0].trim();
    }

    const hints = JSON.parse(jsonText);

    return {
      success: true,
      hints: hints.hints,
      approach: hints.approach,
      timeComplexity: hints.timeComplexity
    };
  } catch (error) {
    console.error('Error getting hints:', error.response?.data || error.message);
    return {
      success: false,
      error: error.response?.data?.error?.message || error.message
    };
  }
};

/**
 * Explain code using Gemini AI
 * @param {string} code - Code to explain
 * @param {string} language - Programming language
 * @returns {Promise<Object>} Code explanation
 */
const explainCode = async (code, language) => {
  try {
    if (!GEMINI_API_KEY || GEMINI_API_KEY === 'your-gemini-api-key-here') {
      throw new Error('Gemini API key not configured. Please set GEMINI_API_KEY in .env file');
    }

    const prompt = `Explain this ${language} code in simple terms for a student:

\`\`\`${language.toLowerCase()}
${code}
\`\`\`

Provide:
1. Overall purpose of the code
2. Step-by-step explanation
3. Key concepts used
4. Time and space complexity

Format as JSON:
{
  "purpose": "What this code does...",
  "steps": ["Step 1...", "Step 2..."],
  "concepts": ["Concept 1", "Concept 2"],
  "complexity": {
    "time": "O(n)",
    "space": "O(1)"
  }
}`;

    const response = await axios.post(
      `${GEMINI_API_URL}?key=${GEMINI_API_KEY}`,
      {
        contents: [{
          parts: [{
            text: prompt
          }]
        }]
      },
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    const generatedText = response.data.candidates[0].content.parts[0].text;
    
    // Extract JSON from the response
    let jsonText = generatedText;
    if (generatedText.includes('```json')) {
      jsonText = generatedText.split('```json')[1].split('```')[0].trim();
    } else if (generatedText.includes('```')) {
      jsonText = generatedText.split('```')[1].split('```')[0].trim();
    }

    const explanation = JSON.parse(jsonText);

    return {
      success: true,
      explanation
    };
  } catch (error) {
    console.error('Error explaining code:', error.response?.data || error.message);
    return {
      success: false,
      error: error.response?.data?.error?.message || error.message
    };
  }
};

module.exports = {
  generateQuizQuestions,
  evaluateCodingAnswer,
  generateCodingQuestion,
  getCodeHints,
  explainCode
};
