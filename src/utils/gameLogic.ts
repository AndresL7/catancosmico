import type { HexTile, Player, Resources, ResourceType, Vertex, Edge, Port } from '../types/game';
import { BOARD_DISTRIBUTION, DICE_NUMBERS, BUILD_COSTS, VICTORY_POINTS } from './constants';

/**
 * Genera los puertos (agujeros de gusano) en los bordes del tablero
 */
export function generatePorts(edges: Edge[], vertices: Vertex[]): Port[] {
  // 1. Identificar aristas de borde (solo tocan 1 hexágono)
  const borderEdges = edges.filter(e => e.hexIds.length === 1);
  
  if (borderEdges.length === 0) return [];

  // 2. Calcular el centro del tablero para ordenar las aristas angularmente
  const centerX = borderEdges.reduce((sum, e) => sum + e.position.x, 0) / borderEdges.length;
  const centerY = borderEdges.reduce((sum, e) => sum + e.position.y, 0) / borderEdges.length;
  
  // 3. Ordenar aristas por ángulo
  const sortedEdges = borderEdges.sort((a, b) => {
    const angleA = Math.atan2(a.position.y - centerY, a.position.x - centerX);
    const angleB = Math.atan2(b.position.y - centerY, b.position.x - centerX);
    return angleA - angleB;
  });
  
  // 4. Definir tipos de puertos disponibles
  const portTypes: { type: 'generic' | 'specialized', resource?: ResourceType }[] = [
    { type: 'generic' },
    { type: 'specialized', resource: 'gas' },
    { type: 'specialized', resource: 'dark-matter' },
    { type: 'generic' },
    { type: 'specialized', resource: 'dust' },
    { type: 'specialized', resource: 'energy' },
    { type: 'generic' },
    { type: 'specialized', resource: 'stars' },
    { type: 'generic' },
  ];
  
  // Mezclar tipos de puertos aleatoriamente
  for (let i = portTypes.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [portTypes[i], portTypes[j]] = [portTypes[j], portTypes[i]];
  }
  
  const ports: Port[] = [];
  
  // 5. Seleccionar aristas espaciadas para colocar los puertos
  // Queremos 9 puertos distribuidos lo más uniformemente posible
  const step = Math.floor(sortedEdges.length / 9);
  
  for (let i = 0; i < 9; i++) {
    // Usamos un offset para variar la posición inicial en cada juego si quisiéramos, 
    // pero por ahora fijo para asegurar distribución
    const edgeIndex = Math.floor(i * step + step / 2) % sortedEdges.length;
    const edge = sortedEdges[edgeIndex];
    const portType = portTypes[i];
    
    // Calcular rotación hacia el centro
    // Usamos la perpendicular a la arista para asegurar que el triángulo se alinee perfectamente
    let angleRad = Math.atan2(centerY - edge.position.y, centerX - edge.position.x);
    
    // Buscar los vértices de la arista para calcular la perpendicular exacta
    const v1 = vertices.find(v => v.id === edge.vertexIds[0]);
    const v2 = vertices.find(v => v.id === edge.vertexIds[1]);
    
    if (v1 && v2) {
      // Vector de la arista
      const dx = v2.position.x - v1.position.x;
      const dy = v2.position.y - v1.position.y;
      
      // Vector hacia el centro aproximado
      const toCenterX = centerX - edge.position.x;
      const toCenterY = centerY - edge.position.y;
      
      // Normales posibles (-dy, dx) y (dy, -dx)
      // Elegimos la que apunte hacia el centro (producto punto > 0)
      const n1x = -dy;
      const n1y = dx;
      
      const dot = n1x * toCenterX + n1y * toCenterY;
      
      if (dot > 0) {
        angleRad = Math.atan2(n1y, n1x);
      } else {
        angleRad = Math.atan2(-n1y, -n1x);
      }
    }

    const angleDeg = (angleRad * 180 / Math.PI);
    
    // Calcular posición desplazada hacia afuera para que no se solape con los filamentos
    // El triángulo tendrá una altura de 50px. Desplazamos la mitad para que la base toque la arista.
    const offsetDistance = 25; 
    const offsetX = -Math.cos(angleRad) * offsetDistance;
    const offsetY = -Math.sin(angleRad) * offsetDistance;
    
    ports.push({
      id: `port-${i}`,
      type: portType.type,
      resource: portType.resource,
      vertexIds: edge.vertexIds,
      position: {
        x: edge.position.x + offsetX,
        y: edge.position.y + offsetY
      },
      rotation: angleDeg
    });
  }
  
  console.log(`⚓ Generados ${ports.length} puertos espaciales`);
  return ports;
}

