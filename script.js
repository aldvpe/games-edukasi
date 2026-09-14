// GANTI DENGAN URL GOOGLE APPS SCRIPT ANDA
const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbx.../exec";

// Status Game
let playerName = "";
let score = 0;
let currentQuestionIndex = 0;
let questions = [];

// Canvas 2D Setup
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Objek Karakter 2D Sederhana
const player2D = {
  x: 50,
  y: 130,
  width: 30,
  height: 40,
  color: "#e94560",
  speed: 2
};

// Data Cadangan (Fallback) jika URL Google Sheet belum terpasang
const fallbackQuestions = [
  {
    pertanyaan: "Berapakah hasil dari 12 x 5?",
    pilihan: ["50", "60", "70", "55"],
    jawabanBenar: "60"
  },
  {
    pertanyaan: "Planet manakah yang paling dekat dengan Matahari?",
    pilihan: ["Venus", "Bumi", "Merkurius", "Mars"],
    jawabanBenar: "Merkurius"
  }
];

// 1. Memulai Permainan
async function startGame() {
  const inputName = document.getElementById("player-name").value.trim();
  if (!inputName) {
    alert("Silakan masukkan nama terlebih dahulu!");
    return;
  }
  
  playerName = inputName;
  document.getElementById("display-name").innerText = playerName;
  
  switchScreen("start-screen", "game-screen");
  drawPlayer();
  
  // Mengambil Data Soal dari Google Sheets
  await loadQuestionsFromSheet();
  displayQuestion();
}

// 2. Fetch Data Soal dari Google Sheets API
async function loadQuestionsFromSheet() {
  try {
    const response = await fetch(GOOGLE_SCRIPT_URL);
    if (!response.ok) throw new Error("Gagal terhubung ke Apps Script");
    const data = await response.json();
    if (data && data.length > 0) {
      questions = data;
    } else {
      questions = fallbackQuestions;
    }
  } catch (error) {
    console.warn("Menggunakan data soal lokal (Google Sheet tidak terjangkau):", error);
    questions = fallbackQuestions;
  }
}

// 3. Menampilkan Soal Ke Layar
function displayQuestion() {
  if (currentQuestionIndex >= questions.length) {
    endGame();
    return;
  }

  const q = questions[currentQuestionIndex];
  document.getElementById("question-text").innerText = q.pertanyaan;

  const optionsContainer = document.getElementById("options-container");
  optionsContainer.innerHTML = "";

  q.pilihan.forEach(option => {
    const btn = document.createElement("button");
    btn.className = "option-btn";
    btn.innerText = option;
    btn.onclick = () => checkAnswer(option, q.jawabanBenar);
    optionsContainer.appendChild(btn);
  });
}

// 4. Mengecek Jawaban Pemain & Gerakan Karakter 2D
function checkAnswer(selectedOption, correctAnswer) {
  if (selectedOption === correctAnswer) {
    score += 10;
    document.getElementById("score").innerText = score;
    // Animasikan Karakter Maju ke Kanan
    movePlayer(player2D.x + 50);
  } else {
    alert("Jawaban Kurang Tepat!");
  }

  currentQuestionIndex++;
  displayQuestion();
}

// 5. Animasi Gerak Karakter 2D Sederhana pada Canvas
function movePlayer(targetX) {
  const animate = setInterval(() => {
    if (player2D.x < targetX && player2D.x < canvas.width - player2D.width) {
      player2D.x += player2D.speed;
      drawPlayer();
    } else {
      clearInterval(animate);
    }
  }, 10);
}

function drawPlayer() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  // Gambar Garis Tanah
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 170, canvas.width, 4);

  // Gambar Karakter
  ctx.fillStyle = player2D.color;
  ctx.fillRect(player2D.x, player2D.y, player2D.width, player2D.height);
}

// 6. Akhir Game & Kirim Skor ke Google Sheets
async function endGame() {
  switchScreen("game-screen", "end-screen");
  document.getElementById("final-score").innerText = score;

  // Kirim data skor via POST ke Google Sheets
  try {
    await fetch(GOOGLE_SCRIPT_URL, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nama: playerName, skor: score })
    });
    document.getElementById("status-message").innerText = "Skor berhasil disimpan di Google Sheets!";
  } catch (error) {
    document.getElementById("status-message").innerText = "Gagal mengirim skor ke Google Sheets.";
  }
}

// Helper: Pindah Tampilan Layar
function switchScreen(fromId, toId) {
  document.getElementById(fromId).classList.remove("active");
  document.getElementById(toId).classList.add("active");
}

// Restart Permainan
function restartGame() {
  score = 0;
  currentQuestionIndex = 0;
  player2D.x = 50;
  document.getElementById("score").innerText = score;
  switchScreen("end-screen", "start-screen");
}
