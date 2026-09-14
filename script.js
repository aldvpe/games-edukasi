const URL_GOOGLE_SCRIPT =
    "MASUKKAN_URL_GOOGLE_APPS_SCRIPT_DI_SINI";


let soal = [];
let soalSekarang = 0;
let skor = 0;
let namaPemain = "";


// ===============================
// MULAI GAME
// ===============================

async function mulaiGame() {

    const inputNama =
        document.getElementById("nama");

    namaPemain =
        inputNama.value.trim();

    if (!namaPemain) {

        alert("Masukkan nama terlebih dahulu!");

        return;
    }


    document
        .getElementById("startScreen")
        .classList.add("hidden");

    document
        .getElementById("quizScreen")
        .classList.remove("hidden");


    await ambilSoal();
}


// ===============================
// AMBIL SOAL DARI GOOGLE SHEETS
// ===============================

async function ambilSoal() {

    try {

        document.getElementById("pertanyaan")
            .innerText = "Memuat soal...";


        const response =
            await fetch(URL_GOOGLE_SCRIPT);


        soal = await response.json();


        if (!soal.length) {

            alert("Soal tidak ditemukan!");

            return;
        }


        // Acak soal
        soal.sort(() => Math.random() - 0.5);


        tampilkanSoal();

    } catch (error) {

        console.error(error);

        alert(
            "Gagal mengambil soal dari Google Sheets."
        );
    }
}


// ===============================
// TAMPILKAN SOAL
// ===============================

function tampilkanSoal() {

    const data =
        soal[soalSekarang];


    document.getElementById("nomorSoal")
        .innerText =
        `Soal ${soalSekarang + 1} / ${soal.length}`;


    document.getElementById("skor")
        .innerText = skor;


    document.getElementById("pertanyaan")
        .innerText =
        data.pertanyaan;


    document.getElementById("A")
        .innerText =
        "A. " + data.pilihanA;


    document.getElementById("B")
        .innerText =
        "B. " + data.pilihanB;


    document.getElementById("C")
        .innerText =
        "C. " + data.pilihanC;


    document.getElementById("D")
        .innerText =
        "D. " + data.pilihanD;


    document.getElementById("feedback")
        .innerText = "";


    aktifkanJawaban(true);
}


// ===============================
// JAWAB SOAL
// ===============================

function jawab(pilihan) {

    const data =
        soal[soalSekarang];


    aktifkanJawaban(false);


    if (
        pilihan.toUpperCase() ===
        String(data.jawaban).toUpperCase()
    ) {

        skor += 100;


        document.getElementById("feedback")
            .innerText =
            "✅ BENAR! +100 poin";


        document.getElementById(pilihan)
            .classList.add("correct");

    } else {

        document.getElementById("feedback")
            .innerText =
            "❌ SALAH!";


        document.getElementById(pilihan)
            .classList.add("wrong");
    }


    document.getElementById("skor")
        .innerText = skor;


    setTimeout(() => {

        soalSekarang++;


        if (
            soalSekarang >= soal.length
        ) {

            selesaiGame();

        } else {

            resetTombol();

            tampilkanSoal();
        }

    }, 1200);
}


// ===============================
// AKTIFKAN / MATIKAN JAWABAN
// ===============================

function aktifkanJawaban(status) {

    ["A", "B", "C", "D"].forEach(id => {

        document.getElementById(id)
            .disabled = !status;

    });
}


// ===============================
// RESET TOMBOL
// ===============================

function resetTombol() {

    ["A", "B", "C", "D"].forEach(id => {

        const tombol =
            document.getElementById(id);

        tombol.classList.remove(
            "correct",
            "wrong"
        );

    });
}


// ===============================
// GAME SELESAI
// ===============================

async function selesaiGame() {

    document
        .getElementById("quizScreen")
        .classList.add("hidden");


    document
        .getElementById("resultScreen")
        .classList.remove("hidden");


    document.getElementById("hasilNama")
        .innerText =
        namaPemain;


    document.getElementById("hasilSkor")
        .innerText =
        skor;


    let pesan = "";


    if (skor >= soal.length * 80) {

        pesan =
            "🌟 Luar biasa! Kamu sangat pintar!";

    } else if (skor >= soal.length * 50) {

        pesan =
            "👍 Bagus! Terus belajar ya!";

    } else {

        pesan =
            "💪 Jangan menyerah! Coba lagi!";

    }


    document.getElementById("hasilPesan")
        .innerText = pesan;


    await simpanSkor();
}


// ===============================
// SIMPAN SKOR KE GOOGLE SHEETS
// ===============================

async function simpanSkor() {

    try {

        await fetch(
            URL_GOOGLE_SCRIPT,
            {
                method: "POST",

                headers: {
                    "Content-Type":
                        "text/plain;charset=utf-8"
                },

                body: JSON.stringify({

                    nama: namaPemain,

                    skor: skor

                })
            }
        );

        console.log(
            "Skor berhasil disimpan."
        );

    } catch (error) {

        console.error(
            "Gagal menyimpan skor:",
            error
        );
    }
}
