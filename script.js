"use strict";

var papan = document.getElementById("papan");
var teksSkor = document.getElementById("skor");
var teksStatus = document.getElementById("status");
var tombolStart = document.getElementById("tombolStart");
var tombolPause = document.getElementById("tombolPause");
var tombolRestart = document.getElementById("tombolRestart");

var jumlahBaris = 9;
var jumlahKolom = 13;
var lebarPapan = 400;
var tinggiPapan = 400;
var ukuranSel = Math.min(lebarPapan / jumlahKolom, tinggiPapan / jumlahBaris);
var kecepatan = 200;

var grid = [];
var ular = [];
var apelBusuk = [];
var jumlahMakan = 0;

var geserBaris = 0;
var geserKolom = 1;
var terakhirKolom = 0;
var terakhirBaris = 1;

var pewaktu = null;

var keadaan = "siap";

function buatGrid() {
    grid = [];

    for (var baris = 0; baris < jumlahBaris; baris++) {
        var isiBaris = [];

        for (var kolom = 0; kolom < jumlahKolom; kolom++) {
            isiBaris.push(0);
        }

        grid.push(isiBaris);
    }
}

function cariSelKosong() {
    var baris = Math.floor(Math.random() * jumlahBaris);
    var kolom = Math.floor(Math.random() * jumlahKolom);

    while (grid[baris][kolom] !== 0) {
        baris = Math.floor(Math.random() * jumlahBaris);
        kolom = Math.floor(Math.random() * jumlahKolom);
    }

    return { baris: baris, kolom: kolom };
}

function taruhApel() {
    var sel = cariSelKosong();
    grid[sel.baris][sel.kolom] = 2;
}

function taruhBusuk() {
    var sel = cariSelKosong();
    grid[sel.baris][sel.kolom] = 3;
    apelBusuk.push(sel);

    if (apelBusuk.length > 3) {
        var lama = apelBusuk.shift();
        grid[lama.baris][lama.kolom] = 0;
    }
}

function siapkanGame() {
    berhenti();
    buatGrid();

    ular = [
        { baris: 2, kolom: 1 },
        { baris: 2, kolom: 2 },
        { baris: 2, kolom: 3 }
    ];

    apelBusuk = [];
    jumlahMakan = 0;

    geserBaris = 0;
    geserKolom = 1;
    terakhirBaris = 0;
    terakhirKolom = 1;

    for (var i = 0; i < ular.length; i++) {
        grid[ular[i].baris][ular[i].kolom] = 1;
    }

    taruhApel();
    keadaan = "siap";
    gambar();
    perbaruiTampilan();
}

function gambar() {
    papan.innerHTML = "";

    var kepala = ular[ular.length - 1];

    for (var baris = 0; baris < jumlahBaris; baris++) {
        var barisDiv = document.createElement("div");
        barisDiv.style.display = "flex";

        for (var kolom = 0; kolom < jumlahKolom; kolom++) {
            var sel = document.createElement("div");

            sel.style.width = ukuranSel + "px";
            sel.style.height = ukuranSel + "px";

            if ((baris + kolom) % 2 === 0) {
                sel.className = "sel genap";
            } else { sel.className = "sel ganjil" }

            var isi = grid[baris][kolom];

            if (isi !== 0) {
                var bentuk = document.createElement("div");

                if (isi === 1) {
                    if (baris === kepala.baris && kolom === kepala.kolom) {
                        bentuk.className = "bentuk kepala";
                        bentuk.style.transform = "rotate(" + cariSudutKepala() + "deg)";
                    } else {bentuk.className = "bentuk badan"}
                } else if (isi === 2) {
                    bentuk.className = "bentuk apel";
                } else if (isi === 3) {
                    bentuk.className = "bentuk busuk"
                }

                sel.appendChild(bentuk);
            } barisDiv.appendChild(sel);
        } papan.appendChild(barisDiv);
    }
}

function cariSudutKepala() {
    if (terakhirKolom === 1) {
        return 0;
    } else if (terakhirKolom === -1) {
        return 180;
    } else if (terakhirBaris === 1) {
        return 90;
    } else if (terakhirBaris === -1) {
        return -90;
    }
}

function langkah() {
    var kepala = ular[ular.length - 1];
    var barisBaru = kepala.baris + geserBaris;
    var kolomBaru = kepala.kolom + geserKolom;

    terakhirBaris = geserBaris;
    terakhirKolom = geserKolom;

    if (
        barisBaru >= 0 &&
        barisBaru < jumlahBaris &&
        kolomBaru >= 0 &&
        kolomBaru < jumlahKolom
    ) {
        if (grid[barisBaru][kolomBaru] === 1 || grid[barisBaru][kolomBaru] === 3) {
            gameOver();
            return;
        }

        var makan = grid[barisBaru][kolomBaru] === 2;

        if (!makan) {
            var ekor = ular.shift();
            grid[ekor.baris][ekor.kolom] = 0;
        }

        ular.push({ baris: barisBaru, kolom: kolomBaru })
        grid[barisBaru][kolomBaru] = 1;

        if (makan) {
            jumlahMakan = jumlahMakan + 1;
            taruhApel();

            if (jumlahMakan % 3 === 0) {
                taruhBusuk();
            }
        }

        gambar();
        perbaruiTampilan();
    } else {
        gameOver();
    }
}

function berhenti() {
    if (pewaktu !== null) {
        clearInterval(pewaktu);
        pewaktu = null;
    }
}

function gameOver() {
    berhenti();
    keadaan = "tamat";
    perbaruiTampilan();
}

function perbaruiTampilan() {
    teksSkor.textContent = jumlahMakan;
    
    if (keadaan === "siap") {
        teksStatus.textContent = "Siap";
    } else if (keadaan === "jalan") {
        teksStatus.textContent = "Jalan";
    } else if (keadaan === "jeda") {
        teksStatus.textContent = "Jeda";
    } else { teksStatus.textContent = "Game Over" }
    
    tombolStart.disabled = keadaan === "jalan" || keadaan === "tamat";
    tombolPause.disabled = keadaan !== "jalan";
}

function mulai() {
    if (keadaan !== "siap" && keadaan !== "jeda") {
        return;
    }

    keadaan = "jalan";
    pewaktu = setInterval(langkah, kecepatan);
    perbaruiTampilan();
}

function jeda() {
    if (keadaan !== "jalan") {
        return;
    }

    berhenti();
    keadaan = "jeda";
    perbaruiTampilan();
}

function ulang() {
    siapkanGame();
    mulai();
}

tombolStart.addEventListener("click", mulai);
tombolPause.addEventListener("click", jeda);
tombolRestart.addEventListener("click", ulang);

document.addEventListener("keydown", function (e) {
    if (keadaan !== "jalan") {
        return;
    }

    var tombol = e.key.toLowerCase();

    if (tombol === "w" && terakhirBaris !== 1) {
        geserBaris = -1;
        geserKolom = 0;
    }

    if (tombol === "s" && terakhirBaris !== -1) {
        geserBaris = 1;
        geserKolom = 0;
    }

    if (tombol === "a" && terakhirKolom !== 1) {
        geserBaris = 0;
        geserKolom = -1;
    }

    if (tombol === "d" && terakhirKolom !== -1) {
        geserBaris = 0;
        geserKolom = 1;
    }
})

siapkanGame()