const Pi = window.Pi;

async function initPi() {
    try {
        await Pi.init({ version: "2.0" });
        console.log("Pi SDK berhasil diinisialisasi");
    } catch (e) {
        console.error("Gagal inisialisasi Pi SDK:", e);
    }
}

async function login() {
    const profile = document.getElementById('user-profile');
    const loginBtn = document.getElementById('btn-login');

    if (!window.Pi || !window.Pi.authenticate) {
        if (profile) profile.innerText = "Gunakan Pi Browser!";
        return;
    }

    try {
        const auth = await Pi.authenticate(['username', 'payments'], onIncompletePaymentFound);
        if (auth && auth.user) {
            profile.innerText = "Halo, " + auth.user.username;
            profile.style.color = "#d4af37";
            if (loginBtn) loginBtn.style.display = "none";
        }
    } catch (err) {
        console.error("Kesalahan Login:", err);
        if (profile) profile.innerText = "Klik Login Manual di bawah:";
        if (loginBtn) loginBtn.style.display = "inline-block";
    }
}

function onIncompletePaymentFound(payment) {
    return fetch('/api/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentId: payment.identifier, txid: payment.transaction.txid })
    });
};

async function buyProduct(productId, amount) {
    if (!window.Pi) return;
    const paymentData = {
        amount: amount,
        memo: "Pembelian " + productId + " di CTF Store",
        metadata: { productId: productId }
    };

    const callbacks = {
        onReadyForServerApproval: (paymentId) => {
            return fetch('/api/approve', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ paymentId })
            });
        },
        onReadyForServerCompletion: (paymentId, txid) => {
            return fetch('/api/complete', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ paymentId, txid })
            });
        },
        onCancel: (paymentId) => { console.log("Dibatalkan"); },
        onError: (error, payment) => { alert("Gagal transaksi, coba lagi."); }
    };

    try {
        await Pi.createPayment(paymentData, callbacks);
    } catch (err) {
        console.error("Gagal createPayment:", err);
    }
}

window.onload = async function() {
    await initPi();
    setTimeout(() => { login(); }, 1000);
};

// --- FITUR NAVIGASI ---
function toggleMenu() {
    const nav = document.getElementById('navMenu');
    if (nav) nav.classList.toggle('active');
}

// --- FITUR KEAMANAN & WHATSAPP (Ubay Corner) ---

// 1. Mematikan Klik Kanan
document.addEventListener('contextmenu', function(e) {
    e.preventDefault();
    alert("Apa yang kamu cari? Silahkan bertanya pada Ubay Corner (WhatsApp: 082177740963)");
});

// 2. Mematikan Shortcut Keyboard (Ctrl+U, F12, dsb)
document.onkeydown = function(e) {
    // Ctrl+U (View Source), Ctrl+Shift+I (Inspect), F12 (Dev Tools)
    if (
        (e.ctrlKey && (e.keyCode === 85 || e.keyCode === 73 || e.keyCode === 83)) || 
        e.keyCode === 123
    ) {
        alert("Apa yang kamu cari? Silahkan bertanya pada Ubay Corner (WhatsApp: 082177740963)");
        return false;
    }
};