// ==========================================
// GAME STATE & GLOBAL VARIABLES
// ==========================================
let currentMode = '2d'; 
let score = 0;
let streak = 0;
let playerName = "Pemain";
let isGameRunning = false;
let endpoint = "";

// Data Soal Kuis
const questions = [
  { q: "Berapakah hasil dari 15 + 27?", options: ["42", "32", "52", "45"], ans: 0 },
  { q: "Planet manakah yang paling dekat dengan Matahari?", options: ["Venus", "Mars", "Merkurius", "Bumi"], ans: 2 },
  { q: "Simbol molekul kimia untuk Air adalah?", options: ["CO2", "H2O", "O2", "NaCl"], ans: 1 },
  { q: "Berapakah hasil perkalian dari 9 x 8?", options: ["64", "72", "81", "56"], ans: 1 },
  { q: "Organ tubuh manusia yang memompa darah adalah?", options: ["Paru-paru", "Hati", "Jantung", "Ginjal"], ans: 2 },
  { q: "Benua terbesar di dunia berdasarkan luas wilayah adalah?", options: ["Afrika", "Amerika", "Eropa", "Asia"], ans: 3 }
];
let currentQIndex = 0;

// ==========================================
// AUDIO SYNTHESIZER (WEB AUDIO API - NO EXTERNAL FILES NEEDED)
// ==========================================
const AudioCtx = window.AudioContext || window.webkitAudioContext;
let audioCtx = null;

function initAudio() {
  if (!audioCtx) audioCtx = new AudioCtx();
}

function playSound(type) {
  if (!audioCtx) return;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.connect(gain);
  gain.connect(audioCtx.destination);

  const now = audioCtx.currentTime;

  if (type === 'jump') {
    osc.type = 'sine';
    osc.frequency.setValueAtTime(150, now);
    osc.frequency.exponentialRampToValueAtTime(600, now + 0.15);
    gain.gain.setValueAtTime(0.3, now);
    gain.gain.linearRampToValueAtTime(0, now + 0.15);
    osc.start(now);
    osc.stop(now + 0.15);
  } else if (type === 'coin') {
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(987.77, now); // B5
    osc.frequency.setValueAtTime(1318.51, now + 0.08); // E6
    gain.gain.setValueAtTime(0.2, now);
    gain.gain.linearRampToValueAtTime(0, now + 0.25);
    osc.start(now);
    osc.stop(now + 0.25);
  } else if (type === 'correct') {
    osc.type = 'sine';
    osc.frequency.setValueAtTime(523.25, now); // C5
    osc.frequency.setValueAtTime(659.25, now + 0.1); // E5
    osc.frequency.setValueAtTime(783.99, now + 0.2); // G5
    gain.gain.setValueAtTime(0.3, now);
    gain.gain.linearRampToValueAtTime(0, now + 0.4);
    osc.start(now);
    osc.stop(now + 0.4);
  } else if (type === 'gameover') {
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(300, now);
    osc.frequency.linearRampToValueAtTime(80, now + 0.5);
    gain.gain.setValueAtTime(0.4, now);
    gain.gain.linearRampToValueAtTime(0, now + 0.5);
    osc.start(now);
    osc.stop(now + 0.5);
  }
}

// ==========================================
// INIT & GOOGLE SHEETS INTEGRATION
// ==========================================
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
  const statusEl = document.getElementById('gsStatusText');
  if (statusEl) statusEl.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Menyimpan ke Cloud Sheets...`;

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
    if (statusEl) statusEl.innerHTML = `<i class="fa-solid fa-circle-check" style="color:var(--neon-green)"></i> Terhubung & Tersimpan!`;
    setTimeout(loadLeaderboard, 1500);
  } catch (err) {
    if (statusEl) statusEl.innerHTML = `<i class="fa-solid fa-circle-xmark" style="color:var(--primary-red)"></i> Gagal terhubung ke Cloud.`;
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
            <td><strong>#${i+1}</strong></td>
            <td>${row.name}</td>
            <td><strong style="color:var(--neon-gold)">${row.score}</strong></td>
            <td>${row.date || '-'}</td>
          </tr>
        `;
      });
    }
  } catch (e) {
    console.log("Error sync leaderboard", e);
  }
}

