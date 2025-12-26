import React from 'react';
import { HexTile } from './HexTile';
import { VertexMarker } from './VertexMarker';
import { EdgeMarker } from './EdgeMarker';
import { Port } from './Port';
import { useGameStore } from '../state/gameStore';

/**
 * Componente que renderiza el tablero completo de hexágonos estilo panal de abejas
 */
export const Board: React.FC = () => {
  const { board, vertices, edges, ports, phase, moveBlackHole, placeGalaxy, placeFilament, players, currentPlayerIndex, movingBlackHole, confirmBlackHoleMove, upgradingToCluster, upgradeGalaxyToCluster, placingGalaxy, placingFilament } = useGameStore();

  const handleHexClick = (hexId: number) => {
    // Permitir mover el agujero negro cuando sale un 7 O cuando se está usando una carta de pozo gravitacional
    const currentDice = useGameStore.getState().diceValues;
    const total = currentDice[0] + currentDice[1];
    
    if ((total === 7 && phase === 'building') || movingBlackHole) {
      if (movingBlackHole) {
        // Si estamos en modo de carta, usar confirmBlackHoleMove
        confirmBlackHoleMove(hexId);
      } else {
        // Si es por sacar 7, usar moveBlackHole tradicional
        moveBlackHole(hexId);
      }
    }
  };

  const currentPlayer = players[currentPlayerIndex];
  const isSetupPhase = phase.startsWith('setup');
  const isGalaxyPhase = phase.includes('galaxy');
  const isFilamentPhase = phase.includes('filament');

  // Debug: contar aristas
  React.useEffect(() => {
    console.log(`Total de aristas en el estado: ${edges.length}`);
    console.log(`Aristas ocupadas: ${edges.filter(e => e.occupied).length}`);
    console.log(`Aristas sin vértices: ${edges.filter(e => !e.vertexIds[0] || !e.vertexIds[1]).length}`);
  }, [edges]);

  // Organizar los hexágonos en filas estilo panal
  const rows = [
    board.slice(0, 3),   // Fila 1: 3 hex
    board.slice(3, 7),   // Fila 2: 4 hex
    board.slice(7, 12),  // Fila 3: 5 hex (centro)
    board.slice(12, 16), // Fila 4: 4 hex
    board.slice(16, 19), // Fila 5: 3 hex
  ];

  // Tamaño del hexágono (debe coincidir con HexTile)
  const hexSize = 70;
  const hexHeight = hexSize * 2;
  const hexWidth = Math.sqrt(3) * hexSize;
  
  // Espaciado vertical entre filas (3/4 de la altura del hexágono)
  const verticalSpacing = (hexHeight * 3) / 4;
  
  // Calcular el ancho de la fila más ancha (5 hexágonos)
  const maxRowWidth = 5 * hexWidth;

  return (
    <div className="flex flex-col items-center justify-center p-8 bg-black/20 rounded-2xl">
      <h2 className="text-2xl font-bold mb-6 text-center bg-gradient-to-r from-purple-400 to-blue-500 bg-clip-text text-transparent">
        Tablero Cósmico
      </h2>
      
      <div className="relative inline-block">
        {rows.map((row, rowIndex) => {
          // Calcular el offset horizontal basado en el número de hexágonos en la fila
          // Centrar cada fila basada en la fila más ancha (5 hexágonos)
          const rowWidth = row.length * hexWidth;
          const horizontalOffset = (maxRowWidth - rowWidth) / 2;
          
          return (
            <div
              key={rowIndex}
              className="flex items-start absolute"
              style={{
                top: `${rowIndex * verticalSpacing}px`,
                left: `${horizontalOffset}px`,
                gap: '0px',
              }}
            >
              {row.map((tile) => (
                <HexTile
                  key={tile.id}
                  tile={tile}
                  onClick={() => handleHexClick(tile.id)}
                />
              ))}
            </div>
          );
        })}
        
        {/* Vértices (lugares para galaxias) */}
        {vertices.map((vertex) => {
          const playerColor = vertex.playerId
            ? players.find((p) => p.id === vertex.playerId)?.color
            : undefined;
          
          // Los vértices son clicables en:
          // 1. Fase de setup para galaxias
          // 2. Modo de colocación de galaxia (después de hacer clic en el botón)
          // 3. Modo de mejora a cúmulo (solo galaxias propias)
          const isClickable = (isSetupPhase && isGalaxyPhase && !vertex.occupied) || 
                             (placingGalaxy && !vertex.occupied) ||
                             (upgradingToCluster && vertex.playerId === currentPlayer.id && vertex.buildingType === 'galaxy');
          
          const handleVertexClick = () => {
            if (upgradingToCluster) {
              upgradeGalaxyToCluster(vertex.id);
            } else {
              placeGalaxy(vertex.id);
            }
          };
          
          return (
            <div
              key={vertex.id}
              style={{
                position: 'absolute',
                left: `${vertex.position.x}px`,
                top: `${vertex.position.y}px`,
                transform: 'translate(-50%, -50%)',
                pointerEvents: 'auto',
                zIndex: 10
              }}
            >
              <VertexMarker
                vertex={vertex}
                playerColor={playerColor}
                isClickable={isClickable}
                onClick={handleVertexClick}
                isUpgradeMode={upgradingToCluster}
              />
            </div>
          );
        })}
        
        {/* Aristas (lugares para filamentos) */}
        {edges.map((edge) => {
          const playerColor = edge.playerId
            ? players.find((p) => p.id === edge.playerId)?.color
            : undefined;
          
          // Las aristas son clicables en:
          // 1. Fase de setup para filamentos
          // 2. Modo de colocación de filamento (después de hacer clic en el botón)
          const isClickable = (isSetupPhase && isFilamentPhase && !edge.occupied) || 
                             (placingFilament && !edge.occupied);
          
          return (
            <div
              key={edge.id}
              style={{
                position: 'absolute',
                left: `${edge.position.x}px`,
                top: `${edge.position.y}px`,
                transform: 'translate(-50%, -50%)',
                pointerEvents: 'auto',
                zIndex: 5
              }}
            >
              <EdgeMarker
                edge={edge}
                vertices={vertices}
                playerColor={playerColor}
                isClickable={isClickable}
                onClick={() => placeFilament(edge.id)}
              />
            </div>
          );
        })}

        {/* Puertos (Agujeros de Gusano) */}
        {ports && ports.map((port) => (
          <Port key={port.id} port={port} />
        ))}
        
        {/* Espaciador invisible para dar altura al contenedor */}
        <div style={{ height: `${rows.length * verticalSpacing + hexHeight / 4}px`, width: `${maxRowWidth}px` }} />
      </div>
      
      {isSetupPhase && (
        <div className="mt-6 text-center">
          <p className="text-yellow-300 text-lg font-bold animate-pulse">
            {isGalaxyPhase && `${currentPlayer.name}: Coloca una Galaxia`}
            {isFilamentPhase && `${currentPlayer.name}: Coloca un Filamento`}
          </p>
          <p className="text-gray-400 text-sm mt-1">
            {isGalaxyPhase && 'Haz clic en una intersección (punto amarillo)'}
            {isFilamentPhase && 'Haz clic en un lado adyacente a tu galaxia'}
          </p>
        </div>
      )}
      
      {phase === 'building' && useGameStore.getState().diceValues[0] + useGameStore.getState().diceValues[1] === 7 && (
        <p className="mt-6 text-yellow-300 text-sm animate-pulse">
          ¡Haz clic en un hexágono para mover el Agujero Negro!
        </p>
      )}
    </div>
  );
};
