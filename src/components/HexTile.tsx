import React from 'react';
import type { HexTile as HexTileType } from '../types/game';
import { useGameStore } from '../state/gameStore';

// Importar las imágenes de fondo
import materiaOscuraImg from '../assets/materia-oscura.jpg';
import gasImg from '../assets/gas.jpg';
import polvoCosmicoImg from '../assets/polvo-cosmico.jpg';
import energiaImg from '../assets/energia.jpg';
import estrellasImg from '../assets/estrellas.jpg';
import vacioImg from '../assets/vacio.jpg';
import agujeronNegroImg from '../assets/agujero-negro.jpg';

interface HexTileProps {
  tile: HexTileType;
  onClick?: () => void;
}

// Mapeo de recursos a imágenes
const RESOURCE_IMAGES: Record<string, string> = {
  'dark-matter': materiaOscuraImg,
  'gas': gasImg,
  'dust': polvoCosmicoImg,
  'energy': energiaImg,
  'stars': estrellasImg,
  'desert': vacioImg,
};

/**
 * Componente que representa un hexágono del tablero estilo panal de abejas
 */
export const HexTile: React.FC<HexTileProps> = ({ tile, onClick }) => {
  const backgroundImage = RESOURCE_IMAGES[tile.resourceType];
  const movingBlackHole = useGameStore((state) => state.movingBlackHole);
  const diceValues = useGameStore((state) => state.diceValues);
  const phase = useGameStore((state) => state.phase);
  
  // Determinar si estamos en modo de mover agujero negro
  const isBlackHoleMoveMode = movingBlackHole || (diceValues[0] + diceValues[1] === 7 && phase === 'building');

  // Tamaño del hexágono
  const size = 70; // tamaño en px
  const height = size * 2;
  const width = Math.sqrt(3) * size;
  
  const hexPoints = `
    ${width / 2},0
    ${width},${height / 4}
    ${width},${(3 * height) / 4}
    ${width / 2},${height}
    0,${(3 * height) / 4}
    0,${height / 4}
  `;

  return (
    <div
      className="hex-container"
      style={{
        width: `${width}px`,
        height: `${height}px`,
        position: 'relative',
      }}
    >
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        className={`
          cursor-pointer transition-all duration-200
          hover:drop-shadow-2xl hover:brightness-110
          ${tile.hasBlackHole ? 'animate-pulse' : ''}
          ${isBlackHoleMoveMode && !tile.hasBlackHole ? 'hover:brightness-125' : ''}
        `}
        onClick={onClick}
      >
        <defs>
          {/* Definir el clipPath hexagonal */}
          <clipPath id={`hex-clip-${tile.id}`}>
            <polygon points={hexPoints} />
          </clipPath>
        </defs>

        {/* Imagen de fondo con clipPath hexagonal */}
        <image
          href={backgroundImage}
          x="0"
          y="0"
          width={width}
          height={height}
          clipPath={`url(#hex-clip-${tile.id})`}
          preserveAspectRatio="xMidYMid slice"
        />

        {/* Borde del hexágono */}
        <polygon
          points={hexPoints}
          fill="none"
          stroke="#1a1a1a"
          strokeWidth="3"
          className="transition-all duration-200"
        />

        {/* Borde brillante si tiene agujero negro */}
        {tile.hasBlackHole && (
          <polygon
            points={hexPoints}
            fill="none"
            stroke="#a855f7"
            strokeWidth="6"
            opacity="0.7"
          />
        )}
        
        {/* Borde amarillo pulsante en modo de mover agujero negro */}
        {isBlackHoleMoveMode && !tile.hasBlackHole && (
          <polygon
            points={hexPoints}
            fill="none"
            stroke="#fbbf24"
            strokeWidth="4"
            opacity="0.6"
            className="animate-pulse"
          />
        )}

        {/* Número del dado */}
        {tile.diceNumber && (
          <>
            <circle
              cx={width / 2}
              cy={height / 2 + 10}
              r="22"
              fill="white"
              stroke="#333"
              strokeWidth="2"
            />
            <text
              x={width / 2}
              y={height / 2 + 10}
              textAnchor="middle"
              dominantBaseline="central"
              className="font-bold text-2xl"
              fill={tile.diceNumber === 6 || tile.diceNumber === 8 ? '#ef4444' : '#1f2937'}
            >
              {tile.diceNumber}
            </text>
          </>
        )}

        {/* Imagen de Agujero Negro - se muestra encima del número */}
        {tile.hasBlackHole && (
          <image
            href={agujeronNegroImg}
            x={width / 2 - 20}
            y={height / 2 - 35}
            width="40"
            height="40"
            style={{ filter: 'drop-shadow(0 0 8px rgba(168, 85, 247, 0.8))' }}
          />
        )}
      </svg>
    </div>
  );
};