// ==========================================
// FLOW GAME & CONTROL
// ==========================================
function startGame() {
  initAudio();
  const input = document.getElementById('playerName').value.trim();
  if (input) playerName = input;
  document.getElementById('playerDisplay').innerText = playerName;
  document.getElementById('startOverlay').classList.add('hidden');
  document.getElementById('gameOverModal').classList.add('hidden');
  
  score = 0;
  streak = 0;
  updateHUD();
  isGameRunning = true;
}

function restartGame() {
  document.getElementById('gameOverModal').classList.add('hidden');
  resetPositions();
  score = 0;
  streak = 0;
  updateHUD();
  isGameRunning = true;
}

function updateHUD() {
  document.getElementById('scoreVal').innerText = score;
  document.getElementById('streakVal').innerText = 'x' + streak;
}

function resetPositions() {
  player2D.y = 320;
  player2D.dy = 0;
  orb2D.x = 900;
  coin2D.x = 600;
  obstacle2D.x = 1200;
}

function switchMode(mode) {
  currentMode = mode;
  document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
  
  const hint = document.getElementById('hintText');
  if (mode === '2d') {
    event.target.classList.add('active');
    document.getElementById('canvas2D').classList.remove('hidden');
    document.getElementById('canvas3D').classList.add('hidden');
    hint.innerHTML = 'Tekan <strong>[ SPASI ]</strong> untuk Melompat & Ambil Orb Kuis!';
  } else {
    event.target.classList.add('active');
    document.getElementById('canvas2D').classList.add('hidden');
    document.getElementById('canvas3D').classList.remove('hidden');
    hint.innerHTML = 'Klik pada <strong>Kristal Edukasi 3D</strong> untuk menjawab tantangan!';
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
    streak++;
    const addedScore = 50 + (streak * 10);
    score += addedScore;
    updateHUD();
    
    playSound('correct');

    if (typeof confetti === 'function') {
      confetti({ particleCount: 100, spread: 80, origin: { y: 0.6 } });
    }

    showFloatingText(`+${addedScore} PTS!`);

    currentQIndex = (currentQIndex + 1) % questions.length;
    isGameRunning = true;

  } else {
    playSound('gameover');
    showGameOver();
  }
}

function showFloatingText(text) {
  const container = document.getElementById('floatingTextContainer');
  const el = document.createElement('div');
  el.className = 'floating-text';
  el.innerText = text;
  el.style.left = '50%';
  el.style.top = '45%';
  container.appendChild(el);
  setTimeout(() => el.remove(), 1200);
}

function showGameOver() {
  isGameRunning = false;
  document.getElementById('finalScoreVal').innerText = score;
  document.getElementById('gameOverModal').classList.remove('hidden');
  sendScoreToGS(score);
}

// ==========================================
// 1. GAME 2D (NEO CYBER-RUNNER ENGINE)
// ==========================================
const canvas2D = document.getElementById('canvas2D');
const ctx2D = canvas2D.getContext('2d');

let player2D = { x: 80, y: 320, w: 32, h: 32, dy: 0, gravity: 0.65, jumping: false, trail: [] };
let orb2D = { x: 900, y: 260, r: 16, pulse: 0 };
let coin2D = { x: 500, y: 280, r: 12, rot: 0 };
let obstacle2D = { x: 1300, y: 340, w: 25, h: 35 };

let bgStars = Array.from({ length: 40 }, () => ({
  x: Math.random() * 800,
  y: Math.random() * 300,
  size: Math.random() * 2 + 1,
  speed: Math.random() * 0.8 + 0.2
}));

function init2DGame() {
  canvas2D.width = 800;
  canvas2D.height = 500;
  
  window.addEventListener('keydown', (e) => {
    if ((e.code === 'Space' || e.code === 'ArrowUp') && !player2D.jumping && isGameRunning && currentMode === '2d') {
      player2D.dy = -13.5;
      player2D.jumping = true;
      playSound('jump');
    }
  });

  requestAnimationFrame(loop2D);
}

