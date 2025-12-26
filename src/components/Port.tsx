import React from 'react';
import type { Port as PortType } from '../types/game';
import { RESOURCE_COLORS } from '../utils/constants';

// Importar las imágenes de recursos
import materiaOscuraImg from '../assets/materia-oscura.jpg';
import gasImg from '../assets/gas.jpg';
import polvoCosmicoImg from '../assets/polvo-cosmico.jpg';
import energiaImg from '../assets/energia.jpg';
import estrellasImg from '../assets/estrellas.jpg';

interface PortProps {
  port: PortType;
}

// Mapeo de recursos a imágenes
const RESOURCE_IMAGES: Record<string, string> = {
  'dark-matter': materiaOscuraImg,
  'gas': gasImg,
  'dust': polvoCosmicoImg,
  'energy': energiaImg,
  'stars': estrellasImg,
};

export const Port: React.FC<PortProps> = ({ port }) => {
  const color = port.type === 'specialized' && port.resource 
    ? RESOURCE_COLORS[port.resource] 
    : '#4A5568';
    
  const backgroundImage = port.type === 'specialized' && port.resource
    ? RESOURCE_IMAGES[port.resource]
    : undefined;
    
  return (
    <div
      className="absolute flex items-center justify-center"
      style={{
        left: port.position.x,
        top: port.position.y,
        transform: `translate(-50%, -50%) rotate(${port.rotation}deg)`,
        width: '50px', // Altura del triángulo (hacia afuera)
        height: '70px', // Base del triángulo (ancho de la arista)
        pointerEvents: 'none',
        zIndex: 4, // Menor que vértices (10) y aristas (5)
        filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.5))', // Sombra para el triángulo
      }}
    >
      {/* Triángulo del puerto */}
      <div 
        className="relative w-full h-full flex items-center justify-center overflow-hidden"
        style={{ 
          backgroundColor: color,
          backgroundImage: backgroundImage ? `url(${backgroundImage})` : undefined,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          // Triángulo apuntando hacia la izquierda (hacia afuera)
          // Base a la derecha (100%), Punta a la izquierda (0%)
          // Usamos 0% y 100% en Y para que la base ocupe toda la altura y toque los vértices
          clipPath: 'polygon(100% 0%, 100% 100%, 0 50%)', 
        }}
      >
        
        {port.type === 'generic' ? (
          <div 
            className="flex flex-col items-center justify-center leading-none relative z-10"
            style={{ transform: `rotate(${-port.rotation}deg)`, marginLeft: '15px' }}
          >
            <span className="text-[10px] font-bold text-white drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)]">?</span>
            <span className="text-[10px] font-bold text-white drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)]">3:1</span>
          </div>
        ) : (
          <div 
            className="flex flex-col items-center justify-center leading-none relative z-10"
            style={{ transform: `rotate(${-port.rotation}deg)`, marginLeft: '15px' }}
          >
            <span className="text-[10px] font-bold text-white drop-shadow-[0_2px_2px_rgba(0,0,0,1)] filter">2:1</span>
          </div>
        )}
      </div>
    </div>
  );
};
