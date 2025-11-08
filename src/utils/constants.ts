import type { BuildCost, ResourceType, DiscoveryCard } from '../types/game';

// Costos de construcción según las reglas del juego
export const BUILD_COSTS: BuildCost = {
  filament: {
    'dark-matter': 1,
    'gas': 1,
  },
  galaxy: {
    'dark-matter': 1,
    'gas': 1,
    'dust': 1,
    'energy': 1,
  },
  cluster: {
    'dark-matter': 2,
    'dust': 1,
    'gas': 1,
    'stars': 1,
  },
  discovery: {
    'dust': 1,
    'energy': 1,
    'stars': 1,
  },
};

// Puntos de victoria por construcción
export const VICTORY_POINTS = {
  galaxy: 1,
  cluster: 2,
  filament: 0,
  discovery: 0,
};

// Puntos de victoria necesarios para ganar
export const VICTORY_POINTS_TO_WIN = 10;

// Colores de los recursos para el UI
export const RESOURCE_COLORS: Record<ResourceType | 'desert', string> = {
  'dark-matter': '#4A5568',
  'gas': '#68D391',
  'dust': '#C69C6D',
  'energy': '#F6AD55',
  'stars': '#3182CE',
  'desert': '#718096',
};

// Nombres en español de los recursos
export const RESOURCE_NAMES: Record<ResourceType | 'desert', string> = {
  'dark-matter': 'Materia Oscura',
  'gas': 'Gas',
  'dust': 'Polvo',
  'energy': 'Energía',
  'stars': 'Estrellas',
  'desert': 'Vacío Espacial',
};

// Distribución del tablero (19 hexágonos)
export const BOARD_DISTRIBUTION: Array<ResourceType | 'desert'> = [
  'dark-matter', 'dark-matter', 'dark-matter', 'dark-matter', 'dark-matter', 'dark-matter',
  'gas', 'gas', 'gas', 'gas',
  'dust', 'dust', 'dust', // Solo 3 Polvo Cósmico ahora
  'energy', 'energy', 'energy',
  'stars', 'stars', // 2 Estrellas para mejor distribución
  'desert', // El vacío del espacio
];

// Números de dados (2-12) para los hexágonos
export const DICE_NUMBERS = [2, 3, 3, 4, 4, 5, 5, 6, 6, 8, 8, 9, 9, 10, 10, 11, 11, 12];

// Configuración de 3 jugadores por defecto
export const DEFAULT_PLAYERS = [
  {
    id: 1,
    name: 'Jugador 1',
    color: '#3B82F6', // Azul
    resources: {
      'dark-matter': 0,
      'gas': 0,
      'dust': 0,
      'energy': 0,
      'stars': 0,
    },
    victoryPoints: 0,
    buildings: {
      filaments: 0,
      galaxies: 0,
      clusters: 0,
      discoveries: 0,
    },
    placedGalaxies: [],
    placedFilaments: [],
    discoveryCards: [],
    playedPozosGravitacionales: 0,
    hasDominioGravitacional: false,
  },
  {
    id: 2,
    name: 'Jugador 2',
    color: '#EF4444', // Rojo
    resources: {
      'dark-matter': 0,
      'gas': 0,
      'dust': 0,
      'energy': 0,
      'stars': 0,
    },
    victoryPoints: 0,
    buildings: {
      filaments: 0,
      galaxies: 0,
      clusters: 0,
      discoveries: 0,
    },
    placedGalaxies: [],
    placedFilaments: [],
    discoveryCards: [],
    playedPozosGravitacionales: 0,
    hasDominioGravitacional: false,
  },
  {
    id: 3,
    name: 'Jugador 3',
    color: '#10B981', // Verde
    resources: {
      'dark-matter': 0,
      'gas': 0,
      'dust': 0,
      'energy': 0,
      'stars': 0,
    },
    victoryPoints: 0,
    buildings: {
      filaments: 0,
      galaxies: 0,
      clusters: 0,
      discoveries: 0,
    },
    placedGalaxies: [],
    placedFilaments: [],
    discoveryCards: [],
    playedPozosGravitacionales: 0,
    hasDominioGravitacional: false,
  },
  {
    id: 4,
    name: 'Jugador 4',
    color: '#F59E0B', // Naranja/Amarillo
    resources: {
      'dark-matter': 0,
      'gas': 0,
      'dust': 0,
      'energy': 0,
      'stars': 0,
    },
    victoryPoints: 0,
    buildings: {
      filaments: 0,
      galaxies: 0,
      clusters: 0,
      discoveries: 0,
    },
    placedGalaxies: [],
    placedFilaments: [],
    discoveryCards: [],
    playedPozosGravitacionales: 0,
    hasDominioGravitacional: false,
  },
];

