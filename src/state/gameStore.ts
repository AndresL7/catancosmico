import { create } from 'zustand';
import type { GameState, BuildingType, ResourceType, TradeOffer } from '../types/game';
import {
  generateBoard,
  rollDice,
  canBuild,
  deductResources,
  distributeResources,
  calculateVictoryPoints,
  saveGameState,
  loadGameState,
  clearGameState,
  generateVertices,
  generateEdges,
} from '../utils/gameLogic';
import { DEFAULT_PLAYERS, createShuffledDiscoveryDeck } from '../utils/constants';
import sparkleSound from '../assets/sparkle.mp3';
import errorSound from '../assets/error.mp3';
import clickSound from '../assets/click.mp3';

// Crear un audio para el sonido de construcción
const buildAudio = new Audio(sparkleSound);
const errorAudio = new Audio(errorSound);
const clickAudio = new Audio(clickSound);

// Función helper para reproducir el sonido de construcción
const playBuildSound = () => {
  buildAudio.currentTime = 0;
  buildAudio.play().catch(err => console.log('Error al reproducir sonido:', err));
};

// Función helper para reproducir el sonido de error
const playErrorSound = () => {
  errorAudio.currentTime = 0;
  errorAudio.play().catch(err => console.log('Error al reproducir sonido:', err));
};

// Función helper para reproducir el sonido de click
const playClickSound = () => {
  clickAudio.currentTime = 0;
  clickAudio.play().catch(err => console.log('Error al reproducir sonido:', err));
};

interface GameStore extends GameState {
  // Acciones del juego
  rollDiceAction: () => void;
  build: (buildType: BuildingType) => void;
  endTurn: () => void;
  newGame: (numberOfPlayers?: number, victoryPoints?: number) => void;
  loadGame: () => void;
  moveBlackHole: (hexId: number) => void;
  placeGalaxy: (vertexId: string) => void;
  placeFilament: (edgeId: string) => void;
  undoLastPlacement: () => void;
  createTradeOffer: (offering: Partial<Record<ResourceType, number>>, requesting: Partial<Record<ResourceType, number>>) => void;
  acceptTradeOffer: (offerId: string, acceptingPlayerId: number) => void;
  cancelTradeOffer: (offerId: string) => void;
  buyDiscoveryCard: () => void;
  playDiscoveryCard: (cardId: number) => void;
  startMovingBlackHole: () => void;
  confirmBlackHoleMove: (hexId: number) => void;
  selectVictimToSteal: (victimPlayerId: number) => void;
  cancelBlackHoleMove: () => void;
  playMonopolyCard: (resourceType: ResourceType) => void;
  cancelMonopolySelection: () => void;
  confirmInventionResources: (resource1: ResourceType, resource2: ResourceType) => void;
  cancelInventionSelection: () => void;
  playRoadBuildingCard: () => void;
  upgradeGalaxyToCluster: (vertexId: string) => void;
  cancelClusterUpgrade: () => void;
  closeTutorial: () => void;
  startPlacingGalaxy: () => void;
  cancelPlacingGalaxy: () => void;
  startPlacingFilament: () => void;
  cancelPlacingFilament: () => void;
}

const board = generateBoard();
const vertices = generateVertices(board);
const edges = generateEdges(board, vertices);

const initialState: GameState = {
  players: DEFAULT_PLAYERS,
  currentPlayerIndex: 0,
  board,
  vertices,
  edges,
  diceValues: [0, 0],
  phase: 'setup-galaxy-1',
  setupRound: 1,
  turn: 1,
  winner: null,
  blackHolePosition: null,
  tradeOffers: [],
  discoveryDeck: createShuffledDiscoveryDeck(),
  discardedDiscoveryCards: [],
  movingBlackHole: false,
  selectingVictim: null,
  selectingMonopolyResource: false,
  selectingInventionResources: false,
  buildingFreeRoads: 0,
  victoryPointsToWin: 10,
  upgradingToCluster: false,
  showTutorial: true,
  placingGalaxy: false,
  placingFilament: false,
};

