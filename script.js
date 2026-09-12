// GANTI URL DI BAWAH INI DENGAN URL WEB APP GOOGLE APPS SCRIPT ANDA
const API_URL = "https://script.google.com/macros/s/AKfycbx.../exec";

let questions = [];
let currentQuestionIndex = 0;
let score = 0;
let playerName = "";

// Ambil data soal dari Google Sheets saat halaman di-load
async function fetchQuestions() {
  try {
    const response = await fetch(API_URL);
    questions = await response.json();
    
    document.getElementById('loading-screen').classList.add('hidden');
    document.getElementById('start-screen').classList.remove('hidden');
  } catch (error) {
    console.error("Gagal mengambil soal:", error);
    document.getElementById('loading-screen').innerText = "Gagal memuat soal. Periksa URL API Google Sheets Anda.";
  }
}

function startGame() {
  const nameInput = document.getElementById('player-name').value;
  if (!nameInput.trim()) {
    alert("Silakan masukkan nama Anda terlebih dahulu!");
    return;
  }
  playerName = nameInput;
  
  document.getElementById('start-screen').classList.add('hidden');
  document.getElementById('game-screen').classList.remove('hidden');
  document.getElementById('total-questions').innerText = questions.length;
  
  showQuestion();
}

function showQuestion() {
  const q = questions[currentQuestionIndex];
  document.getElementById('current-question-num').innerText = currentQuestionIndex + 1;
  document.getElementById('question').innerText = q.soal;
  
  document.getElementById('opt-A').innerText = "A. " + q.opsiA;
  document.getElementById('opt-B').innerText = "B. " + q.opsiB;
  document.getElementById('opt-C').innerText = "C. " + q.opsiC;
  document.getElementById('opt-D').innerText = "D. " + q.opsiD;
}

function checkAnswer(selectedOption) {
  const correctAnswer = questions[currentQuestionIndex].jawaban.toUpperCase();
  
  if (selectedOption === correctAnswer) {
    score += 10;
    document.getElementById('score').innerText = score;
  }

  currentQuestionIndex++;

  if (currentQuestionIndex < questions.length) {
    showQuestion();
  } else {
    endGame();
  }
}

async function endGame() {
  document.getElementById('game-screen').classList.add('hidden');
  document.getElementById('end-screen').classList.remove('hidden');
  document.getElementById('final-score').innerText = score;

  // Kirim skor ke Google Sheets
  try {
    await fetch(API_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nama: playerName, skor: score })
    });
    document.getElementById('save-status').innerText = "Skor berhasil disimpan di Google Sheets!";
  } catch (error) {
    console.error("Gagal menyimpan skor:", error);
    document.getElementById('save-status').innerText = "Gagal menyimpan skor ke Google Sheets.";
  }
}

// Jalankan fungsi pengambil soal saat aplikasi pertama kali dibuka
fetchQuestions();
