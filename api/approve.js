export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    const { paymentId } = body;
    
    const PI_API_KEY = process.env.PI_API_KEY;

    if (!PI_API_KEY) {
      console.error("ERROR: PI_API_KEY tidak ditemukan di Environment Variables!");
      return res.status(500).json({ error: "Server Configuration Error" });
    }

    console.log(`Mencoba menyetujui pembayaran: ${paymentId}`);
    const response = await fetch(`https://api.minepi.com/v2/payments/${paymentId}/approve`, {
      method: 'POST',
      headers: {
        'Authorization': `Key ${PI_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();

    if (response.ok) {
      console.log(`Berhasil Approve: ${paymentId}`);
      return res.status(200).json(data);
    } else {
      console.error("Gagal Approve dari Pi Server:", data);
      return res.status(response.status).json(data);
    }
  } catch (error) {
    console.error("Backend Error:", error.message);
    return res.status(500).json({ error: error.message });
  }
}