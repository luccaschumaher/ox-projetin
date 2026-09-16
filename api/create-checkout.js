export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  const { amount, description } = req.body;

  try {
    // Chamada à API da InfinitePay
    const response = await fetch('https://api.infinitepay.io/v2/checkouts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.INFINITEPAY_API_KEY}`
      },
      body: JSON.stringify({
        amount: amount * 100, // Valor em centavos
        description: description,
        redirect_url: 'https://seu-site.vercel.app/sucesso'
      })
    });

    const data = await response.json();

    // Retorna a URL de cobrança para o front-end redirecionar
    return res.status(200).json({ checkout_url: data.checkout_url || data.url });
  } catch (error) {
    return res.status(500).json({ error: 'Erro ao comunicar com InfinitePay' });
  }
}
