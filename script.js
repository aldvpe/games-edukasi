/* =====================================================
   GOOGLE APPS SCRIPT URL
===================================================== */

const API_URL =
    "https://script.google.com/macros/s/AKfycbxljyucQfaIt7kO0i9ghQThIs4DP522Wy2yngVhvDzwqO5IwFKX3CIIr3ARRfj-0Krh/exec";


/* =====================================================
   SOAL
===================================================== */

const questions = [

    {
        question:
            "Planet manakah yang dikenal sebagai Planet Merah?",

        answers: [
            "Venus",
            "Mars",
            "Jupiter",
            "Saturnus"
        ],

        correct: 1
    },

    {
        question:
            "Berapa hasil dari 12 × 5?",

        answers: [
            "50",
            "55",
            "60",
            "65"
        ],

        correct: 2
    },

    {
        question:
            "Bahasa yang digunakan untuk mengatur tampilan website adalah?",

        answers: [
            "HTML",
            "CSS",
            "Python",
            "SQL"
        ],

        correct: 1
    },

    {
        question:
            "Ibukota Indonesia adalah?",

        answers: [
            "Bandung",
            "Surabaya",
            "Jakarta",
            "Semarang"
        ],

        correct: 2
    },

    {
        question:
            "Organ tubuh yang berfungsi memompa darah adalah?",

        answers: [
            "Paru-paru",
            "Jantung",
            "Ginjal",
            "Hati"
        ],

        correct: 1
    },

    {
        question:
            "Satuan SI untuk panjang adalah?",

        answers: [
            "Kilogram",
            "Liter",
            "Meter",
            "Detik"
        ],

        correct: 2
    },

    {
        question:
            "Hasil dari 100 ÷ 4 adalah?",

        answers: [
            "20",
            "25",
            "30",
            "40"
        ],

        correct: 1
    },

    {
        question:
            "Hewan yang mengalami metamorfosis sempurna adalah?",

        answers: [
            "Kupu-kupu",
            "Kucing",
            "Ayam",
            "Sapi"
        ],

        correct: 0
    },

    {
        question:
            "HTML merupakan singkatan dari?",

        answers: [
            "Hyper Text Markup Language",
            "High Text Machine Language",
            "Hyper Tool Multi Language",
            "Home Text Markup Language"
        ],

        correct: 0
    },

    {
        question:
            "Alat untuk mengukur suhu disebut?",

        answers: [
            "Barometer",
            "Termometer",
            "Speedometer",
            "Higrometer"
        ],

        correct: 1
    }

];


/* =====================================================
   ELEMENT
===================================================== */

const menu =
    document.getElementById("menu");

const game =
    document.getElementById("game");

const result =
    document.getElementById("result");

const leaderboard =
    document.getElementById("leaderboard");

const username =
    document.getElementById("username");

const startBtn =
    document.getElementById("startBtn");

const leaderboardBtn =
    document.getElementById("leaderboardBtn");

const resultLeaderboardBtn =
    document.getElementById(
        "resultLeaderboardBtn"
    );

const backBtn =
    document.getElementById("backBtn");

const restartBtn =
    document.getElementById("restartBtn");

const saveBtn =
    document.getElementById("saveBtn");

const question =
    document.getElementById("question");

const questionNumber =
    document.getElementById(
        "questionNumber"
    );

const answers =
    document.getElementById("answers");

const scoreElement =
    document.getElementById("score");

const livesElement =
    document.getElementById("lives");

const timerElement =
    document.getElementById("timer");

const progressBar =
    document.getElementById(
        "progressBar"
    );

const resultName =
    document.getElementById("resultName");

const finalScore =
    document.getElementById("finalScore");

const resultMessage =
    document.getElementById(
        "resultMessage"
    );

const leaderboardList =
    document.getElementById(
        "leaderboardList"
    );


/* =====================================================
   GAME VARIABLE
===================================================== */

let currentQuestion = 0;

let score = 0;

let lives = 3;

let timer = 15;

let timerInterval;

let playerName = "";


/* =====================================================
   SCREEN
===================================================== */

function showScreen(screen) {

    document
        .querySelectorAll(".screen")
        .forEach(item => {

            item.classList.remove("active");

        });

    screen.classList.add("active");
}


/* =====================================================
   START GAME
===================================================== */

startBtn.addEventListener(
    "click",
    startGame
);


function startGame() {

    playerName =
        username.value.trim();

    if (!playerName) {

        alert(
            "Masukkan username terlebih dahulu!"
        );

        return;
    }

    currentQuestion = 0;

    score = 0;

    lives = 3;

    scoreElement.textContent = score;

    livesElement.textContent = lives;

    showScreen(game);

    loadQuestion();
}


/* =====================================================
   LOAD QUESTION
===================================================== */

function loadQuestion() {

    clearInterval(timerInterval);

    if (
        currentQuestion >=
        questions.length
    ) {

        finishGame();

        return;
    }


    const q =
        questions[currentQuestion];


    questionNumber.textContent =
        `Soal ${currentQuestion + 1} / ${questions.length}`;


    question.textContent =
        q.question;


    answers.innerHTML = "";


    q.answers.forEach(
        (answer, index) => {

            const button =
                document.createElement(
                    "button"
                );

            button.className =
                "answer";

            button.textContent =
                answer;

            button.addEventListener(
                "click",
                () => checkAnswer(
                    index,
                    button
                )
            );

            answers.appendChild(
                button
            );
        }
    );


    const progress =
        (
            currentQuestion /
            questions.length
        ) * 100;

    progressBar.style.width =
        progress + "%";


    startTimer();
}


