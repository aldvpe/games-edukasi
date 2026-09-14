// GANTI DENGAN URL WEB APP GOOGLE APPS SCRIPT ANDA
const WEB_APP_URL = "MASUKKAN_URL_WEB_APP_ANDA_DISINI";

let questions = [];
let currentQuestionIndex = 0;
let score = 0;
let playerName = "";

async function mulaiGame() {
    playerName = document.getElementById("player-name").value.trim();
    if (!playerName) {
        alert("Harap masukkan nama terlebih dahulu!");
        return;
    }

    // Pindah layar ke loading
    document.getElementById("screen-login").classList.add("hidden");
    document.getElementById("screen-loading").classList.remove("hidden");

    try {
        // Ambil soal dari Google Sheets via Apps Script (GET)
        let response = await fetch(`${WEB_APP_URL}?sheet=Soal`);
        questions = await response.json();

        if (questions.length === 0) {
            alert("Belum ada soal di Google Sheets!");
            location.reload();
            return;
        }

        // Pindah ke layar kuis
        document.getElementById("screen-loading").classList.add("hidden");
        document.getElementById("screen-quiz").classList.remove("hidden");
        tampilkanSoal();

    } catch (error) {
        console.error("Gagal mengambil soal:", error);
        alert("Terjadi kesalahan saat menghubungkan ke database Google Sheets.");
        location.reload();
    }
}

function tampilkanSoal() {
    if (currentQuestionIndex >= questions.length) {
        selesaiGame();
        return;
    }

    let q = questions[currentQuestionIndex];
    document.getElementById("question-counter").innerText = `Soal ${currentQuestionIndex + 1} dari ${questions.length}`;
    document.getElementById("question-text").innerText = q.Pertanyaan;

    let optionsContainer = document.getElementById("options-container");
    optionsContainer.innerHTML = "";

    // Ambil opsi jawaban (OpsiA, OpsiB, OpsiC, OpsiD)
    let options = [q.OpsiA, q.OpsiB, q.OpsiC, q.OpsiD];

    options.forEach(option => {
        if (option) { // Pastikan opsi tidak kosong
            let btn = document.createElement("button");
            btn.classList.add("btn-option");
            btn.innerText = option;
            btn.onclick = () => cekJawaban(option, q.JawabanBenar);
            optionsContainer.appendChild(btn);
        }
    });
}

function cekJawaban(pilihan, jawabanBenar) {
    // Trim untuk menghindari masalah spasi berlebih
    if (pilihan.toString().trim().toLowerCase() === jawabanBenar.toString().trim().toLowerCase()) {
        score += 20; // Tambah 20 poin per soal benar
    }
    currentQuestionIndex++;
    tampilkanSoal();
}

async function selesaiGame() {
    document.getElementById("screen-quiz").classList.add("hidden");
    document.getElementById("screen-result").classList.remove("hidden");
    document.getElementById("score-board").innerText = score;
    document.getElementById("sync-status").innerText = "Menyimpan skor ke Google Sheets...";

    try {
        // Kirim skor ke Google Sheets (POST)
        let payload = {
            nama: playerName,
            skor: score
        };

        await fetch(WEB_APP_URL, {
            method: "POST",
            mode: "no-cors", // Diperlukan untuk Apps Script
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
        });

        document.getElementById("sync-status").innerText = "✅ Skor berhasil disimpan ke Google Sheets!";
    } catch (error) {
        console.error("Gagal kirim skor:", error);
        document.getElementById("sync-status").innerText = "❌ Gagal menyimpan skor ke server.";
    }
}