/**
 * Genera los vértices (intersecciones) del tablero
 * Cada hexágono tiene 6 vértices compartidos con hexágonos adyacentes
 */
export function generateVertices(board: HexTile[]): Vertex[] {
  const vertices: Vertex[] = [];
  const hexSize = 70;
  const hexWidth = Math.sqrt(3) * hexSize;
  const hexHeight = hexSize * 2;
  const verticalSpacing = (hexHeight * 3) / 4;
  
  // Configuración de filas (igual que en Board.tsx)
  const rowSizes = [3, 4, 5, 4, 3];
  const maxRowWidth = 5 * hexWidth;
  
  board.forEach((hex) => {
    const row = hex.position.row;
    const col = hex.position.col;
    
    // Calcular el offset horizontal para centrar la fila (igual que en Board.tsx)
    const rowSize = rowSizes[row];
    const rowWidth = rowSize * hexWidth;
    const horizontalOffset = (maxRowWidth - rowWidth) / 2;
    
    // Calcular posición base del hexágono
    const baseX = horizontalOffset + col * hexWidth;
    const baseY = row * verticalSpacing;
    
    // 6 vértices por hexágono (esquinas del polígono SVG)
    // Estos puntos coinciden EXACTAMENTE con el polígono en HexTile.tsx
    const hexVertices = [
      { x: hexWidth / 2, y: 0 },                    // Top
      { x: hexWidth, y: hexHeight / 4 },            // Top-right
      { x: hexWidth, y: (3 * hexHeight) / 4 },      // Bottom-right
      { x: hexWidth / 2, y: hexHeight },            // Bottom
      { x: 0, y: (3 * hexHeight) / 4 },             // Bottom-left
      { x: 0, y: hexHeight / 4 },                   // Top-left
    ];

    hexVertices.forEach((v) => {
      const absoluteX = baseX + v.x;
      const absoluteY = baseY + v.y;
      const vertexId = `v-${Math.round(absoluteX)}-${Math.round(absoluteY)}`;
      
      // Evitar duplicados (verificar si ya existe en posición similar)
      const exists = vertices.find(
        (existing) =>
          Math.abs(existing.position.x - absoluteX) < 3 &&
          Math.abs(existing.position.y - absoluteY) < 3
      );

      if (!exists) {
        vertices.push({
          id: vertexId,
          hexIds: [hex.id],
          position: { x: absoluteX, y: absoluteY },
          occupied: false,
          playerId: null,
          buildingType: null,
        });
      } else {
        // Agregar este hexágono a la lista de hexágonos del vértice existente
        if (!exists.hexIds.includes(hex.id)) {
          exists.hexIds.push(hex.id);
        }
      }
    });
  });

  console.log(`📍 Total de vértices generados: ${vertices.length}`);
  console.log('Vértices con múltiples hexágonos:', vertices.filter(v => v.hexIds.length > 1).length);
  console.log('Vértices con 3 hexágonos:', vertices.filter(v => v.hexIds.length === 3).length);
  console.log('Vértices con 2 hexágonos:', vertices.filter(v => v.hexIds.length === 2).length);
  console.log('Vértices con 1 hexágono:', vertices.filter(v => v.hexIds.length === 1).length);

  return vertices;
}

