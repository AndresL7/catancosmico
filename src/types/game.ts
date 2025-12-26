// Tipos del juego Catán Cósmico

export type ResourceType = 'dark-matter' | 'gas' | 'dust' | 'energy' | 'stars';

export interface Resources {
  'dark-matter': number;
  'gas': number;
  'dust': number;
  'energy': number;
  'stars': number;
}

export type BuildingType = 'filament' | 'galaxy' | 'cluster' | 'discovery';

export type DiscoveryCardType = 'pozo_gravitacional' | 'progreso' | 'descubrimiento';

export interface DiscoveryCard {
  id: number;
  name: string;
  type: DiscoveryCardType;
  description: string;
  victoryPoints?: number; // Solo para cartas de descubrimiento (victoria secreta)
  turnBought?: number; // Turno en que se compró
}

export interface TradeOffer {
  id: string;
  fromPlayerId: number;
  offering: Partial<Resources>;
  requesting: Partial<Resources>;
  timestamp: number;
}

export interface HexTile {
  id: number;
  resourceType: ResourceType | 'desert';
  diceNumber: number | null; // 2-12, null para desierto
  hasBlackHole: boolean; // El "ladrón"
  position: { row: number; col: number };
}

export interface Player {
  id: number;
  name: string;
  color: string;
  resources: Resources;
  victoryPoints: number;
  buildings: {
    filaments: number; // Caminos construidos
    galaxies: number; // Poblados (1 punto c/u)
    clusters: number; // Ciudades (2 puntos c/u)
    discoveries: number; // Cartas de desarrollo
  };
  placedGalaxies: Vertex[]; // Posiciones de galaxias
  placedFilaments: Edge[]; // Posiciones de filamentos
  discoveryCards: DiscoveryCard[]; // Cartas en mano
  playedPozosGravitacionales: number; // Contador para Dominio Gravitacional
  hasDominioGravitacional: boolean; // Mayor ejército (3+ pozos)
  hasLongestChain: boolean; // Cadena filamentar más larga (5+ filamentos)
}

// Representa un vértice (intersección) donde se pueden colocar galaxias
export interface Vertex {
  id: string; // ID único como "hex0-v0", "hex0-v1", etc.
  hexIds: number[]; // IDs de los hexágonos que tocan este vértice (1-3)
  position: { x: number; y: number }; // Posición en píxeles
  occupied: boolean;
  playerId: number | null;
  buildingType: 'galaxy' | 'cluster' | null;
}

// Representa una arista (lado) donde se pueden colocar filamentos
export interface Edge {
  id: string; // ID único como "hex0-e0", "hex0-e1", etc.
  hexIds: number[]; // IDs de los hexágonos que tocan esta arista (1-2)
  vertexIds: [string, string]; // Los dos vértices que conecta
  position: { x: number; y: number }; // Posición central en píxeles
  occupied: boolean;
  playerId: number | null;
}

// Representa un puerto (agujero de gusano)
export interface Port {
  id: string;
  type: 'generic' | 'specialized';
  resource?: ResourceType; // Solo si es especializado
  vertexIds: [string, string]; // Los dos vértices que dan acceso al puerto
  position: { x: number; y: number }; // Posición para renderizar el icono
  rotation: number; // Ángulo para orientar el icono hacia el centro
}

export interface GameState {
  players: Player[];
  currentPlayerIndex: number;
  board: HexTile[];
  vertices: Vertex[];
  edges: Edge[];
  ports: Port[]; // Lista de puertos en el tablero
  diceValues: [number, number];
  phase: 'setup-galaxy-1' | 'setup-filament-1' | 'setup-galaxy-2' | 'setup-filament-2' | 'playing' | 'building' | 'trading' | 'ended';
  setupRound: number; // 1 o 2 (para las dos rondas de setup)
  turn: number;
  winner: number | null;
  blackHolePosition: number | null; // ID del hexágono con agujero negro
  tradeOffers: TradeOffer[]; // Ofertas de comercio activas
  discoveryDeck: DiscoveryCard[]; // Mazo de cartas
  discardedDiscoveryCards: DiscoveryCard[]; // Cartas descartadas
  movingBlackHole: boolean; // Si se está moviendo el agujero negro
  selectingVictim: { hexId: number; adjacentPlayerIds: number[] } | null; // Jugadores adyacentes para robar
  selectingMonopolyResource: boolean; // Si se está seleccionando recurso para monopolio
  selectingInventionResources: boolean; // Si se está seleccionando recursos para invención
  buildingFreeRoads: number; // Cuántos filamentos gratis quedan por construir (Constructor de Filamentos)
  victoryPointsToWin: number; // Puntos de victoria necesarios para ganar
  upgradingToCluster: boolean; // Si se está seleccionando una galaxia para mejorar a cúmulo
  showTutorial: boolean; // Si se muestra el tutorial inicial
  placingGalaxy: boolean; // Si se está seleccionando dónde colocar una galaxia
  placingFilament: boolean; // Si se está seleccionando dónde colocar un filamento
}

export interface BuildCost {
  [key: string]: Partial<Resources>;
}