function loop2D() {
  if (currentMode === '2d' && isGameRunning) {
    // Player Physics
    player2D.dy += player2D.gravity;
    player2D.y += player2D.dy;

    if (player2D.y >= 343) {
      player2D.y = 343;
      player2D.dy = 0;
      player2D.jumping = false;
    }

    // Player Trail Effect
    player2D.trail.push({ x: player2D.x, y: player2D.y });
    if (player2D.trail.length > 8) player2D.trail.shift();

    // Movement of Objects
    orb2D.x -= 4;
    if (orb2D.x < -50) orb2D.x = 900 + Math.random() * 300;

    coin2D.x -= 4;
    if (coin2D.x < -50) {
      coin2D.x = 800 + Math.random() * 400;
      coin2D.y = 220 + Math.random() * 100;
    }

    obstacle2D.x -= 4;
    if (obstacle2D.x < -50) obstacle2D.x = 1000 + Math.random() * 400;

    // Collision Detection: Coin
    if (Math.hypot(player2D.x - coin2D.x, player2D.y - coin2D.y) < player2D.w + coin2D.r) {
      coin2D.x = 900 + Math.random() * 300;
      score += 10;
      updateHUD();
      playSound('coin');
      showFloatingText("+10 COIN!");
    }

    // Collision Detection: Orb (Quiz Trigger)
    if (Math.hypot(player2D.x - orb2D.x, player2D.y - orb2D.y) < player2D.w + orb2D.r) {
      orb2D.x = 1000;
      triggerQuiz();
    }

    // Collision Detection: Obstacle
    if (player2D.x < obstacle2D.x + obstacle2D.w &&
        player2D.x + player2D.w > obstacle2D.x &&
        player2D.y < obstacle2D.y + obstacle2D.h &&
        player2D.y + player2D.h > obstacle2D.y) {
      playSound('gameover');
      showGameOver();
    }

    // ================= RENDER CANVAS 2D =================
    ctx2D.clearRect(0, 0, canvas2D.width, canvas2D.height);

    // Background Gradient
    let bgGrad = ctx2D.createLinearGradient(0, 0, 0, 500);
    bgGrad.addColorStop(0, '#0a0a16');
    bgGrad.addColorStop(1, '#1a0022');
    ctx2D.fillStyle = bgGrad;
    ctx2D.fillRect(0, 0, 800, 500);

    // Stars Parallax
    ctx2D.fillStyle = '#ffffff';
    bgStars.forEach(star => {
      star.x -= star.speed;
      if (star.x < 0) star.x = 800;
      ctx2D.fillRect(star.x, star.y, star.size, star.size);
    });

    // Cyber Ground Grid
    ctx2D.fillStyle = '#111';
    ctx2D.fillRect(0, 375, 800, 125);
    ctx2D.strokeStyle = '#ff2a5f';
    ctx2D.lineWidth = 3;
    ctx2D.beginPath();
    ctx2D.moveTo(0, 375); ctx2D.lineTo(800, 375);
    ctx2D.stroke();

    // Grid Floor Perspective Lines
    ctx2D.strokeStyle = 'rgba(255, 42, 95, 0.2)';
    ctx2D.lineWidth = 1;
    for (let x = 0; x < 800; x += 40) {
      ctx2D.beginPath();
      ctx2D.moveTo(x, 375); ctx2D.lineTo(x, 500);
      ctx2D.stroke();
    }

    // Player Trail
    player2D.trail.forEach((t, i) => {
      ctx2D.fillStyle = `rgba(0, 243, 255, ${i * 0.08})`;
      ctx2D.fillRect(t.x, t.y, player2D.w, player2D.h);
    });

    // Player Character (Cyber Cube)
    ctx2D.fillStyle = '#00f3ff';
    ctx2D.shadowColor = '#00f3ff';
    ctx2D.shadowBlur = 15;
    ctx2D.fillRect(player2D.x, player2D.y, player2D.w, player2D.h);
    ctx2D.shadowBlur = 0; // reset shadow

    // Orb Kuis (Pulsating Orb)
    orb2D.pulse += 0.08;
    let rPulse = orb2D.r + Math.sin(orb2D.pulse) * 4;
    ctx2D.fillStyle = '#ff2a5f';
    ctx2D.shadowColor = '#ff2a5f';
    ctx2D.shadowBlur = 20;
    ctx2D.beginPath();
    ctx2D.arc(orb2D.x, orb2D.y, rPulse, 0, Math.PI * 2);
    ctx2D.fill();
    ctx2D.shadowBlur = 0;

    // Coin
    coin2D.rot += 0.1;
    ctx2D.fillStyle = '#ffb700';
    ctx2D.shadowColor = '#ffb700';
    ctx2D.shadowBlur = 10;
    ctx2D.beginPath();
    ctx2D.ellipse(coin2D.x, coin2D.y, Math.abs(Math.sin(coin2D.rot)) * coin2D.r + 2, coin2D.r, 0, 0, Math.PI * 2);
    ctx2D.fill();
    ctx2D.shadowBlur = 0;

    // Obstacle (Spike Triangle)
    ctx2D.fillStyle = '#ff0033';
    ctx2D.beginPath();
    ctx2D.moveTo(obstacle2D.x, obstacle2D.y + obstacle2D.h);
    ctx2D.lineTo(obstacle2D.x + obstacle2D.w / 2, obstacle2D.y);
    ctx2D.lineTo(obstacle2D.x + obstacle2D.w, obstacle2D.y + obstacle2D.h);
    ctx2D.closePath();
    ctx2D.fill();
  }

  requestAnimationFrame(loop2D);
}

