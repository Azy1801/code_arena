// Frontend JavaScript for Code Arena
class CodeArena {
    constructor() {
        this.currentPage = 'dashboard';
        this.currentProblem = null;
        this.problems = [];
        
        this.init();
    }

    async init() {
        this.setupNavigation();
        await this.loadProblems();
        this.setupEventListeners();
        this.showPage('dashboard');
    }

    setupNavigation() {
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const page = link.getAttribute('data-page');
                this.showPage(page);
            });
        });
    }

    setupEventListeners() {
        // Run code button
        const runCodeBtn = document.getElementById('run-code');
        if (runCodeBtn) {
            runCodeBtn.addEventListener('click', () => this.runCode());
        }

        // Language selector
        const languageSelect = document.getElementById('language-select');
        if (languageSelect) {
            languageSelect.addEventListener('change', () => this.updateCodeTemplate());
        }
    }

    async loadProblems() {
        try {
            const response = await fetch('/api/problems');
            const data = await response.json();
            
            if (data.success) {
                this.problems = data.problems;
                this.renderProblemsList();
            }
        } catch (error) {
            console.error('Failed to load problems:', error);
        }
    }

    renderProblemsList() {
        const problemsList = document.getElementById('problems-list');
        if (!problemsList) return;

        problemsList.innerHTML = this.problems.map(problem => `
            <div class="problem-item border-b border-gray-700 last:border-b-0 hover:bg-gray-750 transition-all cursor-pointer" data-problem-id="${problem.id}">
                <div class="p-6">
                    <div class="flex items-center justify-between">
                        <div class="flex items-center space-x-4">
                            <div class="w-8 h-8 flex items-center justify-center bg-purple-500/20 rounded-full">
                                <span class="text-purple-400 text-sm font-bold">${problem.id}</span>
                            </div>
                            <div>
                                <h3 class="text-white font-medium hover:text-purple-400 transition-all">${problem.title}</h3>
                                <p class="text-gray-400 text-sm mt-1">${problem.description}</p>
                            </div>
                        </div>
                        <div class="flex items-center space-x-6">
                            <span class="difficulty-badge px-3 py-1 rounded-full text-xs font-medium ${this.getDifficultyColor(problem.difficulty)}">
                                ${problem.difficulty}
                            </span>
                            <span class="text-gray-400 text-sm">Acceptance: ${problem.acceptance}</span>
                            <button class="text-purple-400 hover:text-purple-300 transition-all">→</button>
                        </div>
                    </div>
                </div>
            </div>
        `).join('');

        // Add click event listeners to problem items
        document.querySelectorAll('.problem-item').forEach(item => {
            item.addEventListener('click', () => {
                const problemId = item.getAttribute('data-problem-id');
                this.showProblemDetail(parseInt(problemId));
            });
        });
    }

    getDifficultyColor(difficulty) {
        switch (difficulty) {
            case 'Easy': return 'text-green-400 bg-green-400/20';
            case 'Medium': return 'text-yellow-400 bg-yellow-400/20';
            case 'Hard': return 'text-red-400 bg-red-400/20';
            default: return 'text-purple-400 bg-purple-400/20';
        }
    }

    showPage(page) {
        // Hide all pages
        document.querySelectorAll('.page').forEach(p => {
            p.classList.add('hidden');
            p.classList.remove('active');
        });

        // Show selected page
        const pageElement = document.getElementById(`${page}-page`);
        if (pageElement) {
            pageElement.classList.remove('hidden');
            pageElement.classList.add('active');
        }

        // Update navigation
        document.querySelectorAll('.nav-link').forEach(link => {
            const span = link.querySelector('span');
            if (link.getAttribute('data-page') === page) {
                span.className = 'text-purple-500 bg-purple-500/10 border-r-2 border-purple-500 block px-6 py-3 text-sm';
            } else {
                span.className = 'text-gray-400 hover:text-white hover:bg-gray-700 block px-6 py-3 text-sm';
            }
        });

        this.currentPage = page;
    }

    showProblemDetail(problemId) {
        this.currentProblem = this.problems.find(p => p.id === problemId);
        if (!this.currentProblem) return;

        const problemDescription = document.querySelector('.problem-description');
        problemDescription.innerHTML = `
            <div class="flex items-center justify-between mb-6">
                <h1 class="text-2xl font-bold text-white">${this.currentProblem.title}</h1>
                <div class="flex items-center space-x-4">
                    <span class="px-3 py-1 rounded-full text-sm font-medium ${this.getDifficultyColor(this.currentProblem.difficulty)}">
                        ${this.currentProblem.difficulty}
                    </span>
                    <span class="text-gray-400 text-sm">Acceptance: ${this.currentProblem.acceptance}</span>
                </div>
            </div>

            <div class="space-y-6">
                <div>
                    <h3 class="text-white font-semibold mb-3">Problem Description</h3>
                    <p class="text-gray-300">${this.currentProblem.description}</p>
                </div>

                <div>
                    <h3 class="text-white font-semibold mb-3">Input Format</h3>
                    <div class="bg-gray-900 rounded p-4">
                        <code class="text-gray-300">${this.currentProblem.inputFormat}</code>
                    </div>
                </div>

                <div>
                    <h3 class="text-white font-semibold mb-3">Output Format</h3>
                    <div class="bg-gray-900 rounded p-4">
                        <code class="text-gray-300">${this.currentProblem.outputFormat}</code>
                    </div>
                </div>

                <div>
                    <h3 class="text-white font-semibold mb-3">Sample Input</h3>
                    <div class="bg-gray-900 rounded p-4">
                        <code class="text-gray-300">${this.currentProblem.sampleInput}</code>
                    </div>
                </div>

                <div>
                    <h3 class="text-white font-semibold mb-3">Sample Output</h3>
                    <div class="bg-gray-900 rounded p-4">
                        <code class="text-gray-300">${this.currentProblem.sampleOutput}</code>
                    </div>
                </div>

                ${this.currentProblem.options ? `
                <div>
                    <h3 class="text-white font-semibold mb-3">Select the correct output for input: ${this.currentProblem.sampleInput}</h3>
                    <div class="space-y-2" id="options-container">
                        ${this.currentProblem.options.map((option, index) => `
                            <label class="option-item flex items-center p-3 rounded border border-gray-600 hover:border-purple-400 transition-all cursor-pointer">
                                <input type="radio" name="answer" value="${option}" class="hidden">
                                <div class="w-5 h-5 rounded-full border-2 border-gray-500 flex items-center justify-center mr-3">
                                    <div class="w-2 h-2 rounded-full bg-purple-500 hidden"></div>
                                </div>
                                <span class="text-white">${option}</span>
                            </label>
                        `).join('')}
                    </div>
                </div>
                ` : ''}
            </div>
        `;

        // Add event listeners to options
        const optionsContainer = document.getElementById('options-container');
        if (optionsContainer) {
            optionsContainer.addEventListener('click', (e) => {
                const label = e.target.closest('.option-item');
                if (label) {
                    // Remove selection from all options
                    document.querySelectorAll('.option-item').forEach(opt => {
                        opt.classList.remove('border-purple-500', 'bg-purple-500/10');
                        opt.querySelector('.bg-purple-500').classList.add('hidden');
                        opt.querySelector('.border-gray-500').classList.remove('border-purple-500');
                    });

                    // Add selection to clicked option
                    label.classList.add('border-purple-500', 'bg-purple-500/10');
                    label.querySelector('.bg-purple-500').classList.remove('hidden');
                    label.querySelector('.border-gray-500').classList.add('border-purple-500');
                }
            });
        }

        this.updateCodeTemplate();
        this.showPage('problem-detail');
    }

    updateCodeTemplate() {
        const language = document.getElementById('language-select').value;
        let template = '';

        switch (language) {
            case 'python':
                template = `def sum(a, b):\n    # Write your code here\n    return a + b`;
                break;
            case 'java':
                template = `public class Solution {\n    public static int sum(int a, int b) {\n        // Write your code here\n        return a + b;\n    }\n}`;
                break;
            case 'cpp':
                template = `#include <iostream>\nusing namespace std;\n\nint sum(int a, int b) {\n    // Write your code here\n    return a + b;\n}`;
                break;
            case 'c':
                template = `#include <stdio.h>\n\nint sum(int a, int b) {\n    // Write your code here\n    return a + b;\n}`;
                break;
            default: // javascript
                template = `function sum(a, b) {\n    // Write your code here\n    return a + b;\n}`;
        }

        document.getElementById('code-editor').value = template;
    }

    async runCode() {
        const code = document.getElementById('code-editor').value;
        const language = document.getElementById('language-select').value;
        const outputContainer = document.getElementById('output-container');

        outputContainer.textContent = 'Running code...';

        try {
            const response = await fetch('/api/submit', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    source_code: code,
                    language: language,
                    stdin: '5 3'
                })
            });

            const data = await response.json();

            if (data.success) {
                outputContainer.textContent = `Status: ${data.result.status}\n\nOutput:\n${data.result.output}\n\nTime: ${data.result.time || 'N/A'}s\nMemory: ${data.result.memory || 'N/A'}KB`;
                
                if (data.result.status === 'Accepted') {
                    outputContainer.classList.add('text-green-400');
                    outputContainer.classList.remove('text-red-400');
                } else {
                    outputContainer.classList.add('text-red-400');
                    outputContainer.classList.remove('text-green-400');
                }
            } else {
                outputContainer.textContent = `Error: ${data.error}`;
                outputContainer.classList.add('text-red-400');
                outputContainer.classList.remove('text-green-400');
            }
        } catch (error) {
            outputContainer.textContent = `Failed to run code: ${error.message}`;
            outputContainer.classList.add('text-red-400');
            outputContainer.classList.remove('text-green-400');
        }
    }
}

// Initialize the application when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new CodeArena();
});