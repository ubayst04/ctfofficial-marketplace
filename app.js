const Pi = window.Pi;
// Inisialisasi SDK dengan sandbox true untuk testing
Pi.init({ version: "2.0", sandbox: true });

async function login() {
    try {
        // Memulai proses login/autentikasi
        const auth = await Pi.authenticate(['username', 'payments'], onIncompletePaymentFound);
        
        // Update tampilan jika berhasil login
        if (auth && auth.user) {
            document.getElementById('user-profile').innerText = "Halo, " + auth.user.username;
            console.log("Login sukses: ", auth.user.username);
        }
    } catch (err) {
        console.error("Kesalahan Login:", err);
        document.getElementById('user-profile').innerText = "Gagal Login. Gunakan Pi Browser!";
    }
}

// Fungsi wajib untuk menangani pembayaran yang belum selesai
function onIncompletePaymentFound(payment) {
    console.log("Menemukan pembayaran gantung:", payment);
    // Di sini Anda bisa mengirim payment.identifier ke backend untuk di-complete jika perlu
};

async function buyProduct(productId, amount) {
    // Memberi notifikasi di log agar kita tahu tombol bekerja
    console.log("Memulai proses pembelian: " + productId);

    const paymentData = {
        amount: amount,
        memo: "Pembelian " + productId + " di CTF Store",
        metadata: { productId: productId }
    };

    const callbacks = {
        onReadyForServerApproval: (paymentId) => {
            console.log("Payment ID diterima, meminta approval server...");
            // Menghubungkan ke api/approve.js
            return fetch('/api/approve', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ paymentId })
            });
        },
        onReadyForServerCompletion: (paymentId, txid) => {
            console.log("Transaksi Blockchain selesai, memproses penyelesaian...");
            // Menghubungkan ke api/complete.js
            return fetch('/api/complete', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ paymentId, txid })
            });
        },
        onCancel: (paymentId) => { 
            console.log("Pembayaran dibatalkan oleh pengguna."); 
        },
        onError: (error, payment) => { 
            console.error("Terjadi kesalahan pembayaran:", error);
            if (payment) console.log("Data pembayaran error:", payment);
        }
    };

    try {
        await Pi.createPayment(paymentData, callbacks);
    } catch (err) {
        console.error("Gagal memproses CreatePayment:", err);
    }
}

// Jalankan fungsi login saat script dimuat
login();