// ==========================================
// EDUQUEST - GAME EDUKASI
// ==========================================

// Data soal
const questions = [
    {
        question: "Berapakah hasil dari 12 × 8?",
        answers: ["86", "96", "108", "88"],
        correct: 1
    },

    {
        question: "Planet yang dikenal sebagai Planet Merah adalah...",
        answers: [
            "Venus",
            "Mars",
            "Jupiter",
            "Saturnus"
        ],
        correct: 1
    },

    {
        question: "Hewan yang mengalami metamorfosis sempurna adalah...",
        answers: [
            "Kucing",
            "Ayam",
            "Kupu-kupu",
            "Ikan"
        ],
        correct: 2
    },

    {
        question: "Ibukota Indonesia adalah...",
        answers: [
            "Bandung",
            "Surabaya",
            "Jakarta",
            "Yogyakarta"
        ],
        correct: 2
    },

    {
        question: "Hasil dari 144 ÷ 12 adalah...",
        answers: [
            "10",
            "11",
            "12",
            "14"
        ],
        correct: 2
    },

    {
        question: "Organ tubuh manusia yang berfungsi memompa darah adalah...",
        answers: [
            "Paru-paru",
            "Jantung",
            "Lambung",
            "Ginjal"
        ],
        correct: 1
    },

    {
        question: "Sumber energi utama bagi bumi adalah...",
        answers: [
            "Bulan",
            "Angin",
            "Matahari",
            "Air"
        ],
        correct: 2
    },

    {
        question: "Bahasa resmi negara Indonesia adalah...",
        answers: [
            "Bahasa Jawa",
            "Bahasa Melayu",
            "Bahasa Indonesia",
            "Bahasa Sunda"
        ],
        correct: 2
    },

    {
        question: "Berapakah 25% dari 200?",
        answers: [
            "25",
            "40",
            "50",
            "75"
        ],
        correct: 2
    },

    {
        question: "Proses tumbuhan membuat makanan sendiri disebut...",
        answers: [
            "Respirasi",
            "Fotosintesis",
            "Evaporasi",
            "Transpirasi"
        ],
        correct: 1
    }
];


// ==========================================
// GAME VARIABLES
// ==========================================

let currentQuestion = 0;
let score = 0;
let lives = 3;
let correctAnswers = 0;
let wrongAnswers = 0;

let playerName = "";

let timer;
let timeLeft = 15;


// ==========================================
// HTML ELEMENTS
// ==========================================

const startScreen = document.getElementById("startScreen");
const gameScreen = document.getElementById("gameScreen");
const resultScreen = document.getElementById("resultScreen");

const playerNameInput = document.getElementById("playerName");

const startBtn = document.getElementById("startBtn");
const nextBtn = document.getElementById("nextBtn");
const restartBtn = document.getElementById("restartBtn");

const questionElement = document.getElementById("question");
const answersElement = document.getElementById("answers");

const questionNumber = document.getElementById("questionNumber");

const scoreElement = document.getElementById("score");
const livesElement = document.getElementById("lives");
const levelElement = document.getElementById("level");
const timerElement = document.getElementById("timer");

const progressBar = document.getElementById("progressBar");

const feedback = document.getElementById("feedback");


// ==========================================
// START GAME
// ==========================================

startBtn.addEventListener("click", startGame);

function startGame() {

    playerName = playerNameInput.value.trim();

    if (playerName === "") {
        alert("Silakan masukkan nama terlebih dahulu!");
        return;
    }

    currentQuestion = 0;
    score = 0;
    lives = 3;
    correctAnswers = 0;
    wrongAnswers = 0;

    updateStats();

    startScreen.classList.remove("active");
    gameScreen.classList.add("active");

    loadQuestion();
}


// ==========================================
// LOAD QUESTION
// ==========================================

function loadQuestion() {

    clearInterval(timer);

    if (currentQuestion >= questions.length || lives <= 0) {
        endGame();
        return;
    }

    const data = questions[currentQuestion];

    questionElement.textContent = data.question;

    questionNumber.textContent = currentQuestion + 1;

    answersElement.innerHTML = "";

    feedback.textContent = "";
    feedback.className = "feedback";

    nextBtn.classList.add("hidden");

    // Progress
    const progress =
        (currentQuestion / questions.length) * 100;

    progressBar.style.width = progress + "%";


    // Buat tombol jawaban
    data.answers.forEach((answer, index) => {

        const button = document.createElement("button");

        button.className = "answer-btn";

        button.textContent =
            `${String.fromCharCode(65 + index)}. ${answer}`;

        button.addEventListener(
            "click",
            () => checkAnswer(index, button)
        );

        answersElement.appendChild(button);
    });

    startTimer();
}


