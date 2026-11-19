// Catálogo da loja — itens reais do ASSALTO RJ.
// Preços em reais (R$). Entrega feita pelo KeySystem:
//   arma  -> ServerStorage.LojaFolder (fica salva na conta e volta em todo spawn)
//   carro -> ReplicatedStorage.Concessionaria.Veiculos (entra na garagem do jogador)
const PRODUCTS = [
  // ---------------- CARROS ----------------
  {
    id: 'carro_corolla',
    name: 'Corolla',
    description: 'Sedan confiável. Entregue direto na sua garagem, sem precisar comprar na concessionária.',
    price: 10,
    emoji: '🚗',
    grants: [{ type: 'car', name: 'Corolla', label: 'Corolla' }],
  },
  {
    id: 'carro_sw4',
    name: 'SW4',
    description: 'SUV parrudo pra cidade e pra fuga. Entregue direto na sua garagem.',
    price: 10,
    emoji: '🚙',
    grants: [{ type: 'car', name: 'SW4', label: 'SW4' }],
  },
  {
    id: 'carro_mercedes_e63',
    name: 'Mercedes E63',
    description: 'Luxo e velocidade. Entregue direto na sua garagem.',
    price: 10,
    emoji: '🚗',
    grants: [{ type: 'car', name: 'Mercedes E63', label: 'Mercedes E63' }],
  },
  {
    id: 'carro_trackhawk',
    name: 'Trackhawk',
    description: 'SUV blindado de fábrica, impõe respeito. Entregue direto na sua garagem.',
    price: 10,
    emoji: '🚙',
    grants: [{ type: 'car', name: 'Trackhawk', label: 'Trackhawk' }],
  },
  {
    id: 'carro_bmw_x6',
    name: 'BMW X6',
    description: 'Presença e potência. Entregue direto na sua garagem.',
    price: 10,
    emoji: '🚗',
    grants: [{ type: 'car', name: 'BMW X6', label: 'BMW X6' }],
  },
  {
    id: 'carro_mercedes_maybach',
    name: 'Mercedes Maybach',
    description: 'O carro mais luxuoso da cidade. Entregue direto na sua garagem.',
    price: 10,
    emoji: '🚘',
    grants: [{ type: 'car', name: 'Mercedes Maybach', label: 'Mercedes Maybach' }],
  },
  {
    id: 'carro_nivus',
    name: 'Nivus',
    description: 'Compacto rápido e estiloso. Entregue direto na sua garagem.',
    price: 10,
    emoji: '🚗',
    grants: [{ type: 'car', name: 'Nivus', label: 'Nivus' }],
  },
  {
    id: 'moto_africa_twin',
    name: 'Africa Twin',
    description: 'Moto trail pra correr muito. Entregue direto na sua garagem.',
    price: 10,
    emoji: '🏍️',
    grants: [{ type: 'car', name: 'Africa Twin', label: 'Africa Twin' }],
  },

  // ---------------- ARMAS ----------------
  {
    id: 'arma_akm',
    name: 'AKM',
    description: 'Fuzil 7.62 clássico. Fica salva na conta e volta em todo spawn.',
    price: 1,
    emoji: '🔫',
    grants: [{ type: 'weapon', name: 'AKM', folder: 'LojaFolder', label: 'AKM' }],
  },
  {
    id: 'arma_ak74u_tambor',
    name: 'AK74U Tambor',
    description: 'AK curta com tambor. Fica salva na conta e volta em todo spawn.',
    price: 1,
    emoji: '🔫',
    grants: [{ type: 'weapon', name: 'AK74U Tambor', folder: 'LojaFolder', label: 'AK74U Tambor' }],
  },
  {
    id: 'arma_ar_bope',
    name: 'AR BOPE',
    description: 'AR de dotação do BOPE. Fica salva na conta e volta em todo spawn.',
    price: 1,
    emoji: '🔫',
    grants: [{ type: 'weapon', name: 'AR BOPE', folder: 'LojaFolder', label: 'AR BOPE' }],
  },
  {
    id: 'arma_ar15_luneta',
    name: 'AR15 Luneta',
    description: 'AR15 com luneta pra longa distância. Fica salva na conta e volta em todo spawn.',
    price: 1,
    emoji: '🔫',
    grants: [{ type: 'weapon', name: 'AR15 Luneta', folder: 'LojaFolder', label: 'AR15 Luneta' }],
  },
  {
    id: 'arma_fal_cebeleira',
    name: 'FAL Cebeleira',
    description: 'FAL equipada. Fica salva na conta e volta em todo spawn.',
    price: 1,
    emoji: '🔫',
    grants: [{ type: 'weapon', name: 'FAL Cebeleira', folder: 'LojaFolder', label: 'FAL Cebeleira' }],
  },
  {
    id: 'arma_fn_fal',
    name: 'FN FAL',
    description: 'Fuzil de batalha 7.62. Fica salvo na conta e volta em todo spawn.',
    price: 1,
    emoji: '🔫',
    grants: [{ type: 'weapon', name: 'FN FAL', folder: 'LojaFolder', label: 'FN FAL' }],
  },
  {
    id: 'arma_m16a2',
    name: 'M16A2',
    description: 'Fuzil 5.56 preciso e estável. Fica salvo na conta e volta em todo spawn.',
    price: 1,
    emoji: '🔫',
    grants: [{ type: 'weapon', name: 'M16A2', folder: 'LojaFolder', label: 'M16A2' }],
  },
  {
    id: 'arma_ar_tracante_ouro',
    name: 'AR TRAÇANTE De Ouro',
    description: 'AR dourada exclusiva. Fica salva na conta e volta em todo spawn.',
    price: 1,
    emoji: '🔫',
    grants: [{ type: 'weapon', name: 'AR TRAÇANTE De Ouro', folder: 'LojaFolder', label: 'AR TRAÇANTE De Ouro' }],
  },
  {
    id: 'arma_ar10',
    name: 'AR10',
    description: 'Fuzil 7.62 de alto poder. Fica salvo na conta e volta em todo spawn.',
    price: 1,
    emoji: '🔫',
    grants: [{ type: 'weapon', name: 'AR10', folder: 'LojaFolder', label: 'AR10' }],
  },
  {
    id: 'arma_ar10_tambor',
    name: 'AR-10 Tambor',
    description: 'AR-10 com tambor de alta capacidade. Fica salvo na conta e volta em todo spawn.',
    price: 1,
    emoji: '🔫',
    grants: [{ type: 'weapon', name: 'AR-10 Tambor', folder: 'LojaFolder', label: 'AR-10 Tambor' }],
  },
  {
    id: 'arma_ar10_bolado',
    name: 'AR-10 BOLADO',
    description: 'AR-10 customizada. Fica salva na conta e volta em todo spawn.',
    price: 1,
    emoji: '🔫',
    grants: [{ type: 'weapon', name: 'AR-10 BOLADO', folder: 'LojaFolder', label: 'AR-10 BOLADO' }],
  },
  {
    id: 'arma_ak_de_lata_50',
    name: 'Ak de lata 50',
    description: 'AK de tambor pra segurar rua. Fica salva na conta e volta em todo spawn.',
    price: 1,
    emoji: '🔫',
    grants: [{ type: 'weapon', name: 'Ak de lata 50', folder: 'LojaFolder', label: 'Ak de lata 50' }],
  },
  {
    id: 'arma_g17',
    name: 'G17',
    description: 'Pistola 9mm confiável. Fica salva na conta e volta em todo spawn.',
    price: 1,
    emoji: '🔫',
    grants: [{ type: 'weapon', name: 'G17', folder: 'LojaFolder', label: 'G17' }],
  },
  {
    id: 'arma_g20_50',
    name: 'G20 50',
    description: 'Pistola .50 de impacto. Fica salva na conta e volta em todo spawn.',
    price: 1,
    emoji: '🔫',
    grants: [{ type: 'weapon', name: 'G20 50', folder: 'LojaFolder', label: 'G20 50' }],
  },
  {
    id: 'arma_m4a1',
    name: 'M4A1',
    description: 'Carabina 5.56 versátil. Fica salva na conta e volta em todo spawn.',
    price: 1,
    emoji: '🔫',
    grants: [{ type: 'weapon', name: 'M4A1', folder: 'LojaFolder', label: 'M4A1' }],
  },
  {
    id: 'arma_barret',
    name: 'Barret do tuezin',
    description: 'Sniper pesada pra longa distância. Fica salva na conta e volta em todo spawn.',
    price: 1,
    emoji: '🔫',
    grants: [{ type: 'weapon', name: 'Barret do tuezin', folder: 'LojaFolder', label: 'Barret do tuezin' }],
  },
];

const PRODUCT_BY_ID = new Map(PRODUCTS.map((product) => [product.id, product]));

function getProduct(id) {
  return PRODUCT_BY_ID.get(id) ?? null;
}

function formatPrice(value) {
  return `R$ ${Number(value).toFixed(2).replace('.', ',')}`;
}

function productChoices() {
  return PRODUCTS.slice(0, 25).map((product) => ({
    name: `${product.name} — ${formatPrice(product.price)}`.slice(0, 100),
    value: product.id,
  }));
}

module.exports = { PRODUCTS, getProduct, formatPrice, productChoices };
