const express = require('express');
const axios = require('axios');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

// Judge0 Configuration
const RAPIDAPI_KEY = "4aa9195f10msh53bb141b1f86d4bp14dba2jsnb543a8385a94";

// Test Cases
const testCases = [
    { input: "5 7", expected: "Sum = 12"},
    { input: "-3 5", expected: "Sum = 2"},
    { input: "0 0", expected: "Sum = 0"}
];

// API Route
app.post('/api/run', async (req, res) => {
    try {
        const { code, language } = req.body;
        
        const results = [];
        for (const testCase of testCases) {
            try {
                const response = await axios.post(
                    'https://judge0-ce.p.rapidapi.com/submissions?base64_encoded=true&wait=true',
                    {
                        language_id: language === 'c' ? 50 : 71,
                        source_code: Buffer.from(code).toString('base64'),
                        stdin: Buffer.from(testCase.input).toString('base64')
                    },
                    {
                        headers: {
                            'content-type': 'application/json',
                            'X-RapidAPI-Key': RAPIDAPI_KEY,
                            'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com'
                        },
                        timeout: 10000
                    }
                );

                const output = response.data.stdout 
                    ? Buffer.from(response.data.stdout, 'base64').toString()
                    : null;

                // Remove any trailing whitespace for comparison but keep the content
                const cleanOutput = output ? output.trim() : null;
                
                results.push({
                    input: testCase.input,
                    expected: testCase.expected,
                    output: output,
                    passed: cleanOutput === testCase.expected,
                    time: response.data.time
                });
            } catch (error) {
                results.push({
                    input: testCase.input,
                    expected: testCase.expected,
                    output: null,
                    error: 'Execution failed',
                    passed: false
                });
            }
        }

        const passed = results.filter(test => test.passed).length;
        const total = results.length;
        const score = Math.round((passed / total) * 100);

        res.json({ testResults: results, score, passed, total });

    } catch (error) {
        res.json({ error: 'Server error', details: error.message });
    }
});

// Serve frontend
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Start server
app.listen(PORT, () => {
    console.log('🚀 Server running at http://localhost:3000');
});