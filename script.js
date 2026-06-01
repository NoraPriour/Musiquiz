let questions = [];
let currentIndex = 0;
let score = 0;
let selectedAnswer = null;
let isAnswered = false;

function startQuiz() {
    document.getElementById("startBtn").style.display = "none";

    fetch("./quiz.json")
        .then(res => {
            if (!res.ok) {
                throw new Error("Impossible de charger les questions.");
            }

            return res.json();
        })
        .then(data => {
            questions = getRandomQuestions(data.quiz, 10);
            currentIndex = 0;
            score = 0;

            showQuestion();
        })
        .catch(error => {
            console.error("Erreur:", error);
            showLoadError();
        });
}

function showLoadError() {
    const quizContainer = document.getElementById("quiz-container");

    quizContainer.innerHTML = `
        <p role="alert">
            Impossible de charger le quiz. Vérifiez votre connexion et réessayez.
        </p>
        <button class="control-btn" onclick="startQuiz()">Réessayer</button>
    `;
}

function getRandomQuestions(quiz, count = 10) {
    const shuffled = [...quiz];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled.slice(0, count);
}

function showQuestion() {
    const quizContainer = document.getElementById('quiz-container');
    const q = questions[currentIndex];

    isAnswered = false;
    selectedAnswer = null;

    quizContainer.innerHTML = `
        <h2>${q.question}</h2>

        <p>Question ${currentIndex + 1} / ${questions.length}</p>

        <div id="options">
            ${q.options.map((choice, index) => `
                <button class="choice-btn" aria-pressed="false" onclick="selectAnswer(${index}, this)">
                    ${choice}
                </button>
            `).join("")}
        </div>

        <p id="result" aria-live="polite"></p>

        <button id="submitBtn" class="control-btn" onclick="submitAnswer()">Valider</button>
        <button id="nextBtn" class="control-btn" onclick="nextQuestion()" style="display:none;">
            Question suivante
        </button>

        <p>Score: ${score}</p>
    `;
}

function selectAnswer(index, button) {
    if (isAnswered) return;

    selectedAnswer = index;

    document.querySelectorAll('.choice-btn')
        .forEach(btn => {
            btn.classList.remove('selected');
            btn.ariaPressed = "false";
        });

    button.classList.add('selected');
    button.ariaPressed = "true";
}

function submitAnswer() {
    if (selectedAnswer === null) {
        alert("Choisis une réponse !");
        return;
    }

    const options = document.querySelectorAll('.choice-btn');
    options.forEach(btn => btn.disabled = true);

    const correctIndex = questions[currentIndex].answer;
    const result = document.getElementById("result");

    isAnswered = true;

    if (selectedAnswer === correctIndex) {
        result.textContent = "✅ Correct !";
        score++;
    } else {
        result.textContent =
            "❌ Faux ! Bonne réponse : " +
            questions[currentIndex].options[correctIndex];
        options[selectedAnswer].classList.add("wrong");
    }

    options[correctIndex].classList.add("correct");
    document.getElementById("submitBtn").style.display = "none";
    document.getElementById("nextBtn").style.display = "inline-block";
}

function endQuiz() {
    const quizContainer = document.getElementById('quiz-container');

    quizContainer.innerHTML = `
        <h2>Quiz terminé 🎉</h2>
        <p>Score: ${score} / ${questions.length}</p>
        <button class="control-btn" onclick="startQuiz()">Rejouer</button>
    `;
}

function nextQuestion() {
    if (!isAnswered) return;

    if (currentIndex < questions.length - 1) {
        currentIndex++;
        showQuestion();
    } else {
        endQuiz();
    }
}