/**
 * Genera las aristas (lados) del tablero
 * Cada hexágono tiene 6 aristas compartidas con hexágonos adyacentes
 */
export function generateEdges(board: HexTile[], vertices: Vertex[]): Edge[] {
  const edges: Edge[] = [];
  const hexSize = 70;
  const hexWidth = Math.sqrt(3) * hexSize;
  const hexHeight = hexSize * 2;
  const verticalSpacing = (hexHeight * 3) / 4;

  // Configuración de filas (igual que en generateVertices)
  const rowSizes = [3, 4, 5, 4, 3];
  const maxRowWidth = 5 * hexWidth;

  board.forEach((hex) => {
    const row = hex.position.row;
    const col = hex.position.col;
    
    // Calcular el offset horizontal para centrar la fila
    const rowSize = rowSizes[row];
    const rowWidth = rowSize * hexWidth;
    const horizontalOffset = (maxRowWidth - rowWidth) / 2;
    
    const baseX = horizontalOffset + col * hexWidth;
    const baseY = row * verticalSpacing;
    
    // 6 vértices del hexágono (deben coincidir exactamente con generateVertices)
    const hexVertices = [
      { x: hexWidth / 2, y: 0 },                    // Top (v0)
      { x: hexWidth, y: hexHeight / 4 },            // Top-right (v1)
      { x: hexWidth, y: (3 * hexHeight) / 4 },      // Bottom-right (v2)
      { x: hexWidth / 2, y: hexHeight },            // Bottom (v3)
      { x: 0, y: (3 * hexHeight) / 4 },             // Bottom-left (v4)
      { x: 0, y: hexHeight / 4 },                   // Top-left (v5)
    ];
    
    // 6 aristas conectan vértices consecutivos: (v0-v1), (v1-v2), (v2-v3), (v3-v4), (v4-v5), (v5-v0)
    // Calcular el punto medio real entre cada par de vértices
    const edgeDefinitions = [
      { 
        vertexIndices: [0, 1], 
        midpoint: { 
          x: (hexVertices[0].x + hexVertices[1].x) / 2, 
          y: (hexVertices[0].y + hexVertices[1].y) / 2 
        } 
      }, // Top-right
      { 
        vertexIndices: [1, 2], 
        midpoint: { 
          x: (hexVertices[1].x + hexVertices[2].x) / 2, 
          y: (hexVertices[1].y + hexVertices[2].y) / 2 
        } 
      }, // Right
      { 
        vertexIndices: [2, 3], 
        midpoint: { 
          x: (hexVertices[2].x + hexVertices[3].x) / 2, 
          y: (hexVertices[2].y + hexVertices[3].y) / 2 
        } 
      }, // Bottom-right
      { 
        vertexIndices: [3, 4], 
        midpoint: { 
          x: (hexVertices[3].x + hexVertices[4].x) / 2, 
          y: (hexVertices[3].y + hexVertices[4].y) / 2 
        } 
      }, // Bottom-left
      { 
        vertexIndices: [4, 5], 
        midpoint: { 
          x: (hexVertices[4].x + hexVertices[5].x) / 2, 
          y: (hexVertices[4].y + hexVertices[5].y) / 2 
        } 
      }, // Left
      { 
        vertexIndices: [5, 0], 
        midpoint: { 
          x: (hexVertices[5].x + hexVertices[0].x) / 2, 
          y: (hexVertices[5].y + hexVertices[0].y) / 2 
        } 
      }, // Top-left
    ];

    edgeDefinitions.forEach((edgeDef) => {
      const absoluteX = baseX + edgeDef.midpoint.x;
      const absoluteY = baseY + edgeDef.midpoint.y;
      const edgeId = `e-${Math.round(absoluteX)}-${Math.round(absoluteY)}`;
      
      // Evitar duplicados
      const exists = edges.find(
        (existing) =>
          Math.abs(existing.position.x - absoluteX) < 3 &&
          Math.abs(existing.position.y - absoluteY) < 3
      );

      if (!exists) {
        // Encontrar los dos vértices específicos que conecta esta arista
        const v1Pos = hexVertices[edgeDef.vertexIndices[0]];
        const v2Pos = hexVertices[edgeDef.vertexIndices[1]];
        
        // Buscar vértices en las posiciones absolutas exactas
        const absoluteV1X = baseX + v1Pos.x;
        const absoluteV1Y = baseY + v1Pos.y;
        const absoluteV2X = baseX + v2Pos.x;
        const absoluteV2Y = baseY + v2Pos.y;
        
        const vertex1 = vertices.find(v => 
          Math.abs(v.position.x - absoluteV1X) < 3 &&
          Math.abs(v.position.y - absoluteV1Y) < 3
        );
        
        const vertex2 = vertices.find(v => 
          Math.abs(v.position.x - absoluteV2X) < 3 &&
          Math.abs(v.position.y - absoluteV2Y) < 3
        );
        
        if (!vertex1 || !vertex2) {
          console.warn(`No se encontraron vértices para arista en hex ${hex.id}:`, {
            v1Pos: { x: absoluteV1X, y: absoluteV1Y },
            v2Pos: { x: absoluteV2X, y: absoluteV2Y },
            vertex1: vertex1?.id,
            vertex2: vertex2?.id
          });
        }
        
        const vertexIds: [string, string] = [
          vertex1?.id || '',
          vertex2?.id || ''
        ];

        edges.push({
          id: edgeId,
          hexIds: [hex.id],
          vertexIds,
          position: { x: absoluteX, y: absoluteY },
          occupied: false,
          playerId: null,
        });
      } else {
        // Si la arista ya existe (compartida), solo agregar el hexId
        if (!exists.hexIds.includes(hex.id)) {
          exists.hexIds.push(hex.id);
        }
      }
    });
  });

  console.log(`Total de aristas generadas: ${edges.length}`);
  console.log(`Aristas con vértices faltantes:`, edges.filter(e => !e.vertexIds[0] || !e.vertexIds[1]).length);
  
  return edges;
}