// ==========================================
// 2. GAME 3D (3D PLANET EXPLORER ENGINE)
// ==========================================
let scene3D, camera3D, renderer3D;
let planet3D, ring3D, crystal3D, satOrbit;
let raycaster = new THREE.Raycaster();
let mouse = new THREE.Vector2();

function init3DGame() {
  const container = document.getElementById('canvas3D');

  scene3D = new THREE.Scene();

  camera3D = new THREE.PerspectiveCamera(60, 800 / 500, 0.1, 1000);
  camera3D.position.set(0, 2, 7);

  renderer3D = new THREE.WebGLRenderer({ antialias: true });
  renderer3D.setSize(800, 500);
  renderer3D.setPixelRatio(window.devicePixelRatio);
  container.appendChild(renderer3D.domElement);

  // Lights
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
  scene3D.add(ambientLight);

  const dirLight = new THREE.DirectionalLight(0x00f3ff, 1.2);
  dirLight.position.set(5, 10, 7);
  scene3D.add(dirLight);

  const pointLight = new THREE.PointLight(0xff2a5f, 1.5, 20);
  pointLight.position.set(-3, 0, 3);
  scene3D.add(pointLight);

  // Central Planet 3D
  const planetGeo = new THREE.IcosahedronGeometry(1.8, 4);
  const planetMat = new THREE.MeshStandardMaterial({
    color: 0x1a0033,
    roughness: 0.3,
    metalness: 0.8,
    wireframe: true
  });
  planet3D = new THREE.Mesh(planetGeo, planetMat);
  scene3D.add(planet3D);

  // Planet Ring
  const ringGeo = new THREE.RingGeometry(2.3, 3.2, 32);
  const ringMat = new THREE.MeshBasicMaterial({
    color: 0x00f3ff,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.4
  });
  ring3D = new THREE.Mesh(ringGeo, ringMat);
  ring3D.rotation.x = Math.PI / 2;
  scene3D.add(ring3D);

  // Quiz Interactive Crystal
  const crystalGeo = new THREE.OctahedronGeometry(0.5, 0);
  const crystalMat = new THREE.MeshStandardMaterial({
    color: 0xff2a5f,
    emissive: 0xff2a5f,
    emissiveIntensity: 0.6,
    roughness: 0.1
  });
  crystal3D = new THREE.Mesh(crystalGeo, crystalMat);
  
  satOrbit = new THREE.Group();
  satOrbit.add(crystal3D);
  crystal3D.position.set(3.5, 0, 0);
  scene3D.add(satOrbit);

  // Starfield Background
  const starsGeo = new THREE.BufferGeometry();
  const count = 500;
  const positions = new Float32Array(count * 3);
  for (let i = 0; i < count * 3; i++) {
    positions[i] = (Math.random() - 0.5) * 40;
  }
  starsGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const starsMat = new THREE.PointsMaterial({ color: 0xffffff, size: 0.08 });
  const starField = new THREE.Points(starsGeo, starsMat);
  scene3D.add(starField);

  // Raycaster Click Event for 3D Quiz
  renderer3D.domElement.addEventListener('click', on3DClick);

  animate3D();
}

function on3DClick(e) {
  if (currentMode !== '3d' || !isGameRunning) return;

  const rect = renderer3D.domElement.getBoundingClientRect();
  mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
  mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

  raycaster.setFromCamera(mouse, camera3D);
  const intersects = raycaster.intersectObject(crystal3D);

  if (intersects.length > 0) {
    triggerQuiz();
  }
}

function animate3D() {
  requestAnimationFrame(animate3D);

  if (currentMode === '3d') {
    planet3D.rotation.y += 0.005;
    ring3D.rotation.z += 0.002;
    
    satOrbit.rotation.y += 0.02;
    crystal3D.rotation.x += 0.03;
    crystal3D.rotation.y += 0.03;

    renderer3D.render(scene3D, camera3D);
  }
}
