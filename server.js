const express = require('express');
const cors = require('cors');
const axios = require('axios');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('.'));

// Judge0 API configuration
const JUDGE0_CONFIG = {
  rapidApiKey: '4aa9195f10msh53bb141b1f86d4bp14dba2jsnb543a8385a94', // Replace with your RapidAPI key
  rapidApiHost: 'judge0-ce.p.rapidapi.com',
  baseUrl: 'https://judge0-ce.p.rapidapi.com'
};

// Language IDs for Judge0
const LANGUAGE_IDS = {
  javascript: 63,
  python: 71,
  java: 62,
  cpp: 54,
  c: 50
};

// API route to submit code
app.post('/api/submit', async (req, res) => {
  try {
    const { source_code, language, stdin } = req.body;

    const response = await axios.post(
      `${JUDGE0_CONFIG.baseUrl}/submissions`,
      {
        source_code,
        language_id: LANGUAGE_IDS[language] || LANGUAGE_IDS.javascript,
        stdin: stdin || '',
        expected_output: '8' // For the sum problem
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'X-RapidAPI-Key': JUDGE0_CONFIG.rapidApiKey,
          'X-RapidAPI-Host': JUDGE0_CONFIG.rapidApiHost
        }
      }
    );

    const token = response.data.token;
    
    // Poll for result
    let result;
    let attempts = 0;
    const maxAttempts = 10;
    
    while (attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const statusResponse = await axios.get(
        `${JUDGE0_CONFIG.baseUrl}/submissions/${token}`,
        {
          headers: {
            'X-RapidAPI-Key': JUDGE0_CONFIG.rapidApiKey,
            'X-RapidAPI-Host': JUDGE0_CONFIG.rapidApiHost
          }
        }
      );
      
      result = statusResponse.data;
      
      if (result.status.id !== 1 && result.status.id !== 2) { // Not in queue or processing
        break;
      }
      
      attempts++;
    }

    res.json({
      success: true,
      result: {
        status: result.status.description,
        output: result.stdout || result.stderr || result.compile_output,
        time: result.time,
        memory: result.memory
      }
    });
    
  } catch (error) {
    console.error('Judge0 API error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to execute code'
    });
  }
});

// Mock problems data
app.get('/api/problems', (req, res) => {
  const problems = [
    {
      id: 1,
      title: 'Sum of Two Numbers',
      difficulty: 'Easy',
      acceptance: '85%',
      description: 'Write a program that takes two numbers as input and returns their sum.',
      inputFormat: 'Two space-separated integers',
      outputFormat: 'A string in the format "Sum = X" where X is the sum',
      sampleInput: '5 3',
      sampleOutput: 'Sum = 8',
      options: [7, 8, 9, 10]
    },
    {
      id: 2,
      title: 'Reverse String',
      difficulty: 'Easy',
      acceptance: '78%',
      description: 'Write a function that reverses a string.',
      inputFormat: 'A string',
      outputFormat: 'The reversed string',
      sampleInput: 'hello',
      sampleOutput: 'olleh',
      options: ['olleh', 'hello', 'helol', 'oleh']
    },
    {
      id: 3,
      title: 'Fibonacci Sequence',
      difficulty: 'Medium',
      acceptance: '65%',
      description: 'Generate the nth Fibonacci number.',
      inputFormat: 'An integer n',
      outputFormat: 'The nth Fibonacci number',
      sampleInput: '5',
      sampleOutput: '5',
      options: [3, 5, 8, 13]
    }
  ];
  
  res.json({ success: true, problems });
});

// Serve the main page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Code Arena server running on http://localhost:${PORT}`);
});