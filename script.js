// --- STATE UTAMA GAME ---
let currentMode = '2d'; // '2d' atau '3d'
let score = 0;
let playerName = "Pemain";
let isGameRunning = false;
let endpoint = "";

// Data Kuis Default
let questions = [
  { q: "Berapa hasil dari 15 + 27?", options: ["42", "32", "52", "45"], ans: 0 },
  { q: "Planet terdekat dari Matahari adalah?", options: ["Venus", "Mars", "Merkurius", "Bumi"], ans: 2 },
  { q: "Simbol kimia untuk Air adalah?", options: ["CO2", "H2O", "O2", "NaCl"], ans: 1 },
  { q: "Berapa hasil dari 9 x 8?", options: ["64", "72", "81", "56"], ans: 1 }
];
let currentQIndex = 0;

// --- SETUP & INTEGRASI GOOGLE SHEETS ---
window.onload = function() {
  const savedEndpoint = localStorage.getItem('edu_gs_endpoint');
  if (savedEndpoint) {
    document.getElementById('endpointUrl').value = savedEndpoint;
    endpoint = savedEndpoint;
    loadLeaderboard();
  }
  init2DGame();
  init3DGame();
};

function saveEndpoint() {
  endpoint = document.getElementById('endpointUrl').value.trim();
  localStorage.setItem('edu_gs_endpoint', endpoint);
  alert('Endpoint Google Sheets Terhubung!');
  loadLeaderboard();
}

async function sendScoreToGS(finalScore) {
  if (!endpoint) return;
  try {
    await fetch(endpoint, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'addScore',
        name: playerName,
        score: finalScore
      })
    });
    setTimeout(loadLeaderboard, 1500);
  } catch (err) {
    console.error("Gagal mengirim skor:", err);
  }
}

async function loadLeaderboard() {
  if (!endpoint) return;
  try {
    const res = await fetch(endpoint + "?action=getLeaderboard");
    const json = await res.json();
    if (json.status === 'success') {
      const tbody = document.getElementById('leaderboardBody');
      tbody.innerHTML = '';
      json.data.forEach((row, i) => {
        tbody.innerHTML += `
          <tr>
            <td>#${i+1}</td>
            <td>${row.name}</td>
            <td><strong>${row.score}</strong></td>
            <td>${row.date || '-'}</td>
          </tr>
        `;
      });
    }
  } catch (e) {
    console.log("Error loading leaderboard", e);
  }
}

// --- ALUR GAME ---
function startGame() {
  const input = document.getElementById('playerName').value.trim();
  if (input) playerName = input;
  document.getElementById('playerDisplay').innerText = playerName;
  document.getElementById('startOverlay').classList.add('hidden');
  score = 0;
  document.getElementById('scoreVal').innerText = score;
  isGameRunning = true;
}

function switchMode(mode) {
  currentMode = mode;
  document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
  
  if (mode === '2d') {
    event.target.classList.add('active');
    document.getElementById('canvas2D').classList.remove('hidden');
    document.getElementById('canvas3D').classList.add('hidden');
  } else {
    event.target.classList.add('active');
    document.getElementById('canvas2D').classList.add('hidden');
    document.getElementById('canvas3D').classList.remove('hidden');
  }
}

function triggerQuiz() {
  isGameRunning = false;
  const q = questions[currentQIndex];
  document.getElementById('questionText').innerText = q.q;
  
  const optsContainer = document.getElementById('optionsContainer');
  optsContainer.innerHTML = '';
  
  q.options.forEach((opt, idx) => {
    const btn = document.createElement('button');
    btn.className = 'option-btn';
    btn.innerText = opt;
    btn.onclick = () => answerQuiz(idx === q.ans);
    optsContainer.appendChild(btn);
  });

  document.getElementById('quizModal').classList.remove('hidden');
}

