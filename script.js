// ==========================================
// CONFIG & GOOGLE SHEETS API INTEGRATION
// ==========================================
// Ganti URL ini dengan Web App URL Google Apps Script Anda
const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbx.../exec";

// Fallback Data jika API Google Sheets belum dipasang
const mockQuestions = [
    { soal: "Berapakah hasil dari 15 x 4?", opsiA: "50", opsiB: "60", opsiC: "70", opsiD: "80", jawaban: "B" },
    { soal: "Planet manakah yang terdekat dari Matahari?", opsiA: "Venus", opsiB: "Bumi", opsiC: "Merkurius", opsiD: "Mars", jawaban: "C" },
    { soal: "Apa lambang kimia untuk air?", opsiA: "CO2", opsiB: "H2O", opsiC: "O2", opsiD: "NaCl", jawaban: "B" },
    { soal: "Ibu kota negara Indonesia adalah...", opsiA: "Bandung", opsiB: "Surabaya", opsiC: "IKN / Nusantara", opsiD: "Medan", jawaban: "C" },
    { soal: "Siapakah penemu arus listrik bolak-balik (AC)?", opsiA: "Nikola Tesla", opsiB: "Thomas Edison", opsiC: "Albert Einstein", opsiD: "Isaac Newton", jawaban: "A" }
];

let questions = [...mockQuestions];
let currentMode = '2D';
let playerName = "";
let score = 0;
let currentQuestionIndex = 0;
let isQuizActive = false;

// Perbaikan Bug: Prevent Space key scroll saat game dimainkan
window.addEventListener('keydown', function(e) {
    if ((e.code === 'Space' || e.key === ' ') && e.target.tagName !== 'INPUT') {
        e.preventDefault();
    }
});

// Fetch Questions dari Google Sheets API
async function fetchQuestionsFromSheets() {
    try {
        const res = await fetch(GOOGLE_SCRIPT_URL);
        if(res.ok) {
            const data = await res.json();
            if(data && data.length > 0) questions = data;
        }
    } catch (e) {
        console.log("Menggunakan data soal lokal/fallback.");
    }
}

// Kirim Skor Akhir ke Google Sheets
async function sendScoreToSheets(name, finalScore) {
    try {
        await fetch(GOOGLE_SCRIPT_URL, {
            method: 'POST',
            mode: 'no-cors',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nama: name, skor: finalScore })
        });
        document.getElementById('sync-status').innerText = "Skor berhasil tersimpan di Google Sheets!";
    } catch (e) {
        document.getElementById('sync-status').innerText = "Mode offline: Skor tidak tersimpan ke cloud.";
    }
}

// ==========================================
// GAME CORE & KONTROL
// ==========================================
const keys = {};
window.addEventListener('keydown', e => keys[e.key] = true);
window.addEventListener('keyup', e => keys[e.key] = false);

function switchMode(mode) {
    if (isQuizActive) return;
    currentMode = mode;
    document.getElementById('btn-2d').classList.toggle('active', mode === '2D');
    document.getElementById('btn-3d').classList.toggle('active', mode === '3D');

    const canvas2d = document.getElementById('canvas2d');
    if (mode === '2D') {
        canvas2d.style.display = 'block';
        if (renderer3D) renderer3D.domElement.style.display = 'none';
    } else {
        canvas2d.style.display = 'none';
        if (!renderer3D) init3D();
        renderer3D.domElement.style.display = 'block';
    }
}

function startGame() {
    const input = document.getElementById('player-name').value;
    if(!input.trim()) {
        alert("Silakan masukkan nama Anda!");
        return;
    }
    playerName = input;
    document.getElementById('start-screen').classList.add('hidden');
    
    fetchQuestionsFromSheets();
    if (currentMode === '2D') init2D();
    else init3D();
    
    gameLoop();
}

function triggerQuiz() {
    isQuizActive = true;
    document.getElementById('quiz-card').classList.remove('hidden');
    showQuestion();
}

function showQuestion() {
    if (currentQuestionIndex >= questions.length) {
        endGame();
        return;
    }
    const q = questions[currentQuestionIndex];
    document.getElementById('q-num').innerText = currentQuestionIndex + 1;
    document.getElementById('q-text').innerText = q.soal;
    document.getElementById('opt-A').innerText = "A. " + q.opsiA;
    document.getElementById('opt-B').innerText = "B. " + q.opsiB;
    document.getElementById('opt-C').innerText = "C. " + q.opsiC;
    document.getElementById('opt-D').innerText = "D. " + q.opsiD;
}

function submitAnswer(ans) {
    if (ans === questions[currentQuestionIndex].jawaban.toUpperCase()) {
        score += 20;
        document.getElementById('score-val').innerText = score;
    }
    currentQuestionIndex++;
    document.getElementById('quiz-card').classList.add('hidden');
    isQuizActive = false;

    if (currentMode === '2D') reset2DTarget();
    else reset3DTarget();
}

