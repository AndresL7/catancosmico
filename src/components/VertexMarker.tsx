import React from 'react';
import type { Vertex } from '../types/game';
import { Hexagon, Circle } from 'lucide-react';

interface VertexMarkerProps {
  vertex: Vertex;
  playerColor?: string;
  isClickable: boolean;
  onClick: () => void;
}

/**
 * Componente que muestra un vértice del tablero donde se pueden colocar galaxias
 */
export const VertexMarker: React.FC<VertexMarkerProps> = ({
  vertex,
  playerColor,
  isClickable,
  onClick,
}) => {
  if (vertex.occupied) {
    // Mostrar la galaxia o cúmulo construido
    const size = vertex.buildingType === 'cluster' ? 20 : 14;
    const Icon = vertex.buildingType === 'cluster' ? Hexagon : Circle;
    
    return (
      <div
        className="rounded-full shadow-lg animate-build"
        style={{
          backgroundColor: playerColor,
          padding: '4px',
        }}
      >
        <Icon
          size={size}
          className="text-white"
          fill="white"
          strokeWidth={2}
        />
      </div>
    );
  }

  if (!isClickable) return null;

  // Mostrar punto interactivo para colocar galaxia
  return (
    <div
      className="cursor-pointer group"
      onClick={onClick}
    >
      <div className="w-4 h-4 bg-yellow-400/50 rounded-full border-2 border-yellow-300 group-hover:bg-yellow-300 group-hover:scale-150 transition-all duration-200 shadow-lg" />
    </div>
  );
};
