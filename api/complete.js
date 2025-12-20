// api/complete.js
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    const { paymentId, txid } = body;
    
    const PI_API_KEY = process.env.PI_API_KEY;

    if (!PI_API_KEY) {
      console.error("ERROR: PI_API_KEY tidak ditemukan!");
      return res.status(500).json({ error: "Server Configuration Error" });
    }

    console.log(`Menyelesaikan pembayaran: ${paymentId} dengan TXID: ${txid}`);

    // Panggil API Pi Network untuk Complete
    const response = await fetch(`https://api.minepi.com/v2/payments/${paymentId}/complete`, {
      method: 'POST',
      headers: {
        'Authorization': `Key ${PI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ txid }) // Mengirimkan Transaction ID ke Pi
    });

    const data = await response.json();

    if (response.ok) {
      console.log(`Transaksi Sukses: ${paymentId}`);
      return res.status(200).json(data);
    } else {
      console.error("Gagal Complete dari Pi Server:", data);
      return res.status(response.status).json(data);
    }
  } catch (error) {
    console.error("Backend Error (Complete):", error.message);
    return res.status(500).json({ error: error.message });
  }
}