function answerQuiz(isCorrect) {
  document.getElementById('quizModal').classList.add('hidden');
  if (isCorrect) {
    score += 50;
    alert("Jawaban Benar! +50 Skor");
  } else {
    alert("Jawaban Salah! Tetap semangat.");
  }
  document.getElementById('scoreVal').innerText = score;
  
  currentQIndex = (currentQIndex + 1) % questions.length;
  sendScoreToGS(score);
  isGameRunning = true;
}

// --- LOGIKA GAME 2D (CANVAS RUNNER) ---
const canvas2D = document.getElementById('canvas2D');
const ctx2D = canvas2D.getContext('2d');
let player2D = { x: 50, y: 300, w: 30, h: 30, dy: 0, gravity: 0.6, jumping: false };
let target2D = { x: 600, y: 300, w: 25, h: 25 };

function init2DGame() {
  canvas2D.width = 800;
  canvas2D.height = 450;
  
  window.addEventListener('keydown', (e) => {
    if (e.code === 'Space' && !player2D.jumping && isGameRunning && currentMode === '2d') {
      player2D.dy = -12;
      player2D.jumping = true;
    }
  });

  requestAnimationFrame(loop2D);
}

function loop2D() {
  if (currentMode === '2d' && isGameRunning) {
    player2D.dy += player2D.gravity;
    player2D.y += player2D.dy;

    if (player2D.y >= 350) {
      player2D.y = 350;
      player2D.dy = 0;
      player2D.jumping = false;
    }

    target2D.x -= 3;
    if (target2D.x < -30) {
      target2D.x = 850;
    }

    if (Math.abs(player2D.x - target2D.x) < 30 && Math.abs(player2D.y - target2D.y) < 30) {
      target2D.x = 850;
      triggerQuiz();
    }

    ctx2D.clearRect(0, 0, canvas2D.width, canvas2D.height);
    
    // Ground
    ctx2D.fillStyle = '#222';
    ctx2D.fillRect(0, 380, 800, 70);
    ctx2D.fillStyle = '#d32f2f';
    ctx2D.fillRect(0, 380, 800, 4);

    // Player
    ctx2D.fillStyle = '#d32f2f';
    ctx2D.fillRect(player2D.x, player2D.y, player2D.w, player2D.h);

    // Target
    ctx2D.fillStyle = '#ffffff';
    ctx2D.beginPath();
    ctx2D.arc(target2D.x + 12, target2D.y + 12, 12, 0, Math.PI * 2);
    ctx2D.fill();
  }
  requestAnimationFrame(loop2D);
}

// --- LOGIKA GAME 3D (THREE.JS) ---
let scene, camera, renderer, cube3D;

function init3DGame() {
  const container = document.getElementById('canvas3D');
  
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x111111);

  camera = new THREE.PerspectiveCamera(75, 800 / 450, 0.1, 1000);
  camera.position.z = 5;

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(800, 450);
  container.appendChild(renderer.domElement);

  const geometry = new THREE.BoxGeometry(2, 2, 2);
  const materials = [
    new THREE.MeshBasicMaterial({ color: 0xd32f2f }),
    new THREE.MeshBasicMaterial({ color: 0xffffff }),
    new THREE.MeshBasicMaterial({ color: 0xd32f2f }),
    new THREE.MeshBasicMaterial({ color: 0xffffff }),
    new THREE.MeshBasicMaterial({ color: 0xd32f2f }),
    new THREE.MeshBasicMaterial({ color: 0xffffff })
  ];
  cube3D = new THREE.Mesh(geometry, materials);
  scene.add(cube3D);

  window.addEventListener('click', (e) => {
    if (currentMode === '3d' && isGameRunning) {
      triggerQuiz();
    }
  });

  animate3D();
}

function animate3D() {
  requestAnimationFrame(animate3D);
  if (currentMode === '3d' && cube3D) {
    cube3D.rotation.x += 0.01;
    cube3D.rotation.y += 0.01;
    renderer.render(scene, camera);
  }
}
