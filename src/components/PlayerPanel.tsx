import React from 'react';
import type { Player } from '../types/game';
import { RESOURCE_NAMES } from '../utils/constants';
import { Star, Trophy, Users } from 'lucide-react';
import darkMatterImg from '../assets/materia-oscura.jpg';
import gasImg from '../assets/gas.jpg';
import dustImg from '../assets/polvo-cosmico.jpg';
import energyImg from '../assets/energia.jpg';
import starsImg from '../assets/estrellas.jpg';

const RESOURCE_IMAGES: Record<string, string> = {
  'dark-matter': darkMatterImg,
  'gas': gasImg,
  'dust': dustImg,
  'energy': energyImg,
  'stars': starsImg,
};

interface PlayerPanelProps {
  player: Player;
  isCurrentPlayer: boolean;
}

/**
 * Panel que muestra los recursos, puntos y construcciones de un jugador
 */
export const PlayerPanel: React.FC<PlayerPanelProps> = ({ player, isCurrentPlayer }) => {
  return (
    <div
      className={`
        p-4 rounded-xl border-2 transition-all duration-300
        ${
          isCurrentPlayer
            ? 'border-yellow-400 bg-gradient-to-br from-yellow-900/30 to-orange-900/30 scale-105 shadow-lg shadow-yellow-500/20'
            : 'border-gray-600 bg-gradient-to-br from-gray-900/50 to-gray-800/50'
        }
      `}
      style={{ borderColor: isCurrentPlayer ? player.color : undefined }}
    >
      {/* Encabezado del jugador */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div
            className="w-4 h-4 rounded-full"
            style={{ backgroundColor: player.color }}
          />
          <h3 className="font-bold text-lg">{player.name}</h3>
          {isCurrentPlayer && (
            <span className="text-xs bg-yellow-500 text-black px-2 py-1 rounded-full font-bold">
              TURNO
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          <Trophy className="w-5 h-5 text-yellow-400" />
          <span className="text-2xl font-bold text-yellow-400">
            {player.victoryPoints}
          </span>
        </div>
      </div>

      {/* Recursos */}
      <div className="mb-1">
        <h4 className="text-xs text-gray-400 mb-2 flex items-center gap-1">
          <Star className="w-3 h-3" />
          RECURSOS
        </h4>
        <div className="grid grid-cols-3 gap-2 text-xs">
          {Object.entries(player.resources).map(([key, value]) => (
            <div
              key={key}
              className="relative bg-black/30 p-2 rounded text-center flex flex-col justify-center min-h-[50px] overflow-hidden group"
              title={RESOURCE_NAMES[key as keyof typeof RESOURCE_NAMES]}
            >
              {/* Imagen de fondo */}
              <div 
                className="absolute inset-0 opacity-20 bg-cover bg-center transition-opacity group-hover:opacity-30"
                style={{ backgroundImage: `url(${RESOURCE_IMAGES[key]})` }}
              />
              
              {/* Contenido */}
              <div className="relative z-10">
                <div className="font-bold text-white text-sm drop-shadow-md">{value}</div>
                <div className="text-[11px] text-gray-200 leading-tight drop-shadow-md font-medium">
                  {RESOURCE_NAMES[key as keyof typeof RESOURCE_NAMES]}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