/**
 * Baraja aleatoriamente un array
 */
export function shuffle<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Genera el tablero hexagonal con recursos y números aleatorios
 */
export function generateBoard(): HexTile[] {
  const shuffledResources = shuffle(BOARD_DISTRIBUTION);
  const shuffledNumbers = shuffle(DICE_NUMBERS);
  
  const board: HexTile[] = [];
  let numberIndex = 0;

  // Configuración del tablero en 3 filas (patrón hexagonal)
  // Fila 1: 3 hex
  // Fila 2: 4 hex
  // Fila 3: 5 hex
  // Fila 4: 4 hex
  // Fila 5: 3 hex
  const rows = [3, 4, 5, 4, 3];
  let id = 0;

  rows.forEach((cols, row) => {
    for (let col = 0; col < cols; col++) {
      const resourceType = shuffledResources[id];
      const diceNumber = resourceType === 'desert' ? null : shuffledNumbers[numberIndex++];
      
      board.push({
        id,
        resourceType,
        diceNumber,
        hasBlackHole: resourceType === 'desert', // El agujero negro empieza en el desierto
        position: { row, col },
      });
      id++;
    }
  });

  return board;
}

/**
 * Tira dos dados de 6 caras
 */
export function rollDice(): [number, number] {
  return [
    Math.floor(Math.random() * 6) + 1,
    Math.floor(Math.random() * 6) + 1,
  ];
}

/**
 * Verifica si un jugador tiene suficientes recursos para construir
 */
export function canBuild(
  player: Player,
  buildType: keyof typeof BUILD_COSTS
): boolean {
  const cost = BUILD_COSTS[buildType];
  if (!cost) return false;

  return Object.entries(cost).every(([resource, amount]) => {
    const resourceKey = resource as keyof Resources;
    return player.resources[resourceKey] >= (amount || 0);
  });
}

/**
 * Deduce los recursos necesarios para una construcción
 */