// ==========================================
// TIMER
// ==========================================

function startTimer() {

    timeLeft = 15;

    timerElement.textContent = timeLeft;

    timer = setInterval(() => {

        timeLeft--;

        timerElement.textContent = timeLeft;

        if (timeLeft <= 0) {

            clearInterval(timer);

            wrongAnswers++;
            lives--;

            feedback.textContent =
                "⏰ Waktu habis!";

            feedback.classList.add("wrong-text");

            disableAnswers();

            showCorrectAnswer();

            updateStats();

            nextBtn.classList.remove("hidden");
        }

    }, 1000);
}


// ==========================================
// CHECK ANSWER
// ==========================================

function checkAnswer(selectedIndex, selectedButton) {

    clearInterval(timer);

    const data = questions[currentQuestion];

    disableAnswers();

    if (selectedIndex === data.correct) {

        selectedButton.classList.add("correct");

        correctAnswers++;

        // Bonus berdasarkan waktu
        const bonus = timeLeft * 2;

        score += 100 + bonus;

        feedback.textContent =
            `🎉 Benar! +${100 + bonus} poin`;

        feedback.classList.add("correct-text");

    } else {

        selectedButton.classList.add("wrong");

        wrongAnswers++;

        lives--;

        feedback.textContent =
            "❌ Jawaban kurang tepat!";

        feedback.classList.add("wrong-text");

        showCorrectAnswer();
    }

    updateStats();

    nextBtn.classList.remove("hidden");
}


// ==========================================
// SHOW CORRECT ANSWER
// ==========================================

function showCorrectAnswer() {

    const correctIndex =
        questions[currentQuestion].correct;

    const buttons =
        answersElement.querySelectorAll(".answer-btn");

    if (buttons[correctIndex]) {
        buttons[correctIndex].classList.add("correct");
    }
}


// ==========================================
// DISABLE ANSWERS
// ==========================================

function disableAnswers() {

    const buttons =
        answersElement.querySelectorAll(".answer-btn");

    buttons.forEach(button => {
        button.disabled = true;
    });
}


// ==========================================
// NEXT QUESTION
// ==========================================

nextBtn.addEventListener("click", () => {

    currentQuestion++;

    loadQuestion();
});


// ==========================================
// UPDATE STATS
// ==========================================

function updateStats() {

    scoreElement.textContent = score;

    livesElement.textContent = lives;

    // Level setiap 3 soal
    const level =
        Math.floor(currentQuestion / 3) + 1;

    levelElement.textContent = level;
}


// ==========================================
// END GAME
// ==========================================

function endGame() {

    clearInterval(timer);

    gameScreen.classList.remove("active");

    resultScreen.classList.add("active");

    document.getElementById("resultName")
        .textContent = playerName;

    document.getElementById("resultScore")
        .textContent = score;

    document.getElementById("resultCorrect")
        .textContent = correctAnswers;

    document.getElementById("resultWrong")
        .textContent = wrongAnswers;


    let message = "";

    const percentage =
        (correctAnswers / questions.length) * 100;

    if (percentage >= 80) {

        message =
            "🌟 Luar biasa! Kamu sangat hebat!";

    } else if (percentage >= 60) {

        message =
            "👏 Bagus! Terus tingkatkan kemampuanmu!";

    } else {

        message =
            "💪 Jangan menyerah! Coba belajar dan main lagi!";
    }

    document.getElementById("resultMessage")
        .textContent = message;


    // Simpan ke LocalStorage
    saveResult();
}


// ==========================================
// SAVE RESULT
// ==========================================

function saveResult() {

    const result = {

        nama: playerName,

        skor: score,

        benar: correctAnswers,

        salah: wrongAnswers,

        tanggal:
            new Date().toLocaleString("id-ID")
    };


    let leaderboard =
        JSON.parse(
            localStorage.getItem("eduquestLeaderboard")
        ) || [];


    leaderboard.push(result);


    leaderboard.sort(
        (a, b) => b.skor - a.skor
    );


    leaderboard =
        leaderboard.slice(0, 10);


    localStorage.setItem(
        "eduquestLeaderboard",
        JSON.stringify(leaderboard)
    );
}


// ==========================================
// RESTART
// ==========================================

restartBtn.addEventListener("click", () => {

    resultScreen.classList.remove("active");

    startScreen.classList.add("active");

    playerNameInput.value = "";
});
