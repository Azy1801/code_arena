let typingStartTime = 0;
let typingTimer = null;
let isTyping = false;

function startTypingTimer() {
    if (!isTyping) {
        typingStartTime = Date.now();
        isTyping = true;
        typingTimer = setInterval(() => {
            const elapsed = (Date.now() - typingStartTime) / 1000;
            document.getElementById('typingTime').textContent = `Typing: ${elapsed.toFixed(2)}s`;
        }, 100);
    }
}

function stopTypingTimer() {
    if (isTyping) {
        clearInterval(typingTimer);
        isTyping = false;
    }
}

window.runTests = async function() {
    stopTypingTimer();
    const code = document.getElementById('code').value;
    const language = document.getElementById('language').value;
    const outputDiv = document.getElementById('testResults');
    
    outputDiv.innerHTML = '<p>Running tests...</p>';
    document.getElementById('executionTime').textContent = 'Execution: Processing...';

    try {
        const startTime = Date.now();
        const response = await fetch('/api/run', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code, language })
        });
        
        const result = await response.json();
        const endTime = Date.now();
        
        document.getElementById('executionTime').textContent = `Execution: ${((endTime - startTime)/1000).toFixed(2)}s`;

        if (result.error) {
            outputDiv.innerHTML = `<div class="error">Error: ${result.error}</div>`;
            return;
        }

        let html = `<div class="test-summary">Score: ${result.score}% (${result.passed}/${result.total} passed)</div>`;
        
        result.testResults.forEach((test, index) => {
            html += `
                <div class="test-case ${test.passed ? 'passed' : 'failed'}">
                    <strong>Test ${index + 1}:</strong> ${test.passed ? '✓' : '✗'}
                    <div>Input: ${test.input}</div>
                    <div>Expected: ${test.expected}</div>
                    <div>Output: ${test.output || 'No output'}</div>
                </div>
            `;
        });

        outputDiv.innerHTML = html;

    } catch (error) {
        outputDiv.innerHTML = `<div class="error">Failed: ${error.message}</div>`;
    }
};

window.showSample = function() {
    const language = document.getElementById('language').value;
    const code = language === 'c' 
        ? '#include <stdio.h>\n\nint main() {\n    int a, b;\n    scanf("%d %d", &a, &b);\n    printf("Sum = %d\n", a + b);\n    return 0;\n}'
        : 'a, b = map(int, input().split())\nprint(f"Sum = {a + b}")';
    
    document.getElementById('code').value = code;
    startTypingTimer();
};

document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('code').addEventListener('focus', startTypingTimer);
});