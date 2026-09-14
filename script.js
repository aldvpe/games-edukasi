// URL Web App Google Apps Script Anda
const GOOGLE_SHEETS_URL = "URL_WEB_APP_GOOGLE_SHEETS_ANDA";

let questions = [];
let currentQuestion = null;
let score = 0;
let lives = 3;

// Canvas Setup
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
canvas.width = 800;
canvas.height = 500;

// Game State & Entities
const player = {
  x: 50,
  y: 380,
  width: 40,
  height: 40,
  color: "#38bdf8",
  speed: 5,
  dy: 0,
  isJumping: false
};

const chests = [
  { x: 250, y: 380, size: 40, active: true },
  { x: 500, y: 380, size: 40, active: true },
  { x: 700, y: 380, size: 40, active: true }
];

const gravity = 0.5;
const keys = {};

// Input Handlers
window.addEventListener("keydown", (e) => keys[e.code] = true);
window.addEventListener("keyup", (e) => keys[e.code] = false);

// Fetch Data Soal dari Google Sheets API
async function loadQuestions() {
  try {
    const res = await fetch(GOOGLE_SHEETS_URL);
    questions = await res.json();
    console.log("Soal berhasil dimuat dari Google Sheets:", questions);
  } catch (err) {
    console.warn("Gagal terhubung ke Google Sheets API. Menggunakan soal cadangan/fallback.", err);
    // Soal fallback jika API belum dikonfigurasi
    questions = [
      {
        Kategori: "Matematika",
        Tipe: "pilihan_ganda",
        Pertanyaan: "Berapakah hasil dari 15 + 27?",
        OpsiA: "40",
        OpsiB: "42",
        OpsiC: "44",
        OpsiD: "46",
        JawabanBenar: "B"
      },
      {
        Kategori: "Sains",
        Tipe: "pilihan_ganda",
        Pertanyaan: "Planet terdekat dari Matahari adalah?",
        OpsiA: "Venus",
        OpsiB: "Mars",
        OpsiC: "Merkurius",
        OpsiD: "Bumi",
        JawabanBenar: "C"
      },
      {
        Kategori: "Bahasa",
        Tipe: "pilihan_ganda",
        Pertanyaan: "Sinonim dari kata 'Pintar' adalah?",
        OpsiA: "Pandai",
        OpsiB: "Malas",
        OpsiC: "Lambat",
        OpsiD: "Gagal",
        JawabanBenar: "A"
      }
    ];
  }
}

// Game Logic Update
function update() {
  // Movement
  if (keys["ArrowRight"] || keys["KeyD"]) player.x += player.speed;
  if (keys["ArrowLeft"] || keys["KeyA"]) player.x -= player.speed;

  // Jump
  if ((keys["Space"] || keys["ArrowUp"]) && !player.isJumping) {
    player.dy = -10;
    player.isJumping = true;
  }

  // Gravity & Physics
  player.dy += gravity;
  player.y += player.dy;

  // Screen Bounds (Player)
  if (player.x < 0) player.x = 0;
  if (player.x + player.width > canvas.width) player.x = canvas.width - player.width;

  // Ground Collision
  if (player.y >= 380) {
    player.y = 380;
    player.dy = 0;
    player.isJumping = false;
  }

  // Collision Detection (Player vs Chests)
  chests.forEach((chest) => {
    if (
      chest.active &&
      Math.abs(player.x - chest.x) < 30 &&
      Math.abs(player.y - chest.y) < 30
    ) {
      chest.active = false;
      triggerQuiz();
    }
  });
}

// Render 2D Canvas
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw Ground
  ctx.fillStyle = "#334155";
  ctx.fillRect(0, 420, canvas.width, 80);

  // Draw Player
  ctx.fillStyle = player.color;
  ctx.fillRect(player.x, player.y, player.width, player.height);

  // Draw Interactive Chests
  chests.forEach((chest) => {
    if (chest.active) {
      ctx.fillStyle = "#f59e0b";
      ctx.fillRect(chest.x, chest.y, chest.size, chest.size);
    }
  });
}

// Game Main Loop
function gameLoop() {
  update();
  draw();
  requestAnimationFrame(gameLoop);
}

// Trigger Quiz Dialog
function triggerQuiz() {
  if (questions.length === 0) return;

  // Pilih soal secara acak dari array
  currentQuestion = questions[Math.floor(Math.random() * questions.length)];

  document.getElementById("quiz-category").innerText = currentQuestion.Kategori || "UMUM";
  document.getElementById("quiz-question").innerText = currentQuestion.Pertanyaan;

  const container = document.getElementById("options-container");
  container.innerHTML = "";

  const options = [
    { key: "A", text: currentQuestion.OpsiA },
    { key: "B", text: currentQuestion.OpsiB },
    { key: "C", text: currentQuestion.OpsiC },
    { key: "D", text: currentQuestion.OpsiD }
  ];

  options.forEach((opt) => {
    if (opt.text) {
      const btn = document.createElement("button");
      btn.className = "btn-option";
      btn.innerText = `${opt.key}. ${opt.text}`;
      btn.onclick = () => checkAnswer(opt.key);
      container.appendChild(btn);
    }
  });

  document.getElementById("quiz-modal").style.display = "flex";
}

// Check Answer Logic
function checkAnswer(selectedKey) {
  document.getElementById("quiz-modal").style.display = "none";

  if (selectedKey === currentQuestion.JawabanBenar) {
    score += 10;
    document.getElementById("score").innerText = score;
    alert("✨ BENAR! +10 Poin");
  } else {
    lives--;
    document.getElementById("lives").innerText = "❤️".repeat(Math.max(0, lives));
    alert(`❌ SALAH! Jawaban yang benar adalah (${currentQuestion.JawabanBenar})`);

    if (lives <= 0) {
      alert("Game Over! Skor akhir Anda: " + score);
      resetGame();
    }
  }
}

// Reset Game State
function resetGame() {
  score = 0;
  lives = 3;
  player.x = 50;
  player.y = 380;
  chests.forEach((chest) => (chest.active = true));
  document.getElementById("score").innerText = score;
  document.getElementById("lives").innerText = "❤️❤️❤️";
}

// Start Game
loadQuestions().then(() => {
  gameLoop();
});
