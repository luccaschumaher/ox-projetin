// Configuração do Supabase
const SUPABASE_URL = 'https://ictdmhyiolwtrfyobttd.supabase.co';
const SUPABASE_KEY = 'sb_publishable_4EDDpWovLH9-0Khp7WLD_A_h3adPvRW';
const _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// Insira o seu $handle da InfinitePay aqui (sem o símbolo $)
const INFINITEPAY_HANDLE = 'lucca-schumaher'; 

async function checkout(valor, item) {
  const button = event.target;
  button.disabled = true;
  button.innerText = 'Processando...';

  try {
    // 1. Salva a intenção de compra no Supabase
    const { data, error } = await _supabase
      .from('pedidos')
      .insert([{ plano: item, valor: valor, status: 'pendente' }])
      .select();

    if (error) throw error;

    // 2. Tenta gerar via Serverless Function
    const response = await fetch('/api/create-checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        amount: valor, 
        description: item,
        order_id: data[0]?.id 
      })
    });

    const resData = await response.json();

    if (resData.checkout_url) {
      // 3. Redireciona para o checkout gerado
      window.location.href = resData.checkout_url;
    } else {
      // Fallback: Redireciona direto para o link de cobrança do handle da InfinitePay
      window.location.href = `https://infinitepay.io/pay/${INFINITEPAY_HANDLE}?amount=${valor}&description=${encodeURIComponent(item)}`;
    }
  } catch (err) {
    console.error('Erro no fluxo:', err);
    
    // Em caso de falha de rede/API, tenta o redirecionamento direto
    if (INFINITEPAY_HANDLE !== 'lucca-schumaher') {
      window.location.href = `https://infinitepay.io/pay/${INFINITEPAY_HANDLE}?amount=${valor}&description=${encodeURIComponent(item)}`;
    } else {
      alert('Erro ao processar o pedido. Tente novamente.');
      button.disabled = false;
      button.innerText = 'Comprar Agora';
    }
  }
}