export const useGameStore = create<GameStore>((set, get) => ({
  ...initialState,

  /**
   * Tira los dados y distribuye recursos
   */
  rollDiceAction: () => {
    const dice = rollDice();
    const total = dice[0] + dice[1];
    const { board, players, vertices } = get();

    // Si sale 7, todos los jugadores con más de 7 recursos deben descartar la mitad
    if (total === 7) {
      let playersAffected = 0;
      const updatedPlayers = players.map(player => {
        const totalResources = Object.values(player.resources).reduce((sum, val) => sum + val, 0);
        
        if (totalResources > 7) {
          playersAffected++;
          const toDiscard = Math.floor(totalResources / 2);
          
          // Crear array con todos los recursos del jugador
          const resourceList: ResourceType[] = [];
          (Object.entries(player.resources) as [ResourceType, number][]).forEach(([resource, amount]) => {
            for (let i = 0; i < amount; i++) {
              resourceList.push(resource);
            }
          });
          
          // Mezclar aleatoriamente (Fisher-Yates)
          for (let i = resourceList.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [resourceList[i], resourceList[j]] = [resourceList[j], resourceList[i]];
          }
          
          // Descartar los primeros 'toDiscard' recursos y quedarse con el resto
          const remaining = resourceList.slice(toDiscard);
          
          // Reconstruir objeto de recursos
          const newResources: typeof player.resources = {
            'dark-matter': 0,
            'gas': 0,
            'dust': 0,
            'energy': 0,
            'stars': 0,
          };
          
          remaining.forEach(resource => {
            newResources[resource]++;
          });
          
          return {
            ...player,
            resources: newResources,
          };
        }
        
        return player;
      });
      
      // Mostrar mensaje si hubo jugadores afectados
      if (playersAffected > 0) {
        const affectedNames = updatedPlayers
          .filter((_, idx) => {
            const totalResources = Object.values(players[idx].resources).reduce((sum, val) => sum + val, 0);
            return totalResources > 7;
          })
          .map(p => p.name)
          .join(', ');
        
        alert(`⚠️ ¡Número 7!\n\nJugadores con más de 7 recursos descartan la mitad:\n${affectedNames}`);
      }
      
      set({ diceValues: dice, phase: 'building', players: updatedPlayers });
      saveGameState({ ...get(), diceValues: dice, phase: 'building', players: updatedPlayers });
      return;
    }

    // Distribuir recursos basado en los dados
    const updatedPlayers = distributeResources(board, players, total, vertices);

    // Actualizar puntos de victoria
    const playersWithPoints = updatedPlayers.map((player) => ({
      ...player,
      victoryPoints: calculateVictoryPoints(player),
    }));

    // Verificar si hay ganador
    const winner = playersWithPoints.find(
      (p) => p.victoryPoints >= get().victoryPointsToWin
    );

    const newState = {
      diceValues: dice,
      players: playersWithPoints,
      winner: winner ? winner.id : null,
      phase: winner ? ('ended' as const) : ('building' as const),
    };

    set(newState);
    saveGameState({ ...get(), ...newState });
  },

  /**
   * Construye un edificio/carta
   */
  build: (buildType: BuildingType) => {
    const { players, currentPlayerIndex } = get();
    const currentPlayer = players[currentPlayerIndex];

    // Verificar si puede construir
    if (!canBuild(currentPlayer, buildType)) {
      playErrorSound();
      
      const buildNames = {
        'filament': 'un Filamento',
        'galaxy': 'una Galaxia',
        'cluster': 'un Cúmulo',
        'discovery': 'una Carta de Descubrimiento'
      };
      
      const buildCosts = {
        'filament': '• 1 Materia Oscura\n• 1 Gas',
        'galaxy': '• 1 Materia Oscura\n• 1 Gas\n• 1 Polvo\n• 1 Energía',
        'cluster': '• 2 Materia Oscura\n• 1 Polvo\n• 1 Gas\n• 1 Estrella',
        'discovery': '• 1 Polvo\n• 1 Energía\n• 1 Estrella'
      };
      
      alert(`❌ No tienes suficientes recursos para construir ${buildNames[buildType]}.\n\nNecesitas:\n${buildCosts[buildType]}`);
      return;
    }

    // Si es galaxia, activar modo de colocación
    if (buildType === 'galaxy') {
      playBuildSound();
      set({ placingGalaxy: true });
      return;
    }

    // Si es filamento, activar modo de colocación
    if (buildType === 'filament') {
      playBuildSound();
      set({ placingFilament: true });
      return;
    }

    // Si es cúmulo, verificar que tenga al menos una galaxia para mejorar
    if (buildType === 'cluster') {
      if (currentPlayer.buildings.galaxies === 0) {
        playErrorSound();
        alert('❌ No tienes galaxias para mejorar a cúmulo.\n\nPrimero debes construir una galaxia.');
        return;
      }
      
      // Activar modo de selección de galaxia
      playBuildSound();
      set({ upgradingToCluster: true });
      return;
    }

    // Solo para cartas de descubrimiento (compra directa)
    if (buildType === 'discovery') {
      // Reproducir sonido de construcción
      playBuildSound();

      // Deducir recursos
      const newResources = deductResources(currentPlayer.resources, buildType);

      // Actualizar edificios
      const newBuildings = { ...currentPlayer.buildings };
      newBuildings.discoveries++;

      // Actualizar jugador
      const updatedPlayers = [...players];
      updatedPlayers[currentPlayerIndex] = {
        ...currentPlayer,
        resources: newResources,
        buildings: newBuildings,
        victoryPoints: calculateVictoryPoints({
          ...currentPlayer,
          buildings: newBuildings,
        }),
      };

      // Verificar ganador
      const winner = updatedPlayers.find(
        (p) => p.victoryPoints >= get().victoryPointsToWin
      );

      const newState = {
        players: updatedPlayers,
        winner: winner ? winner.id : null,
        phase: winner ? ('ended' as const) : get().phase,
      };

      set(newState);
      saveGameState({ ...get(), ...newState });
    }
  },

  /**
   * Termina el turno del jugador actual
   */
  endTurn: () => {
    playClickSound();
    const { players, currentPlayerIndex, turn } = get();
    const nextIndex = (currentPlayerIndex + 1) % players.length;

    const newState = {
      currentPlayerIndex: nextIndex,
      turn: nextIndex === 0 ? turn + 1 : turn,
      phase: 'playing' as const,
      diceValues: [0, 0] as [number, number],
    };

    set(newState);
    saveGameState({ ...get(), ...newState });
  },

  /**
   * Inicia un nuevo juego
   */
  newGame: (numberOfPlayers = 4, victoryPoints = 10) => {
    console.log('🎮 Iniciando nuevo juego con', numberOfPlayers, 'jugadores');
    playClickSound();
    clearGameState();
    const newBoard = generateBoard();
    const newVertices = generateVertices(newBoard);
    const newEdges = generateEdges(newBoard, newVertices);
    
    // Crear jugadores según el número seleccionado
    const selectedPlayers = DEFAULT_PLAYERS.slice(0, numberOfPlayers).map(p => ({ 
      ...p, 
      placedGalaxies: [], 
      placedFilaments: [] 
    }));
    
    console.log('✅ Tablero generado:', { 
      hexagons: newBoard.length, 
      vertices: newVertices.length, 
      edges: newEdges.length,
      players: selectedPlayers.length 
    });
    
    const newState = {
      ...initialState,
      board: newBoard,
      vertices: newVertices,
      edges: newEdges,
      players: selectedPlayers,
      victoryPointsToWin: victoryPoints,
      discoveryDeck: createShuffledDiscoveryDeck(), // Regenerar mazo de cartas
      discardedDiscoveryCards: [], // Reiniciar cartas descartadas
    };
    
    console.log('🎲 Estado del juego creado:', newState.phase);
    set(newState);
    saveGameState(newState);
    console.log('💾 Juego guardado');
  },

  /**
   * Carga un juego guardado
   */
  loadGame: () => {
    const savedState = loadGameState();
    if (savedState) {
      set(savedState);
    }
  },

  /**
   * Mueve el agujero negro a un nuevo hexágono
   */
  moveBlackHole: (hexId: number) => {
    const { board } = get();

    // Remover agujero negro de la posición anterior
    const updatedBoard = board.map((hex) => ({
      ...hex,
      hasBlackHole: hex.id === hexId,
    }));

    const newState = {
      board: updatedBoard,
      blackHolePosition: hexId,
      phase: 'building' as const,
    };

    set(newState);
    saveGameState({ ...get(), ...newState });
  },

  /**
   * Coloca una galaxia en un vértice (durante setup o construcción)
   */
  placeGalaxy: (vertexId: string) => {
    const { vertices, players, currentPlayerIndex, phase, setupRound } = get();
    
    const vertex = vertices.find((v) => v.id === vertexId);
    if (!vertex || vertex.occupied) return;

    // Durante fase de construcción
    if (phase === 'building') {
      const currentPlayer = players[currentPlayerIndex];
      
      // Verificar que el jugador tenga suficientes recursos
      if (!canBuild(currentPlayer, 'galaxy')) {
        playErrorSound();
        alert('❌ No tienes suficientes recursos para construir una Galaxia.\n\nNecesitas:\n• 1 Materia Oscura\n• 1 Gas\n• 1 Polvo Cósmico\n• 1 Energía');
        return;
      }
      
      // Reproducir sonido de construcción
      playBuildSound();
      
      // Deducir recursos
      const newResources = deductResources(currentPlayer.resources, 'galaxy');
      
      // Marcar vértice como ocupado
      const updatedVertices = vertices.map((v) =>
        v.id === vertexId
          ? { ...v, occupied: true, playerId: players[currentPlayerIndex].id, buildingType: 'galaxy' as const }
          : v
      );
      
      const updatedVertex = updatedVertices.find(v => v.id === vertexId);
      if (!updatedVertex) return;
      
      // Actualizar jugador
      const updatedPlayers = [...players];
      const updatedPlayer = {
        ...currentPlayer,
        resources: newResources,
        buildings: {
          ...currentPlayer.buildings,
          galaxies: currentPlayer.buildings.galaxies + 1,
        },
        placedGalaxies: [...currentPlayer.placedGalaxies, updatedVertex],
      };
      updatedPlayer.victoryPoints = calculateVictoryPoints(updatedPlayer);
      updatedPlayers[currentPlayerIndex] = updatedPlayer;
      
      const newState = {
        vertices: updatedVertices,
        players: updatedPlayers,
        placingGalaxy: false, // Desactivar modo de colocación
      };
      
      set(newState);
      saveGameState({ ...get(), ...newState });
      return;
    }
    
    // Durante setup - solo permitir en fases de setup de galaxia
    if (!phase.startsWith('setup-galaxy')) return;

    // No hay validaciones de distancia - confiar en que el jugador coloque correctamente

    // Reproducir sonido de construcción
    playBuildSound();

    // Marcar vértice como ocupado
    const updatedVertices = vertices.map((v) =>
      v.id === vertexId
        ? { ...v, occupied: true, playerId: players[currentPlayerIndex].id, buildingType: 'galaxy' as const }
        : v
    );
    
    // Obtener el vértice actualizado
    const updatedVertex = updatedVertices.find(v => v.id === vertexId);
    if (!updatedVertex) return;

    // Actualizar jugador
    const updatedPlayers = [...players];
    const playerUpdate = {
      ...updatedPlayers[currentPlayerIndex],
      buildings: {
        ...updatedPlayers[currentPlayerIndex].buildings,
        galaxies: updatedPlayers[currentPlayerIndex].buildings.galaxies + 1,
      },
      placedGalaxies: [...updatedPlayers[currentPlayerIndex].placedGalaxies, updatedVertex],
    };
    playerUpdate.victoryPoints = calculateVictoryPoints(playerUpdate);
    updatedPlayers[currentPlayerIndex] = playerUpdate;

    // Si es la segunda galaxia, dar recursos de los hexágonos adyacentes
    if (setupRound === 2) {
      const resources = { ...updatedPlayers[currentPlayerIndex].resources };
      console.log('🎁 Segunda galaxia - dando recursos iniciales');
      console.log('Hexágonos adyacentes al vértice:', updatedVertex.hexIds);
      
      updatedVertex.hexIds.forEach((hexId) => {
        const hex = get().board.find((h) => h.id === hexId);
        if (hex && hex.resourceType !== 'desert') {
          console.log(`  Hex ${hexId}: ${hex.resourceType} +1`);
          resources[hex.resourceType as keyof typeof resources]++;
        }
      });
      
      console.log('Recursos finales:', resources);
      updatedPlayers[currentPlayerIndex].resources = resources;
    }

    const nextPhase = (setupRound === 1 ? 'setup-filament-1' : 'setup-filament-2') as 'setup-filament-1' | 'setup-filament-2';
    
    const newState = {
      vertices: updatedVertices,
      players: updatedPlayers,
      phase: nextPhase,
    };

    set(newState);
    saveGameState({ ...get(), ...newState });
  },

  /**
   * Coloca un filamento en una arista (durante setup o construcción)
   */
  placeFilament: (edgeId: string) => {
    const { edges, players, currentPlayerIndex, phase, setupRound, buildingFreeRoads } = get();
    
    const edge = edges.find((e) => e.id === edgeId);
    if (!edge || edge.occupied) return;

    // Durante fase de construcción
    if (phase === 'building') {
      const currentPlayer = players[currentPlayerIndex];
      
      // Si estamos construyendo filamentos gratis (Constructor de Filamentos)
      if (buildingFreeRoads > 0) {
        // Reproducir sonido de construcción
        playBuildSound();
        
        // Marcar arista como ocupada
        const updatedEdges = edges.map((e) =>
          e.id === edgeId
            ? { ...e, occupied: true, playerId: players[currentPlayerIndex].id }
            : e
        );
        
        // Actualizar jugador
        const updatedPlayers = [...players];
        updatedPlayers[currentPlayerIndex] = {
          ...currentPlayer,
          buildings: {
            ...currentPlayer.buildings,
            filaments: currentPlayer.buildings.filaments + 1,
          },
          placedFilaments: [...currentPlayer.placedFilaments, edge],
        };
        
        const newState = {
          edges: updatedEdges,
          players: updatedPlayers,
          buildingFreeRoads: buildingFreeRoads - 1,
          placingFilament: buildingFreeRoads - 1 > 0, // Mantener activo si quedan filamentos por construir
        };
        
        set(newState);
        saveGameState({ ...get(), ...newState });
        return;
      }
      
      // Construcción normal (con recursos)
      // Verificar que el jugador tenga suficientes recursos
      if (!canBuild(currentPlayer, 'filament')) {
        playErrorSound();
        alert('❌ No tienes suficientes recursos para construir un Filamento.\n\nNecesitas:\n• 1 Materia Oscura\n• 1 Gas');
        return;
      }
      
      // Reproducir sonido de construcción
      playBuildSound();
      
      // Deducir recursos
      const newResources = deductResources(currentPlayer.resources, 'filament');
      
      // Marcar arista como ocupada
      const updatedEdges = edges.map((e) =>
        e.id === edgeId
          ? { ...e, occupied: true, playerId: players[currentPlayerIndex].id }
          : e
      );
      
      // Actualizar jugador
      const updatedPlayers = [...players];
      updatedPlayers[currentPlayerIndex] = {
        ...currentPlayer,
        resources: newResources,
        buildings: {
          ...currentPlayer.buildings,
          filaments: currentPlayer.buildings.filaments + 1,
        },
        placedFilaments: [...currentPlayer.placedFilaments, edge],
      };
      
      const newState = {
        edges: updatedEdges,
        players: updatedPlayers,
        placingFilament: false, // Desactivar modo de colocación
      };
      
      set(newState);
      saveGameState({ ...get(), ...newState });
      return;
    }
    
    // Durante setup - solo permitir en fases de setup de filamento
    if (!phase.startsWith('setup-filament')) return;

    // No hay validaciones de conectividad - confiar en que el jugador coloque correctamente
    
    // Reproducir sonido de construcción
    playBuildSound();
    
    // Marcar arista como ocupada
    const updatedEdges = edges.map((e) =>
      e.id === edgeId
        ? { ...e, occupied: true, playerId: players[currentPlayerIndex].id }
        : e
    );

    // Actualizar jugador
    const updatedPlayers = [...players];
    updatedPlayers[currentPlayerIndex] = {
      ...updatedPlayers[currentPlayerIndex],
      buildings: {
        ...updatedPlayers[currentPlayerIndex].buildings,
        filaments: updatedPlayers[currentPlayerIndex].buildings.filaments + 1,
      },
      placedFilaments: [...updatedPlayers[currentPlayerIndex].placedFilaments, edge],
    };

    // Determinar siguiente fase
    let nextPhase: typeof phase;
    let nextPlayerIndex = currentPlayerIndex;
    let nextSetupRound = setupRound;

    if (setupRound === 1) {
      // Primera ronda: avanzar al siguiente jugador
      if (currentPlayerIndex < players.length - 1) {
        nextPlayerIndex = currentPlayerIndex + 1;
        nextPhase = 'setup-galaxy-1';
      } else {
        // Última persona de la primera ronda, empezar segunda ronda en orden inverso
        nextPhase = 'setup-galaxy-2';
        nextSetupRound = 2;
      }
    } else {
      // Segunda ronda: retroceder al jugador anterior
      if (currentPlayerIndex > 0) {
        nextPlayerIndex = currentPlayerIndex - 1;
        nextPhase = 'setup-galaxy-2';
      } else {
        // Fin del setup, comenzar juego normal
        nextPhase = 'playing';
      }
    }

    const newState = {
      edges: updatedEdges,
      players: updatedPlayers,
      currentPlayerIndex: nextPlayerIndex,
      phase: nextPhase,
      setupRound: nextSetupRound,
    };

    set(newState);
    saveGameState({ ...get(), ...newState });
  },

  /**
   * Deshace la última colocación (galaxia o filamento) durante el setup
   */
  undoLastPlacement: () => {
    const state = get();
    const { vertices, edges, players, currentPlayerIndex, phase } = state;
    
    if (!phase.startsWith('setup')) return;
    
    const currentPlayer = players[currentPlayerIndex];
    
    // Si estamos en fase de filamento, quitar el último filamento
    if (phase.includes('filament')) {
      if (currentPlayer.placedFilaments.length === 0) return;
      
      const lastFilament = currentPlayer.placedFilaments[currentPlayer.placedFilaments.length - 1];
      
      const updatedEdges = edges.map(e => 
        e.id === lastFilament.id 
          ? { ...e, occupied: false, playerId: null }
          : e
      );
      
      const updatedPlayers = [...players];
      updatedPlayers[currentPlayerIndex] = {
        ...currentPlayer,
        buildings: {
          ...currentPlayer.buildings,
          filaments: currentPlayer.buildings.filaments - 1,
        },
        placedFilaments: currentPlayer.placedFilaments.slice(0, -1),
      };
      
      const newState = { ...state, edges: updatedEdges, players: updatedPlayers };
      set(newState);
      saveGameState(newState);
    }
    
    // Si estamos en fase de galaxia, quitar la última galaxia
    else if (phase.includes('galaxy')) {
      if (currentPlayer.placedGalaxies.length === 0) return;
      
      const lastGalaxy = currentPlayer.placedGalaxies[currentPlayer.placedGalaxies.length - 1];
      
      const updatedVertices = vertices.map(v => 
        v.id === lastGalaxy.id 
          ? { ...v, occupied: false, playerId: null, buildingType: null }
          : v
      );
      
      const updatedPlayers = [...players];
      const updatedPlayer = {
        ...currentPlayer,
        buildings: {
          ...currentPlayer.buildings,
          galaxies: currentPlayer.buildings.galaxies - 1,
        },
        placedGalaxies: currentPlayer.placedGalaxies.slice(0, -1),
      };
      updatedPlayer.victoryPoints = calculateVictoryPoints(updatedPlayer);
      updatedPlayers[currentPlayerIndex] = updatedPlayer;
      
      const newState = { ...state, vertices: updatedVertices, players: updatedPlayers };
      set(newState);
      saveGameState(newState);
    }
  },

  /**
   * Crea una oferta de comercio
   */
  createTradeOffer: (offering, requesting) => {
    const state = get();
    const currentPlayer = state.players[state.currentPlayerIndex];
    
    // Verificar que el jugador tenga los recursos que ofrece
    for (const [resource, amount] of Object.entries(offering)) {
      if ((currentPlayer.resources[resource as ResourceType] || 0) < (amount || 0)) {
        console.log('No tienes suficientes recursos para esta oferta');
        return;
      }
    }
    
    playClickSound();
    
    const newOffer: TradeOffer = {
      id: `trade-${Date.now()}`,
      fromPlayerId: currentPlayer.id,
      offering,
      requesting,
      timestamp: Date.now()
    };
    
    const newState = { ...state, tradeOffers: [...state.tradeOffers, newOffer] };
    set(newState);
    saveGameState(newState);
  },

  /**
   * Acepta una oferta de comercio
   */
  acceptTradeOffer: (offerId, acceptingPlayerId) => {
    const state = get();
    const offer = state.tradeOffers.find(o => o.id === offerId);
    
    if (!offer) return;
    
    const fromPlayer = state.players.find(p => p.id === offer.fromPlayerId);
    const toPlayer = state.players.find(p => p.id === acceptingPlayerId);
    
    if (!fromPlayer || !toPlayer) return;
    
    // Verificar que el jugador que ofrece aún tenga los recursos
    for (const [resource, amount] of Object.entries(offer.offering)) {
      if ((fromPlayer.resources[resource as ResourceType] || 0) < (amount || 0)) {
        console.log('El ofertante ya no tiene suficientes recursos');
        return;
      }
    }
    
    // Verificar que el jugador que acepta tenga los recursos solicitados
    for (const [resource, amount] of Object.entries(offer.requesting)) {
      if ((toPlayer.resources[resource as ResourceType] || 0) < (amount || 0)) {
        console.log('No tienes suficientes recursos para aceptar esta oferta');
        return;
      }
    }
    
    // Reproducir sonido
    playBuildSound();
    
    // Realizar el intercambio
    const updatedPlayers = state.players.map(player => {
      if (player.id === fromPlayer.id) {
        const newResources = { ...player.resources };
        // Dar los recursos solicitados
        for (const [resource, amount] of Object.entries(offer.requesting)) {
          newResources[resource as ResourceType] = (newResources[resource as ResourceType] || 0) + (amount || 0);
        }
        // Quitar los recursos ofrecidos
        for (const [resource, amount] of Object.entries(offer.offering)) {
          newResources[resource as ResourceType] = (newResources[resource as ResourceType] || 0) - (amount || 0);
        }
        return { ...player, resources: newResources };
      } else if (player.id === toPlayer.id) {
        const newResources = { ...player.resources };
        // Dar los recursos ofrecidos
        for (const [resource, amount] of Object.entries(offer.offering)) {
          newResources[resource as ResourceType] = (newResources[resource as ResourceType] || 0) + (amount || 0);
        }
        // Quitar los recursos solicitados
        for (const [resource, amount] of Object.entries(offer.requesting)) {
          newResources[resource as ResourceType] = (newResources[resource as ResourceType] || 0) - (amount || 0);
        }
        return { ...player, resources: newResources };
      }
      return player;
    });
    
    // Eliminar la oferta aceptada
    const updatedOffers = state.tradeOffers.filter(o => o.id !== offerId);
    
    const newState = { ...state, players: updatedPlayers, tradeOffers: updatedOffers };
    set(newState);
    saveGameState(newState);
  },

  /**
   * Cancela una oferta de comercio
   */
  cancelTradeOffer: (offerId) => {
    const state = get();
    const newState = { ...state, tradeOffers: state.tradeOffers.filter(o => o.id !== offerId) };
    set(newState);
    saveGameState(newState);
  },

  /**
   * Compra una carta de descubrimiento
   */
  buyDiscoveryCard: () => {
    const state = get();
    const currentPlayer = state.players[state.currentPlayerIndex];
    
    // Verificar que el jugador puede construir una carta de descubrimiento
    if (!canBuild(currentPlayer, 'discovery')) {
      playErrorSound();
      alert('❌ No tienes suficientes recursos para comprar una Carta de Descubrimiento.\n\nNecesitas:\n• 1 Polvo Cósmico\n• 1 Energía\n• 1 Estrella');
      return;
    }

    // Verificar que haya cartas en el mazo
    if (state.discoveryDeck.length === 0) {
      playErrorSound();
      alert('❌ No quedan cartas de descubrimiento en el mazo');
      return;
    }

    // Tomar la carta del mazo
    const [drawnCard, ...remainingDeck] = state.discoveryDeck;
    
    // Deducir los recursos
    const newResources = deductResources(currentPlayer.resources, 'discovery');
    
    // Actualizar el jugador
    const updatedPlayers = state.players.map(player => {
      if (player.id === currentPlayer.id) {
        return {
          ...player,
          resources: newResources,
          discoveryCards: [...player.discoveryCards, drawnCard],
          buildings: {
            ...player.buildings,
            discoveries: player.buildings.discoveries + 1,
          },
        };
      }
      return player;
    });

    // Recalcular puntos de victoria (las cartas de descubrimiento dan puntos)
    const playersWithPoints = updatedPlayers.map(player => ({
      ...player,
      victoryPoints: calculateVictoryPoints(player),
    }));

    playBuildSound();
    
    const newState = {
      ...state,
      players: playersWithPoints,
      discoveryDeck: remainingDeck,
    };
    
    set(newState);
    saveGameState(newState);
  },

  /**
   * Juega una carta de descubrimiento
   */
  playDiscoveryCard: (cardId: number) => {
    const state = get();
    const currentPlayer = state.players[state.currentPlayerIndex];
    
    // Buscar la carta en la mano del jugador
    const card = currentPlayer.discoveryCards.find(c => c.id === cardId);
    if (!card) {
      console.log('No tienes esa carta en tu mano');
      return;
    }

    // Las cartas de victoria secreta no se "juegan", solo se mantienen en mano
    if (card.type === 'descubrimiento') {
      console.log('Las cartas de descubrimiento se mantienen en tu mano para puntos de victoria');
      return;
    }

    // Manejar cartas de Pozo Gravitacional
    if (card.type === 'pozo_gravitacional') {
      // Incrementar contador de pozos gravitacionales
      const updatedPlayers = state.players.map(player => {
        if (player.id === currentPlayer.id) {
          const newCount = player.playedPozosGravitacionales + 1;
          return {
            ...player,
            playedPozosGravitacionales: newCount,
            discoveryCards: player.discoveryCards.filter(c => c.id !== cardId),
          };
        }
        return player;
      });

      // Verificar si algún jugador alcanzó 3 pozos para Dominio Gravitacional
      const playersWithDominio = updatedPlayers.map(player => {
        const hasDominio = player.playedPozosGravitacionales >= 3;
        return { ...player, hasDominioGravitacional: hasDominio };
      });

      // Solo un jugador puede tener Dominio Gravitacional (el que tenga más pozos)
      const maxPozos = Math.max(...playersWithDominio.map(p => p.playedPozosGravitacionales));
      const finalPlayers = playersWithDominio.map(player => ({
        ...player,
        hasDominioGravitacional: player.playedPozosGravitacionales === maxPozos && maxPozos >= 3,
      }));

      // Recalcular puntos de victoria (+2 puntos por Dominio Gravitacional)
      const playersWithPoints = finalPlayers.map(player => ({
        ...player,
        victoryPoints: calculateVictoryPoints(player),
      }));

      const newState = {
        ...state,
        players: playersWithPoints,
        discardedDiscoveryCards: [...state.discardedDiscoveryCards, card],
        movingBlackHole: true, // Activar modo de mover agujero negro
      };
      
      set(newState);
      saveGameState(newState);
      return;
    }

    // Manejar cartas de progreso
    if (card.type === 'progreso') {
      // Monopolio Cósmico
      if (card.name === 'Monopolio Cósmico') {
        // Remover la carta de la mano del jugador
        const updatedPlayers = state.players.map(player => {
          if (player.id === currentPlayer.id) {
            return {
              ...player,
              discoveryCards: player.discoveryCards.filter(c => c.id !== cardId),
            };
          }
          return player;
        });

        const newState = {
          ...state,
          players: updatedPlayers,
          discardedDiscoveryCards: [...state.discardedDiscoveryCards, card],
          selectingMonopolyResource: true, // Activar selector de recurso
        };
        
        set(newState);
        saveGameState(newState);
        return;
      }

      // Invención Galáctica
      if (card.name === 'Invención Galáctica') {
        const updatedPlayers = state.players.map(player => {
          if (player.id === currentPlayer.id) {
            return {
              ...player,
              discoveryCards: player.discoveryCards.filter(c => c.id !== cardId),
            };
          }
          return player;
        });

        const newState = {
          ...state,
          players: updatedPlayers,
          discardedDiscoveryCards: [...state.discardedDiscoveryCards, card],
          selectingInventionResources: true,
        };
        
        set(newState);
        saveGameState(newState);
        return;
      }

      // Constructor de Filamentos
      if (card.name === 'Constructor de Filamentos') {
        const updatedPlayers = state.players.map(player => {
          if (player.id === currentPlayer.id) {
            return {
              ...player,
              discoveryCards: player.discoveryCards.filter(c => c.id !== cardId),
            };
          }
          return player;
        });

        const newState = {
          ...state,
          players: updatedPlayers,
          discardedDiscoveryCards: [...state.discardedDiscoveryCards, card],
        };
        
        set(newState);
        saveGameState(newState);
        
        // Llamar a la función que activa el modo de construcción
        get().playRoadBuildingCard();
        return;
      }

      console.log('Carta de progreso desconocida');
      return;
    }

    console.log('Tipo de carta desconocido');
  },

  /**
   * Inicia el proceso de mover el agujero negro
   */
  startMovingBlackHole: () => {
    set({ movingBlackHole: true });
  },

  /**
   * Confirma el movimiento del agujero negro a un hexágono
   */
  confirmBlackHoleMove: (hexId: number) => {
    const state = get();
    
    // Mover el agujero negro
    const updatedBoard = state.board.map(hex => ({
      ...hex,
      hasBlackHole: hex.id === hexId,
    }));

    // Encontrar jugadores adyacentes al nuevo hexágono
    const adjacentVertices = state.vertices.filter(v => v.hexIds.includes(hexId) && v.occupied);
    const adjacentPlayerIds = [...new Set(adjacentVertices
      .map(v => v.playerId)
      .filter(id => id !== null && id !== state.currentPlayerIndex + 1))] as number[];

    if (adjacentPlayerIds.length === 0) {
      // No hay jugadores para robar, terminar
      const newState = {
        ...state,
        board: updatedBoard,
        blackHolePosition: hexId,
        movingBlackHole: false,
        selectingVictim: null,
      };
      set(newState);
      saveGameState(newState);
      return;
    }

    // Si hay jugadores, activar selección de víctima
    const newState = {
      ...state,
      board: updatedBoard,
      blackHolePosition: hexId,
      selectingVictim: { hexId, adjacentPlayerIds },
    };
    
    set(newState);
    saveGameState(newState);
  },

  /**
   * Selecciona un jugador del que robar un recurso
   */
  selectVictimToSteal: (victimPlayerId: number) => {
    const state = get();
    const victim = state.players.find(p => p.id === victimPlayerId);
    
    if (!victim) return;

    // Contar recursos totales de la víctima
    const totalResources = Object.values(victim.resources).reduce((sum, amount) => sum + amount, 0);
    
    if (totalResources === 0) {
      console.log('El jugador seleccionado no tiene recursos');
      const newState = {
        ...state,
        movingBlackHole: false,
        selectingVictim: null,
      };
      set(newState);
      saveGameState(newState);
      return;
    }

    // Seleccionar un recurso aleatorio
    const resourceTypes: ResourceType[] = [];
    for (const [resource, amount] of Object.entries(victim.resources)) {
      for (let i = 0; i < amount; i++) {
        resourceTypes.push(resource as ResourceType);
      }
    }
    const stolenResource = resourceTypes[Math.floor(Math.random() * resourceTypes.length)];

    // Transferir el recurso
    const updatedPlayers = state.players.map(player => {
      if (player.id === victimPlayerId) {
        return {
          ...player,
          resources: {
            ...player.resources,
            [stolenResource]: player.resources[stolenResource] - 1,
          },
        };
      }
      if (player.id === state.currentPlayerIndex + 1) {
        return {
          ...player,
          resources: {
            ...player.resources,
            [stolenResource]: player.resources[stolenResource] + 1,
          },
        };
      }
      return player;
    });

    const newState = {
      ...state,
      players: updatedPlayers,
      movingBlackHole: false,
      selectingVictim: null,
    };
    
    set(newState);
    saveGameState(newState);
    playBuildSound();
  },

  /**
   * Cancela el movimiento del agujero negro
   */
  cancelBlackHoleMove: () => {
    set({ movingBlackHole: false, selectingVictim: null });
  },

  /**
   * Juega la carta de Monopolio Cósmico
   */
  playMonopolyCard: (resourceType: ResourceType) => {
    const state = get();
    const currentPlayer = state.players[state.currentPlayerIndex];
    let totalStolen = 0;

    // Robar todos los recursos del tipo seleccionado de todos los demás jugadores
    const updatedPlayers = state.players.map(player => {
      if (player.id === currentPlayer.id) {
        // Este es el jugador actual, no le robamos
        return player;
      }

      // Contar cuántos recursos de este tipo tiene el oponente
      const amountToSteal = player.resources[resourceType];
      totalStolen += amountToSteal;

      // Quitarle todos los recursos de este tipo
      return {
        ...player,
        resources: {
          ...player.resources,
          [resourceType]: 0,
        },
      };
    });

    // Dar todos los recursos robados al jugador actual
    const finalPlayers = updatedPlayers.map(player => {
      if (player.id === currentPlayer.id) {
        return {
          ...player,
          resources: {
            ...player.resources,
            [resourceType]: player.resources[resourceType] + totalStolen,
          },
        };
      }
      return player;
    });

    const newState = {
      ...state,
      players: finalPlayers,
      selectingMonopolyResource: false,
    };

    set(newState);
    saveGameState(newState);
    playBuildSound();

    // Mostrar mensaje de éxito
    const resourceNames: Record<ResourceType, string> = {
      'dark-matter': 'Materia Oscura',
      'gas': 'Gas',
      'dust': 'Polvo Cósmico',
      'energy': 'Energía',
      'stars': 'Estrellas',
    };
    
    alert(`🌌 ¡Monopolio Cósmico activado!\n\nRobaste ${totalStolen} ${resourceNames[resourceType]} de tus oponentes.`);
  },

  /**
   * Cancela la selección de recurso para monopolio
   */
  cancelMonopolySelection: () => {
    set({ selectingMonopolyResource: false });
  },

  /**
   * Confirma los 2 recursos seleccionados para Invención Galáctica
   */
  confirmInventionResources: (resource1: ResourceType, resource2: ResourceType) => {
    const state = get();
    const currentPlayer = state.players[state.currentPlayerIndex];

    // Dar los 2 recursos al jugador actual
    const updatedPlayers = state.players.map(player => {
      if (player.id === currentPlayer.id) {
        return {
          ...player,
          resources: {
            ...player.resources,
            [resource1]: player.resources[resource1] + 1,
            [resource2]: player.resources[resource2] + 1,
          },
        };
      }
      return player;
    });

    const newState = {
      ...state,
      players: updatedPlayers,
      selectingInventionResources: false,
    };

    set(newState);
    saveGameState(newState);
    playBuildSound();

    const resourceNames: Record<ResourceType, string> = {
      'dark-matter': 'Materia Oscura',
      'gas': 'Gas',
      'dust': 'Polvo Cósmico',
      'energy': 'Energía',
      'stars': 'Estrellas',
    };

    alert(`🔬 ¡Invención Galáctica activada!\n\nRecibiste: 1 ${resourceNames[resource1]} + 1 ${resourceNames[resource2]}`);
  },

  /**
   * Cancela la selección de recursos para invención
   */
  cancelInventionSelection: () => {
    set({ selectingInventionResources: false });
  },

  /**
   * Activa el modo de construcción de filamentos gratis (Constructor de Filamentos)
   */
  playRoadBuildingCard: () => {
    const state = get();
    
    const newState = {
      ...state,
      buildingFreeRoads: 2, // Permite construir 2 filamentos gratis
    };

    set(newState);
    saveGameState(newState);
    
    alert('🛣️ Constructor de Filamentos activado!\n\nPuedes construir 2 filamentos gratis.\nHaz clic en las aristas del tablero.');
  },

  /**
   * Mejora una galaxia a cúmulo
   */
  upgradeGalaxyToCluster: (vertexId: string) => {
    const state = get();
    const currentPlayer = state.players[state.currentPlayerIndex];
    
    // Verificar que el vértice tenga una galaxia del jugador actual
    const vertex = state.vertices.find(v => v.id === vertexId);
    if (!vertex || vertex.playerId !== currentPlayer.id || vertex.buildingType !== 'galaxy') {
      playErrorSound();
      alert('❌ Debes seleccionar una de tus galaxias.');
      return;
    }

    // Verificar recursos (por si acaso)
    if (!canBuild(currentPlayer, 'cluster')) {
      playErrorSound();
      alert('❌ No tienes suficientes recursos para construir un Cúmulo.\n\nNecesitas:\n• 2 Materia Oscura\n• 1 Polvo\n• 1 Gas\n• 1 Estrella');
      set({ upgradingToCluster: false });
      return;
    }

    // Deducir recursos
    const newResources = deductResources(currentPlayer.resources, 'cluster');

    // Actualizar vértice de galaxia a cúmulo
    const updatedVertices = state.vertices.map(v =>
      v.id === vertexId
        ? { ...v, buildingType: 'cluster' as const }
        : v
    );

    // Actualizar jugador: -1 galaxia, +1 cúmulo
    const updatedPlayers = state.players.map(player => {
      if (player.id === currentPlayer.id) {
        const updatedPlayer = {
          ...player,
          resources: newResources,
          buildings: {
            ...player.buildings,
            galaxies: player.buildings.galaxies - 1,
            clusters: player.buildings.clusters + 1,
          },
        };
        updatedPlayer.victoryPoints = calculateVictoryPoints(updatedPlayer);
        return updatedPlayer;
      }
      return player;
    });

    const newState = {
      ...state,
      vertices: updatedVertices,
      players: updatedPlayers,
      upgradingToCluster: false,
    };

    set(newState);
    saveGameState(newState);
    playBuildSound();
    alert('✨ ¡Galaxia mejorada a Cúmulo!\n\nAhora este nodo produce el doble de recursos.');
  },

  /**
   * Cancela la mejora de cúmulo
   */
  cancelClusterUpgrade: () => {
    set({ upgradingToCluster: false });
  },

  /**
   * Cierra el tutorial inicial
   */
  closeTutorial: () => {
    set({ showTutorial: false });
  },

  /**
   * Activa el modo de colocación de galaxia
   */
  startPlacingGalaxy: () => {
    const { players, currentPlayerIndex, phase } = get();
    const currentPlayer = players[currentPlayerIndex];

    // Solo durante fase de juego (no setup)
    if (!phase.startsWith('setup') && canBuild(currentPlayer, 'galaxy')) {
      set({ placingGalaxy: true });
    } else {
      playErrorSound();
    }
  },

  /**
   * Cancela la colocación de galaxia
   */
  cancelPlacingGalaxy: () => {
    set({ placingGalaxy: false });
  },

  /**
   * Activa el modo de colocación de filamento
   */
  startPlacingFilament: () => {
    const { players, currentPlayerIndex, phase } = get();
    const currentPlayer = players[currentPlayerIndex];

    // Solo durante fase de juego (no setup)
    if (!phase.startsWith('setup') && canBuild(currentPlayer, 'filament')) {
      set({ placingFilament: true });
    } else {
      playErrorSound();
    }
  },

  /**
   * Cancela la colocación de filamento
   */
  cancelPlacingFilament: () => {
    set({ placingFilament: false });
  },
}));