/* =====================================================
   TIMER
===================================================== */

function startTimer() {

    timer = 15;

    timerElement.textContent =
        timer;


    timerInterval =
        setInterval(() => {

            timer--;

            timerElement.textContent =
                timer;


            if (timer <= 0) {

                clearInterval(
                    timerInterval
                );

                lives--;

                livesElement.textContent =
                    lives;

                nextQuestion();
            }

        }, 1000);
}


/* =====================================================
   ANSWER
===================================================== */

function checkAnswer(
    selected,
    button
) {

    clearInterval(
        timerInterval
    );


    const q =
        questions[currentQuestion];


    const allButtons =
        document.querySelectorAll(
            ".answer"
        );


    allButtons.forEach(btn => {

        btn.classList.add(
            "disabled"
        );

    });


    if (
        selected ===
        q.correct
    ) {

        button.classList.add(
            "correct"
        );

        score += 100;

        scoreElement.textContent =
            score;

    } else {

        button.classList.add(
            "wrong"
        );

        allButtons[
            q.correct
        ].classList.add(
            "correct"
        );

        lives--;

        livesElement.textContent =
            lives;
    }


    setTimeout(
        nextQuestion,
        700
    );
}


/* =====================================================
   NEXT QUESTION
===================================================== */

function nextQuestion() {

    if (lives <= 0) {

        finishGame();

        return;
    }

    currentQuestion++;

    loadQuestion();
}


/* =====================================================
   FINISH
===================================================== */

function finishGame() {

    clearInterval(
        timerInterval
    );

    showScreen(result);

    resultName.textContent =
        playerName;

    finalScore.textContent =
        score;


    if (score >= 800) {

        resultMessage.textContent =
            "🔥 Luar biasa! Pengetahuanmu hebat!";

    } else if (score >= 500) {

        resultMessage.textContent =
            "👏 Bagus! Terus tingkatkan!";

    } else {

        resultMessage.textContent =
            "💪 Jangan menyerah, coba lagi!";

    }

    saveBtn.disabled = false;

    saveBtn.textContent =
        "☁️ SIMPAN SKOR";
}


/* =====================================================
   SAVE TO GOOGLE SHEETS
===================================================== */

saveBtn.addEventListener(
    "click",
    saveScore
);


async function saveScore() {

    if (
        !API_URL ||
        API_URL.includes(
            "MASUKKAN_URL"
        )
    ) {

        alert(
            "URL Google Apps Script belum dipasang!"
        );

        return;
    }


    saveBtn.disabled = true;

    saveBtn.textContent =
        "⏳ MENYIMPAN...";


    try {

        const response =
            await fetch(API_URL, {

                method: "POST",

                body: JSON.stringify({

                    username:
                        playerName,

                    score:
                        score

                })

            });


        const data =
            await response.json();


        if (data.success) {

            saveBtn.textContent =
                "✅ SKOR TERSIMPAN";

        } else {

            throw new Error(
                "Gagal menyimpan"
            );
        }


    } catch (error) {

        console.error(error);

        alert(
            "Gagal menyimpan skor. Coba lagi."
        );

        saveBtn.disabled = false;

        saveBtn.textContent =
            "☁️ SIMPAN SKOR";
    }
}


/* =====================================================
   LEADERBOARD
===================================================== */

leaderboardBtn.addEventListener(
    "click",
    showLeaderboard
);


resultLeaderboardBtn.addEventListener(
    "click",
    showLeaderboard
);


async function showLeaderboard() {

    showScreen(leaderboard);

    leaderboardList.innerHTML =
        "⏳ Memuat leaderboard...";


    try {

        const response =
            await fetch(API_URL);


        const data =
            await response.json();


        if (!data.success) {

            throw new Error(
                "Leaderboard gagal"
            );
        }


        leaderboardList.innerHTML =
            "";


        if (
            data.players.length === 0
        ) {

            leaderboardList.innerHTML =
                "Belum ada pemain.";

            return;
        }


        data.players.forEach(
            (player, index) => {

                const div =
                    document.createElement(
                        "div"
                    );

                div.className =
                    "player";


                let medal = "";

                if (index === 0)
                    medal = "🥇";

                else if (index === 1)
                    medal = "🥈";

                else if (index === 2)
                    medal = "🥉";

                else
                    medal =
                        `${index + 1}`;


                div.innerHTML = `

                    <div class="rank">
                        ${medal}
                    </div>

                    <div class="player-name">
                        ${escapeHTML(
                            player.username
                        )}
                    </div>

                    <div class="player-score">
                        ${player.score}
                    </div>

                `;


                leaderboardList.appendChild(
                    div
                );
            }
        );


    } catch (error) {

        console.error(error);

        leaderboardList.innerHTML =
            "❌ Gagal mengambil data leaderboard.";
    }
}


/* =====================================================
   BACK
===================================================== */

backBtn.addEventListener(
    "click",
    () => showScreen(menu)
);


restartBtn.addEventListener(
    "click",
    startGame
);


/* =====================================================
   SECURITY
===================================================== */

function escapeHTML(text) {

    const div =
        document.createElement(
            "div"
        );

    div.textContent =
        text;

    return div.innerHTML;
}