// Cartas de Descubrimiento (25 cartas totales)
export const DISCOVERY_CARDS: DiscoveryCard[] = [
  // Pozos Gravitacionales (14 cartas) - Permiten mover el agujero negro
  { id: 1, name: 'Pozo Gravitacional', type: 'pozo_gravitacional', description: 'Mueve el Agujero Negro a cualquier hexágono y roba 1 recurso de un jugador adyacente.' },
  { id: 2, name: 'Pozo Gravitacional', type: 'pozo_gravitacional', description: 'Mueve el Agujero Negro a cualquier hexágono y roba 1 recurso de un jugador adyacente.' },
  { id: 3, name: 'Pozo Gravitacional', type: 'pozo_gravitacional', description: 'Mueve el Agujero Negro a cualquier hexágono y roba 1 recurso de un jugador adyacente.' },
  { id: 4, name: 'Pozo Gravitacional', type: 'pozo_gravitacional', description: 'Mueve el Agujero Negro a cualquier hexágono y roba 1 recurso de un jugador adyacente.' },
  { id: 5, name: 'Pozo Gravitacional', type: 'pozo_gravitacional', description: 'Mueve el Agujero Negro a cualquier hexágono y roba 1 recurso de un jugador adyacente.' },
  { id: 6, name: 'Pozo Gravitacional', type: 'pozo_gravitacional', description: 'Mueve el Agujero Negro a cualquier hexágono y roba 1 recurso de un jugador adyacente.' },
  { id: 7, name: 'Pozo Gravitacional', type: 'pozo_gravitacional', description: 'Mueve el Agujero Negro a cualquier hexágono y roba 1 recurso de un jugador adyacente.' },
  { id: 8, name: 'Pozo Gravitacional', type: 'pozo_gravitacional', description: 'Mueve el Agujero Negro a cualquier hexágono y roba 1 recurso de un jugador adyacente.' },
  { id: 9, name: 'Pozo Gravitacional', type: 'pozo_gravitacional', description: 'Mueve el Agujero Negro a cualquier hexágono y roba 1 recurso de un jugador adyacente.' },
  { id: 10, name: 'Pozo Gravitacional', type: 'pozo_gravitacional', description: 'Mueve el Agujero Negro a cualquier hexágono y roba 1 recurso de un jugador adyacente.' },
  { id: 11, name: 'Pozo Gravitacional', type: 'pozo_gravitacional', description: 'Mueve el Agujero Negro a cualquier hexágono y roba 1 recurso de un jugador adyacente.' },
  { id: 12, name: 'Pozo Gravitacional', type: 'pozo_gravitacional', description: 'Mueve el Agujero Negro a cualquier hexágono y roba 1 recurso de un jugador adyacente.' },
  { id: 13, name: 'Pozo Gravitacional', type: 'pozo_gravitacional', description: 'Mueve el Agujero Negro a cualquier hexágono y roba 1 recurso de un jugador adyacente.' },
  { id: 14, name: 'Pozo Gravitacional', type: 'pozo_gravitacional', description: 'Mueve el Agujero Negro a cualquier hexágono y roba 1 recurso de un jugador adyacente.' },
  
  // Cartas de Progreso (6 cartas)
  { id: 15, name: 'Constructor de Filamentos', type: 'progreso', description: 'Construye 2 filamentos gratis.' },
  { id: 16, name: 'Constructor de Filamentos', type: 'progreso', description: 'Construye 2 filamentos gratis.' },
  { id: 17, name: 'Monopolio Cósmico', type: 'progreso', description: 'Elige un tipo de recurso. Todos los jugadores deben darte todos sus recursos de ese tipo.' },
  { id: 18, name: 'Monopolio Cósmico', type: 'progreso', description: 'Elige un tipo de recurso. Todos los jugadores deben darte todos sus recursos de ese tipo.' },
  { id: 19, name: 'Invención Galáctica', type: 'progreso', description: 'Toma 2 recursos de cualquier tipo del banco.' },
  { id: 20, name: 'Invención Galáctica', type: 'progreso', description: 'Toma 2 recursos de cualquier tipo del banco.' },
  
  // Cartas de Descubrimiento/Victoria (5 cartas) - 1 punto de victoria cada una
  { id: 21, name: 'Biblioteca Galáctica', type: 'descubrimiento', description: 'Has descubierto una antigua biblioteca con conocimiento ancestral.', victoryPoints: 1 },
  { id: 22, name: 'Nebulosa Antigua', type: 'descubrimiento', description: 'Has cartografiado una nebulosa de importancia histórica.', victoryPoints: 1 },
  { id: 23, name: 'Portal Estelar', type: 'descubrimiento', description: 'Has activado un portal que conecta galaxias distantes.', victoryPoints: 1 },
  { id: 24, name: 'Civilización Perdida', type: 'descubrimiento', description: 'Has encontrado evidencia de una civilización desaparecida.', victoryPoints: 1 },
  { id: 25, name: 'Anomalía Temporal', type: 'descubrimiento', description: 'Has estudiado una rara anomalía en el espacio-tiempo.', victoryPoints: 1 },
];

// Función para crear un mazo aleatorio de cartas
export function createShuffledDiscoveryDeck(): DiscoveryCard[] {
  const deck = [...DISCOVERY_CARDS];
  // Algoritmo Fisher-Yates para mezclar
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
}
