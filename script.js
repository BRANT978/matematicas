// Clase para manejar el juego de matemáticas
class MathGame {
    constructor() {
        this.score = 0;
        this.level = 1;
        this.correctAnswers = 0;
        this.currentQuestion = null;
        this.correctAnswer = null;
        this.questionsAnswered = 0;
        this.history = [];
        
        this.initializeElements();
        this.bindEvents();
        this.generateQuestion();
        this.loadHistory();
    }
    
    initializeElements() {
        this.scoreElement = document.getElementById('score');
        this.levelElement = document.getElementById('level');
        this.correctElement = document.getElementById('correct');
        this.questionElement = document.getElementById('question-text');
        this.operationElement = document.getElementById('operation');
        this.feedbackElement = document.getElementById('feedback');
        this.nextBtn = document.getElementById('next-btn');
        this.restartBtn = document.getElementById('restart-btn');
        this.clearHistoryBtn = document.getElementById('clear-history');
        this.exportHistoryBtn = document.getElementById('export-history');
        this.historyList = document.getElementById('history-list');
        
        this.optionButtons = [
            document.getElementById('option1'),
            document.getElementById('option2'),
            document.getElementById('option3'),
            document.getElementById('option4')
        ];
    }
    
    bindEvents() {
        this.optionButtons.forEach((btn, index) => {
            btn.addEventListener('click', () => this.selectAnswer(index));
        });
        
        this.nextBtn.addEventListener('click', () => this.nextQuestion());
        this.restartBtn.addEventListener('click', () => this.restartGame());
        this.clearHistoryBtn.addEventListener('click', () => this.clearHistory());
        this.exportHistoryBtn.addEventListener('click', () => this.exportHistory());
    }
    
    generateQuestion() {
        const operations = ['+', '-'];
        const operation = operations[Math.floor(Math.random() * operations.length)];
        
        let num1, num2, correctResult;
        
        // Generar números basados en el nivel
        const maxNumber = 10 + (this.level - 1) * 5;
        
        if (operation === '+') {
            // Generar suma con números positivos y negativos
            num1 = this.getRandomNumber(-maxNumber, maxNumber);
            num2 = this.getRandomNumber(-maxNumber, maxNumber);
            correctResult = num1 + num2;
        } else {
            // Generar resta
            num1 = this.getRandomNumber(-maxNumber, maxNumber);
            num2 = this.getRandomNumber(-maxNumber, maxNumber);
            correctResult = num1 - num2;
        }
        
        this.currentQuestion = { num1, num2, operation, correctResult };
        this.correctAnswer = correctResult;
        
        // Mostrar la pregunta
        this.displayQuestion();
        this.generateOptions();
        this.resetButtons();
    }
    
    getRandomNumber(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
    
    displayQuestion() {
        const { num1, num2, operation } = this.currentQuestion;
        this.operationElement.textContent = `${num1} ${operation} ${num2} = ?`;
    }
    
    generateOptions() {
        const correctAnswer = this.correctAnswer;
        const options = [correctAnswer];
        
        // Generar opciones incorrectas comunes
        const wrongAnswers = this.generateWrongAnswers(correctAnswer);
        options.push(...wrongAnswers);
        
        // Mezclar las opciones
        this.shuffleArray(options);
        
        // Asignar las opciones a los botones
        this.optionButtons.forEach((btn, index) => {
            btn.textContent = options[index];
            btn.dataset.value = options[index];
            btn.classList.remove('correct', 'incorrect');
        });
    }
    
    generateWrongAnswers(correctAnswer) {
        const wrongAnswers = [];
        
        // Error común 1: Sumar en lugar de restar o viceversa
        const { num1, num2, operation } = this.currentQuestion;
        if (operation === '+') {
            wrongAnswers.push(num1 - num2); // Error: restar en lugar de sumar
        } else {
            wrongAnswers.push(num1 + num2); // Error: sumar en lugar de restar
        }
        
        // Error común 2: Ignorar los signos negativos
        if (num1 < 0 || num2 < 0) {
            const absNum1 = Math.abs(num1);
            const absNum2 = Math.abs(num2);
            if (operation === '+') {
                wrongAnswers.push(-(absNum1 + absNum2)); // Siempre negativo
            } else {
                wrongAnswers.push(absNum1 + absNum2); // Siempre positivo
            }
        }
        
        // Error común 3: Cambiar el signo del resultado
        wrongAnswers.push(-correctAnswer);
        
        // Eliminar duplicados y la respuesta correcta
        const uniqueWrongAnswers = [...new Set(wrongAnswers)].filter(answer => answer !== correctAnswer);
        
        // Tomar solo 3 respuestas incorrectas
        return uniqueWrongAnswers.slice(0, 3);
    }
    
    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }
    