export function deductResources(
  resources: Resources,
  buildType: keyof typeof BUILD_COSTS
): Resources {
  const cost = BUILD_COSTS[buildType];
  const newResources = { ...resources };

  Object.entries(cost).forEach(([resource, amount]) => {
    const resourceKey = resource as keyof Resources;
    newResources[resourceKey] -= amount || 0;
  });

  return newResources;
}

/**
 * Distribuye recursos a jugadores basado en el resultado de los dados
 */
export function distributeResources(
  board: HexTile[],
  players: Player[],
  diceTotal: number,
  vertices: Vertex[]
): Player[] {
  // Encontrar todos los hexágonos que producen con este número
  const hexesWithNumber = board.filter(
    (hex) => hex.diceNumber === diceTotal && !hex.hasBlackHole
  );

  console.log(`🎲 Dado: ${diceTotal}`);
  console.log(`📦 Hexágonos que producen:`, hexesWithNumber.map(h => ({ id: h.id, tipo: h.resourceType, numero: h.diceNumber })));

  if (hexesWithNumber.length === 0) return players;

  return players.map((player) => {
    const newResources = { ...player.resources };
    const resourcesGained: Record<string, number> = {};
    
    // Por cada hexágono que produce
    hexesWithNumber.forEach((hex) => {
      if (hex.resourceType === 'desert') return;
      
      // Encontrar todos los vértices de este hexágono
      const hexVertices = vertices.filter(v => v.hexIds.includes(hex.id));
      
      console.log(`  Hex ${hex.id} (${hex.resourceType}): ${hexVertices.length} vértices totales`);
      
      // Por cada vértice, verificar si el jugador tiene una galaxia o cúmulo ahí
      hexVertices.forEach(vertex => {
        if (vertex.playerId === player.id && vertex.buildingType) {
          const resource = hex.resourceType as ResourceType;
          
          console.log(`    ✅ ${player.name} tiene ${vertex.buildingType} en vértice ${vertex.id}`);
          
          // Galaxias dan 1 recurso, cúmulos dan 2
          if (vertex.buildingType === 'galaxy') {
            newResources[resource] += 1;
            resourcesGained[resource] = (resourcesGained[resource] || 0) + 1;
          } else if (vertex.buildingType === 'cluster') {
            newResources[resource] += 2;
            resourcesGained[resource] = (resourcesGained[resource] || 0) + 2;
          }
        }
      });
    });

    if (Object.keys(resourcesGained).length > 0) {
      console.log(`  💰 ${player.name} ganó:`, resourcesGained);
    }

    return {
      ...player,
      resources: newResources,
    };
  });
}

/**
 * Calcula los puntos de victoria de un jugador
 */
export function calculateVictoryPoints(player: Player): number {
  let points = 0;
  
  // Puntos por edificios
  points += player.buildings.galaxies * VICTORY_POINTS.galaxy; // 1 punto cada galaxia
  points += player.buildings.clusters * VICTORY_POINTS.cluster; // 2 puntos cada cúmulo
  
  // Puntos por cartas de descubrimiento (victoria secreta)
  const discoveryCards = player.discoveryCards.filter(card => card.type === 'descubrimiento');
  points += discoveryCards.length; // 1 punto por cada carta de descubrimiento
  
  // Puntos por Dominio Gravitacional
  if (player.hasDominioGravitacional) {
    points += 2;
  }

  // Puntos por Cadena Filamentar Más Larga
  if (player.hasLongestChain) {
    points += 2;
  }
  
  return points;
}

/**
 * Calcula la longitud de la cadena filamentar más larga de un jugador
 */
