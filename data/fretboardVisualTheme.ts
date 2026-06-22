// Regra de governança: qualquer ferramenta nova que represente intervalos
// cromáticos no braço (não papel-na-forma de acorde, como Tríades/Tétrades)
// DEVE consumir TONIC_COLOR/INTERVAL_COLORS daqui — nunca declarar uma tabela
// de cores intervalares local. O Radar de Intervalos é a primeira ferramenta
// a consolidar essa linguagem visual cromática; é para ficar assim a partir
// de agora.
// Regras já em vigor (documentadas aqui para não ficarem implícitas —
// ferramentas futuras devem conseguir confirmar a regra sem precisar abrir
// Tríades/Tétrades/Radar para comparar por inspeção):
// - Tônica é sempre vermelha (TONIC_COLOR).
// - A linha de conexão tônica→intervalo é sempre vermelha (mesma cor da tônica).
// - A oitava usa a mesma cor da tônica (mesma classe de nota).
// - O trítono usa violeta, como entidade pedagógica própria do Radar.
// - Ferramentas novas não devem criar paletas intervalares locais — ver a
//   regra de governança acima.
//
// Distinção formal (para não tentar "unificar tudo" no futuro sem necessidade):
// - Ferramentas que exibem intervalos cromáticos (grau em relação a uma
//   tônica, ex. Radar de Intervalos) DEVEM usar INTERVAL_COLORS daqui.
// - Ferramentas que exibem função estrutural de acorde (papel-na-forma,
//   ex. "este é o slot da 3ª do acorde", como Tríades/Tétrades) PODEM usar
//   paletas próprias — não é a mesma categoria de informação visual.
export const TONIC_COLOR = '#dc2626';

export const INTERVAL_COLORS: Record<string, string> = {
  '1': TONIC_COLOR,
  b2: '#f97316',
  '2': '#fb923c',
  b3: '#d97706',
  '3': '#d97706',
  '4': '#22c55e',
  // IMPORTANTE: b5 e #4b5 são propositalmente diferentes, não duplicidade
  // acidental. b5 é o grau cromático usado pelos mapas de Tríade/Tétrade
  // (5º grau diminuto = mesma cor da 5ª justa). #4b5 é o trítono tratado
  // como entidade pedagógica própria no Radar de Intervalos.
  b5: '#2563eb',
  '5': '#2563eb',
  b6: '#8b5cf6',
  '6': '#a855f7',
  b7: '#ec4899',
  '7': '#f43f5e',
  '#4b5': '#7c3aed', // exclusivo do Radar: trítono como entidade especial/avançada
  '8': TONIC_COLOR,  // exclusivo do Radar: oitava = mesma classe de nota da tônica
};