function endGame() {
    document.getElementById('quiz-card').classList.add('hidden');
    document.getElementById('end-screen').classList.remove('hidden');
    document.getElementById('final-score').innerText = score;
    sendScoreToSheets(playerName, score);
}

// ==========================================
// GAME ENGINE 2D (HTML5 Canvas)
// ==========================================
let ctx2d;
let player2D = { x: 100, y: 400, width: 30, height: 30 };
let target2D = { x: 600, y: 400, size: 25 };

function init2D() {
    const canvas = document.getElementById('canvas2d');
    ctx2d = canvas.getContext('2d');
    reset2DTarget();
}

function reset2DTarget() {
    target2D.x = 150 + Math.random() * 500;
}

function update2D() {
    if (isQuizActive) return;

    if (keys['ArrowRight'] || keys['d'] || keys['D']) player2D.x += 4;
    if (keys['ArrowLeft'] || keys['a'] || keys['A']) player2D.x -= 4;

    if (player2D.x < 0) player2D.x = 0;
    if (player2D.x > 770) player2D.x = 770;

    const dist = Math.abs(player2D.x - target2D.x);
    if (dist < 30) {
        triggerQuiz();
    }
}

function render2D() {
    ctx2d.clearRect(0, 0, 800, 540);

    // Landasan/Lantai 2D
    ctx2d.fillStyle = "#34495E";
    ctx2d.fillRect(0, 430, 800, 110);

    // Karakter 2D
    ctx2d.fillStyle = "#4A90E2";
    ctx2d.fillRect(player2D.x, player2D.y, player2D.width, player2D.height);

    // Koin Soal 2D
    ctx2d.fillStyle = "#F1C40F";
    ctx2d.beginPath();
    ctx2d.arc(target2D.x, target2D.y + 15, target2D.size / 2, 0, Math.PI * 2);
    ctx2d.fill();

    ctx2d.fillStyle = "#FFF";
    ctx2d.font = "14px Segoe UI";
    ctx2d.fillText("Koin Soal", target2D.x - 28, target2D.y - 5);
}

// ==========================================
// GAME ENGINE 3D (Three.js)
// ==========================================
let scene3D, camera3D, renderer3D, player3D, target3D;

function init3D() {
    const viewport = document.getElementById('viewport');
    scene3D = new THREE.Scene();
    scene3D.background = new THREE.Color(0x1a252f);

    camera3D = new THREE.PerspectiveCamera(60, 800 / 540, 0.1, 1000);
    camera3D.position.set(0, 5, 10);
    camera3D.lookAt(0, 0, 0);

    renderer3D = new THREE.WebGLRenderer({ antialias: true });
    renderer3D.setSize(800, 540);
    viewport.appendChild(renderer3D.domElement);

    const ambient = new THREE.AmbientLight(0xffffff, 0.7);
    scene3D.add(ambient);

    const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight.position.set(5, 10, 7);
    scene3D.add(dirLight);

    // Lantai 3D
    const floorGeo = new THREE.PlaneGeometry(20, 20);
    const floorMat = new THREE.MeshStandardMaterial({ color: 0x2c3e50 });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    scene3D.add(floor);

    // Karakter 3D (Kubus)
    const playerGeo = new THREE.BoxGeometry(1, 1, 1);
    const playerMat = new THREE.MeshStandardMaterial({ color: 0x4A90E2 });
    player3D = new THREE.Mesh(playerGeo, playerMat);
    player3D.position.set(0, 0.5, 3);
    scene3D.add(player3D);

    // Koin/Kristal 3D (Octahedron)
    const targetGeo = new THREE.OctahedronGeometry(0.7);
    const targetMat = new THREE.MeshStandardMaterial({ color: 0xF1C40F, metalness: 0.5, roughness: 0.2 });
    target3D = new THREE.Mesh(targetGeo, targetMat);
    target3D.position.set(0, 0.7, -3);
    scene3D.add(target3D);
}

function reset3DTarget() {
    if (target3D) {
        target3D.position.x = (Math.random() - 0.5) * 8;
    }
}

function update3D() {
    if (isQuizActive || !player3D) return;

    if (keys['ArrowRight'] || keys['d'] || keys['D']) player3D.position.x += 0.08;
    if (keys['ArrowLeft'] || keys['a'] || keys['A']) player3D.position.x -= 0.08;
    if (keys['ArrowUp'] || keys['w'] || keys['W']) player3D.position.z -= 0.08;
    if (keys['ArrowDown'] || keys['s'] || keys['S']) player3D.position.z += 0.08;

    target3D.rotation.y += 0.03;
    camera3D.position.x = player3D.position.x;

    const dist = player3D.position.distanceTo(target3D.position);
    if (dist < 1.2) {
        triggerQuiz();
    }
}

function render3D() {
    if (renderer3D) renderer3D.render(scene3D, camera3D);
}

// Main Loop Game
function gameLoop() {
    if (currentMode === '2D') {
        update2D();
        render2D();
    } else {
        update3D();
        render3D();
    }
    requestAnimationFrame(gameLoop);
}
