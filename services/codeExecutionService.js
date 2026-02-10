const axios = require('axios');

// Judge0 API Configuration
const JUDGE0_API_URL = process.env.JUDGE0_API_URL || 'https://judge0-ce.p.rapidapi.com';
const JUDGE0_API_KEY = process.env.JUDGE0_API_KEY;
const JUDGE0_API_HOST = process.env.JUDGE0_API_HOST || 'judge0-ce.p.rapidapi.com';

// Language ID mapping for Judge0
const LANGUAGE_IDS = {
  'javascript': 63,  // Node.js
  'python': 71,      // Python 3
  'java': 62,        // Java
  'c': 50,           // C (GCC)
  'cpp': 54,         // C++ (GCC)
  'csharp': 51,      // C#
  'go': 60,          // Go
  'ruby': 72,        // Ruby
  'php': 68,         // PHP
  'swift': 83,       // Swift
  'kotlin': 78,      // Kotlin
  'rust': 73,        // Rust
  'typescript': 74,  // TypeScript
  'sql': 82          // SQL
};

/**
 * Submit code for execution to Judge0 API
 * @param {string} code - Source code to execute
 * @param {string} language - Programming language
 * @param {string} stdin - Standard input (optional)
 * @returns {Promise<Object>} Submission result with token
 */
const submitCode = async (code, language, stdin = '') => {
  try {
    const languageId = LANGUAGE_IDS[language.toLowerCase()];
    
    if (!languageId) {
      throw new Error(`Unsupported language: ${language}`);
    }

    // Prepare request options. Support two modes:
    // 1) RapidAPI-hosted Judge0 (requires JUDGE0_API_KEY and JUDGE0_API_HOST)
    // 2) Self-hosted Judge0 instance (no API key required) specified by JUDGE0_API_URL

    const options = {
      method: 'POST',
      url: `${JUDGE0_API_URL.replace(/\/$/, '')}/submissions`,
      params: { base64_encoded: 'false', wait: 'false' },
      headers: {
        'content-type': 'application/json'
      },
      data: {
        source_code: code,
        language_id: languageId,
        stdin: stdin
      }
    };

    // If using RapidAPI-hosted Judge0, include RapidAPI headers
    if (JUDGE0_API_URL.includes('rapidapi') || JUDGE0_API_HOST.includes('rapidapi')) {
      if (!JUDGE0_API_KEY) {
        throw new Error('Judge0 API key not configured. Please set JUDGE0_API_KEY for RapidAPI Judge0 or set JUDGE0_API_URL to your self-hosted instance');
      }
      options.headers['X-RapidAPI-Key'] = JUDGE0_API_KEY;
      options.headers['X-RapidAPI-Host'] = JUDGE0_API_HOST;
    }

    const response = await axios.request(options);
    return {
      success: true,
      token: response.data.token
    };
  } catch (error) {
    console.error('Error submitting code:', error.response?.data || error.message);
    return {
      success: false,
      error: error.response?.data?.message || error.message
    };
  }
};

/**
 * Get execution result from Judge0 API
 * @param {string} token - Submission token
 * @returns {Promise<Object>} Execution result
 */
const getSubmissionResult = async (token) => {
  try {
    const options = {
      method: 'GET',
      url: `${JUDGE0_API_URL.replace(/\/$/, '')}/submissions/${token}`,
      params: { base64_encoded: 'false' },
      headers: {}
    };

    if (JUDGE0_API_URL.includes('rapidapi') || JUDGE0_API_HOST.includes('rapidapi')) {
      if (!JUDGE0_API_KEY) {
        throw new Error('Judge0 API key not configured for RapidAPI-hosted Judge0');
      }
      options.headers['X-RapidAPI-Key'] = JUDGE0_API_KEY;
      options.headers['X-RapidAPI-Host'] = JUDGE0_API_HOST;
    }

    const response = await axios.request(options);
    const result = response.data;

    return {
      success: true,
      status: result.status.description,
      stdout: result.stdout || '',
      stderr: result.stderr || '',
      compile_output: result.compile_output || '',
      time: result.time,
      memory: result.memory,
      exit_code: result.exit_code
    };
  } catch (error) {
    console.error('Error getting submission result:', error.response?.data || error.message);
    return {
      success: false,
      error: error.response?.data?.message || error.message
    };
  }
};

/**
 * Execute code and wait for result (with polling)
 * @param {string} code - Source code to execute
 * @param {string} language - Programming language
 * @param {string} stdin - Standard input (optional)
 * @param {number} maxAttempts - Maximum polling attempts
 * @returns {Promise<Object>} Complete execution result
 */
const executeCode = async (code, language, stdin = '', maxAttempts = 10) => {
  try {
    // Submit code
    const submission = await submitCode(code, language, stdin);
    
    if (!submission.success) {
      return submission;
    }

    const token = submission.token;
    let attempts = 0;

    // Poll for result
    while (attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
      
      const result = await getSubmissionResult(token);
      
      if (!result.success) {
        return result;
      }

      // Check if execution is complete
      if (result.status !== 'In Queue' && result.status !== 'Processing') {
        return result;
      }

      attempts++;
    }

    return {
      success: false,
      error: 'Execution timeout - please try again'
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Validate code syntax without execution
 * @param {string} code - Source code
 * @param {string} language - Programming language
 * @returns {Promise<Object>} Validation result
 */
const validateSyntax = async (code, language) => {
  try {
    const result = await executeCode(code, language, '');
    
    if (!result.success) {
      return result;
    }

    // Check for compilation errors
    if (result.compile_output) {
      return {
        success: false,
        error: 'Syntax Error',
        details: result.compile_output
      };
    }

    return {
      success: true,
      message: 'Code syntax is valid'
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Run code against multiple test cases
 * @param {string} code - Source code
 * @param {string} language - Programming language
 * @param {Array} testCases - Array of {input, expectedOutput}
 * @returns {Promise<Object>} Test results
 */
const runTestCases = async (code, language, testCases) => {
  try {
    const results = [];

    for (let i = 0; i < testCases.length; i++) {
      const testCase = testCases[i];
      const result = await executeCode(code, language, testCase.input);

      if (!result.success) {
        results.push({
          testCase: i + 1,
          passed: false,
          error: result.error
        });
        continue;
      }

      // Check if output matches expected
      const actualOutput = result.stdout?.trim();
      const expectedOutput = testCase.expectedOutput?.trim();
      const passed = actualOutput === expectedOutput;

      results.push({
        testCase: i + 1,
        passed,
        input: testCase.input,
        expectedOutput,
        actualOutput,
        time: result.time,
        memory: result.memory
      });
    }

    const passedCount = results.filter(r => r.passed).length;
    const totalCount = results.length;

    return {
      success: true,
      passedCount,
      totalCount,
      allPassed: passedCount === totalCount,
      results
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};

module.exports = {
  submitCode,
  getSubmissionResult,
  executeCode,
  validateSyntax,
  runTestCases,
  LANGUAGE_IDS
};