    selectAnswer(selectedIndex) {
        const selectedButton = this.optionButtons[selectedIndex];
        const selectedValue = parseInt(selectedButton.dataset.value);
        
        // Deshabilitar todos los botones
        this.optionButtons.forEach(btn => {
            btn.disabled = true;
        });
        
        // Marcar la respuesta correcta e incorrecta
        this.optionButtons.forEach(btn => {
            const value = parseInt(btn.dataset.value);
            if (value === this.correctAnswer) {
                btn.classList.add('correct');
            } else if (btn === selectedButton && value !== this.correctAnswer) {
                btn.classList.add('incorrect');
            }
        });
        
        // Registrar en el historial
        this.recordAnswer(selectedValue);
        
        // Mostrar feedback
        if (selectedValue === this.correctAnswer) {
            this.showCorrectFeedback();
            this.correctAnswers++;
            this.score += 10 * this.level;
        } else {
            this.showIncorrectFeedback();
        }
        
        this.questionsAnswered++;
        this.updateStats();
        this.nextBtn.disabled = false;
        
        // Verificar si subir de nivel
        if (this.questionsAnswered % 5 === 0) {
            this.level++;
        }
    }
    
    showCorrectFeedback() {
        const feedbacks = [
            "¡Excelente! 🎉",
            "¡Correcto! 👍",
            "¡Muy bien! 🌟",
            "¡Perfecto! ⭐",
            "¡Genial! 🚀"
        ];
        const randomFeedback = feedbacks[Math.floor(Math.random() * feedbacks.length)];
        this.feedbackElement.textContent = randomFeedback;
        this.feedbackElement.style.color = '#2ecc71';
    }
    
    showIncorrectFeedback() {
        const { num1, num2, operation } = this.currentQuestion;
        let explanation = "";
        
        if (operation === '+') {
            if (num1 < 0 && num2 < 0) {
                explanation = "Recuerda: números negativos se suman y el resultado es negativo.";
            } else if (num1 < 0 || num2 < 0) {
                explanation = "Con signos diferentes, resta los valores absolutos y usa el signo del mayor.";
            }
        } else {
            explanation = "En la resta, cambia el signo del segundo número y aplica la regla de suma.";
        }
        
        this.feedbackElement.innerHTML = `❌ Incorrecto. La respuesta correcta es ${this.correctAnswer}.<br><small>${explanation}</small>`;
        this.feedbackElement.style.color = '#e74c3c';
    }
    
    nextQuestion() {
        this.generateQuestion();
        this.nextBtn.disabled = true;
        this.feedbackElement.textContent = '';
    }
    
    resetButtons() {
        this.optionButtons.forEach(btn => {
            btn.disabled = false;
            btn.classList.remove('correct', 'incorrect');
        });
    }
    
    updateStats() {
        this.scoreElement.textContent = this.score;
        this.levelElement.textContent = this.level;
        this.correctElement.textContent = this.correctAnswers;
    }
    
    restartGame() {
        this.score = 0;
        this.level = 1;
        this.correctAnswers = 0;
        this.questionsAnswered = 0;
        this.updateStats();
        this.generateQuestion();
        this.feedbackElement.textContent = '';
        this.nextBtn.disabled = true;
    }
    