export function calculateLongestChainLength(playerId: number, edges: Edge[], vertices: Vertex[]): number {
  // 1. Obtener todos los filamentos del jugador
  const playerEdges = edges.filter(e => e.occupied && e.playerId === playerId);
  if (playerEdges.length === 0) return 0;

  // 2. Construir grafo de adyacencia
  // Mapa: vertexId -> lista de edgeIds conectados
  const adj: Record<string, string[]> = {};
  
  playerEdges.forEach(edge => {
    edge.vertexIds.forEach(vId => {
      if (!adj[vId]) adj[vId] = [];
      adj[vId].push(edge.id);
    });
  });

  let maxPath = 0;

  // 3. DFS para encontrar el camino más largo
  const findMaxPath = (currentVertexId: string, visitedEdgeIds: Set<string>, currentLength: number) => {
    maxPath = Math.max(maxPath, currentLength);

    // Verificar si el vértice actual rompe la cadena (edificio enemigo)
    // Solo importa si ya hemos recorrido camino (no es el punto de inicio)
    if (currentLength > 0) {
      const vertex = vertices.find(v => v.id === currentVertexId);
      if (vertex?.occupied && vertex?.playerId !== playerId) {
        return; // Camino bloqueado, no podemos continuar a través de este vértice
      }
    }

    // Obtener aristas conectadas a este vértice
    const connectedEdgeIds = adj[currentVertexId] || [];

    connectedEdgeIds.forEach(edgeId => {
      if (!visitedEdgeIds.has(edgeId)) {
        // Encontrar el otro vértice de esta arista
        const edge = playerEdges.find(e => e.id === edgeId);
        if (edge) {
          const nextVertexId = edge.vertexIds[0] === currentVertexId ? edge.vertexIds[1] : edge.vertexIds[0];
          
          const newVisited = new Set(visitedEdgeIds);
          newVisited.add(edgeId);
          
          findMaxPath(nextVertexId, newVisited, currentLength + 1);
        }
      }
    });
  };

  // Iniciar búsqueda desde cada vértice que tenga aristas del jugador
  // (Para asegurar que encontramos el camino más largo incluso si está dividido)
  Object.keys(adj).forEach(startVertexId => {
    findMaxPath(startVertexId, new Set(), 0);
  });

  return maxPath;
}

/**
 * Guarda el estado del juego en localStorage
 */
export function saveGameState(state: any): void {
  try {
    localStorage.setItem('catanCosmico', JSON.stringify(state));
  } catch (error) {
    console.error('Error saving game state:', error);
  }
}

/**
 * Carga el estado del juego desde localStorage
 */
export function loadGameState(): any | null {
  try {
    const saved = localStorage.getItem('catanCosmico');
    if (!saved) return null;
    
    const parsed = JSON.parse(saved);
    
    // Validar que tenga los campos nuevos necesarios
    if (!parsed.discoveryDeck || !parsed.discardedDiscoveryCards || 
        parsed.movingBlackHole === undefined || parsed.selectingVictim === undefined ||
        parsed.selectingMonopolyResource === undefined || 
        parsed.selectingInventionResources === undefined ||
        parsed.buildingFreeRoads === undefined ||
        parsed.victoryPointsToWin === undefined ||
        parsed.upgradingToCluster === undefined ||
        parsed.showTutorial === undefined ||
        parsed.placingGalaxy === undefined ||
        parsed.placingFilament === undefined) {
      console.log('Estado guardado obsoleto, se necesita nuevo juego');
      clearGameState();
      return null;
    }
    
    // Validar que los jugadores tengan los nuevos campos
    const hasNewPlayerFields = parsed.players.every((p: any) => 
      p.discoveryCards !== undefined && 
      p.playedPozosGravitacionales !== undefined && 
      p.hasDominioGravitacional !== undefined
    );
    
    if (!hasNewPlayerFields) {
      console.log('Jugadores con estructura obsoleta, se necesita nuevo juego');
      clearGameState();
      return null;
    }
    
    return parsed;
  } catch (error) {
    console.error('Error loading game state:', error);
    clearGameState();
    return null;
  }
}

/**
 * Limpia el estado guardado
 */
export function clearGameState(): void {
  try {
    localStorage.removeItem('catanCosmico');
  } catch (error) {
    console.error('Error clearing game state:', error);
  }
}
