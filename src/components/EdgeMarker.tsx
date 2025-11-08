import React from 'react';
import type { Edge, Vertex } from '../types/game';

interface EdgeMarkerProps {
  edge: Edge;
  vertices: Vertex[];
  playerColor?: string;
  isClickable: boolean;
  onClick: () => void;
}

/**
 * Componente que muestra una arista del tablero donde se pueden colocar filamentos
 */
export const EdgeMarker: React.FC<EdgeMarkerProps> = ({
  edge,
  vertices,
  playerColor,
  isClickable,
  onClick,
}) => {
  // Calcular el ángulo de rotación basándose en los vértices que conecta
  const calculateRotation = (): number => {
    const vertex1 = vertices.find(v => v.id === edge.vertexIds[0]);
    const vertex2 = vertices.find(v => v.id === edge.vertexIds[1]);
    
    if (!vertex1 || !vertex2) {
      return 60; // Ángulo por defecto
    }
    
    // Calcular el ángulo entre los dos vértices
    const dx = vertex2.position.x - vertex1.position.x;
    const dy = vertex2.position.y - vertex1.position.y;
    const angleRad = Math.atan2(dy, dx);
    const angleDeg = (angleRad * 180 / Math.PI) + 90; // +90 para rotar el elemento vertical
    
    return angleDeg;
  };
  
  const rotation = calculateRotation();
  
  if (edge.occupied) {
    // Mostrar el filamento construido
    return (
      <div
        className="w-1 h-12 rounded-full shadow-lg animate-build"
        style={{
          backgroundColor: playerColor,
          transform: `rotate(${rotation}deg)`,
        }}
      />
    );
  }

  if (!isClickable) return null;

  // Mostrar línea interactiva para colocar filamento
  return (
    <div
      className="cursor-pointer group"
      onClick={onClick}
    >
      <div
        className="w-2 h-12 bg-blue-400/70 rounded-full border-2 border-blue-300 group-hover:bg-blue-300 group-hover:w-3 transition-all duration-200 shadow-lg"
        style={{
          transform: `rotate(${rotation}deg)`,
        }}
      />
    </div>
  );
};