    recordAnswer(selectedAnswer) {
        const now = new Date();
        const dateTime = now.toLocaleString('es-ES', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
        
        const historyEntry = {
            id: Date.now(),
            dateTime: dateTime,
            question: `${this.currentQuestion.num1} ${this.currentQuestion.operation} ${this.currentQuestion.num2}`,
            userAnswer: selectedAnswer,
            correctAnswer: this.correctAnswer,
            isCorrect: selectedAnswer === this.correctAnswer,
            level: this.level
        };
        
        this.history.unshift(historyEntry); // Agregar al inicio
        this.saveHistory();
        this.updateHistoryDisplay();
    }
    
    updateHistoryDisplay() {
        if (this.history.length === 0) {
            this.historyList.innerHTML = '<p class="no-history">Aún no hay respuestas registradas</p>';
            return;
        }
        
        this.historyList.innerHTML = '';
        
        this.history.forEach(entry => {
            const historyItem = document.createElement('div');
            historyItem.className = `history-item ${entry.isCorrect ? 'correct' : 'incorrect'}`;
            
            historyItem.innerHTML = `
                <span class="history-date">${entry.dateTime}</span>
                <span class="history-question">${entry.question}</span>
                <span class="history-answer">${entry.userAnswer}</span>
                <span class="history-correct">${entry.correctAnswer}</span>
                <span class="history-result ${entry.isCorrect ? 'correct' : 'incorrect'}">
                    ${entry.isCorrect ? '✅' : '❌'}
                </span>
            `;
            
            this.historyList.appendChild(historyItem);
        });
    }
    
    saveHistory() {
        localStorage.setItem('mathGameHistory', JSON.stringify(this.history));
    }
    
    loadHistory() {
        const savedHistory = localStorage.getItem('mathGameHistory');
        if (savedHistory) {
            this.history = JSON.parse(savedHistory);
            this.updateHistoryDisplay();
        }
    }
    
    clearHistory() {
        if (confirm('¿Estás seguro de que quieres limpiar todo el historial?')) {
            this.history = [];
            this.saveHistory();
            this.updateHistoryDisplay();
        }
    }
    
    exportHistory() {
        if (this.history.length === 0) {
            alert('No hay datos para exportar');
            return;
        }
        
        let csvContent = 'Fecha y Hora,Pregunta,Tu Respuesta,Respuesta Correcta,Resultado,Nivel\n';
        
        this.history.forEach(entry => {
            const result = entry.isCorrect ? 'Correcto' : 'Incorrecto';
            csvContent += `"${entry.dateTime}","${entry.question}","${entry.userAnswer}","${entry.correctAnswer}","${result}","${entry.level}"\n`;
        });
        
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `historial_matematicas_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
}

// Navegación suave
document.addEventListener('DOMContentLoaded', function() {
    // Inicializar el juego
    const game = new MathGame();
    
    // Navegación suave
    const navLinks = document.querySelectorAll('.navbar a[href^="#"]');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            
            if (targetSection) {
                targetSection.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
    
    // Efecto de scroll en la navegación
    window.addEventListener('scroll', function() {
        const navbar = document.querySelector('.navbar');
        if (window.scrollY > 100) {
            navbar.style.backgroundColor = 'rgba(44, 62, 80, 0.95)';
        } else {
            navbar.style.backgroundColor = '#2c3e50';
        }
    });
    
    // Animaciones al hacer scroll
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);
    
    // Observar elementos para animaciones
    const animatedElements = document.querySelectorAll('.reason-card, .example-card, .step');
    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
});

// Función para mostrar información adicional sobre errores comunes
function showErrorDetails(errorType) {
    const details = {
        'suma-signos-diferentes': 'Cuando sumas números con signos diferentes, debes restar el menor del mayor y usar el signo del número con mayor valor absoluto.',
        'resta-negativa': 'En la resta, recuerda cambiar el signo del sustraendo y luego aplicar las reglas de suma.',
        'multiplicacion-signos': 'En multiplicación: mismo signo = positivo, diferente signo = negativo.',
        'division-signos': 'En división se aplican las mismas reglas que en multiplicación.'
    };
    
    return details[errorType] || 'Error común en operaciones con números negativos.';
}
