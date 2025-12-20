const Pi = window.Pi;

// Inisialisasi SDK
try {
    Pi.init({ version: "2.0", sandbox: true });
} catch (e) {
    console.error("Gagal inisialisasi Pi SDK:", e);
}

async function login() {
    console.log("Fungsi login terpanggil...");
    
    // Proteksi: Cek apakah dibuka di Pi Browser
    if (!window.Pi || !window.Pi.authenticate) {
        alert("Aplikasi ini harus dibuka di dalam Pi Browser agar fitur pembayaran aktif!");
        const profile = document.getElementById('user-profile');
        if (profile) profile.innerText = "Error: Gunakan Pi Browser!";
        return;
    }

    try {
        const auth = await Pi.authenticate(['username', 'payments'], onIncompletePaymentFound);
        
        if (auth && auth.user) {
            document.getElementById('user-profile').innerText = "Halo, " + auth.user.username;
            
            const loginBtn = document.getElementById('btn-login');
            if (loginBtn) loginBtn.style.display = "none";
            
            console.log("Login sukses: ", auth.user.username);
        }
    } catch (err) {
        console.error("Kesalahan Login:", err);
        // Jika error karena di luar Pi Browser, tampilkan pesan jelas
        document.getElementById('user-profile').innerText = "Login Gagal. Wajib gunakan Pi Browser!";
    }
}

function onIncompletePaymentFound(payment) {
    console.log("Menemukan pembayaran gantung:", payment);
    return fetch('/api/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            paymentId: payment.identifier, 
            txid: payment.transaction.txid 
        })
    });
};

async function buyProduct(productId, amount) {
    if (!window.Pi) {
        alert("Buka di Pi Browser untuk membeli!");
        return;
    }

    console.log("Memulai proses pembelian: " + productId);
    const userText = document.getElementById('user-profile').innerText;
    
    if (userText.includes("Menghubungkan") || userText.includes("Login") || userText.includes("Gagal")) {
        alert("Silakan klik 'Login Manual' terlebih dahulu di Pi Browser!");
        return;
    }

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
        onCancel: (paymentId) => { console.log("Pembayaran dibatalkan."); },
        onError: (error, payment) => { 
            console.error("Error pembayaran:", error);
            alert("Kesalahan transaksi. Coba lagi.");
        }
    };

    try {
        await Pi.createPayment(paymentData, callbacks);
    } catch (err) {
        console.error("Gagal createPayment:", err);
    }
}

window.onload = function() {
    login();
};