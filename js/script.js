const SUPABASE_URL = 'https://ictdmhyiolwtrfyobttd.supabase.co';
const SUPABASE_KEY = 'sb_publishable_4EDDpWovLH9-0Khp7WLD_A_h3adPvRW';
const _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

const INFINITEPAY_HANDLE = 'lucca-schumaher';

async function checkout(event, valor, item) {
  if (event && event.preventDefault) event.preventDefault();

  const button = event ? event.target : null;
  if (button) {
    button.disabled = true;
    button.innerText = 'Processando...';
  }

  // 1. Tenta gravar no banco sem travar a navegação
  try {
    await _supabase
      .from('pedidos')
      .insert([{ plano: String(item), valor: Number(valor), status: 'pendente' }]);
  } catch (err) {
    console.warn('Registro no banco ignorado:', err);
  }

  // 2. Redireciona para o link da InfinitePay
  const linkPagamento = `https://infinitepay.io/pay/${INFINITEPAY_HANDLE}?amount=${valor}&description=${encodeURIComponent(item)}`;
  window.location.href = linkPagamento;
}
