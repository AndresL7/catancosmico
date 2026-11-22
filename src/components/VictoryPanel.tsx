import React from 'react';
import { useGameStore } from '../state/gameStore';
import { Trophy, Map, Shield, Star, Scroll } from 'lucide-react';

export const VictoryPanel: React.FC = () => {
  const { players } = useGameStore();

  // Ordenar jugadores por puntos de victoria (descendente)
  const sortedPlayers = [...players].sort((a, b) => b.victoryPoints - a.victoryPoints);

  return (
    <div className="p-6 bg-gradient-to-br from-indigo-900/80 to-purple-900/80 rounded-xl border-2 border-indigo-500/50 shadow-xl">
      <h3 className="text-xl font-bold mb-6 text-center text-indigo-300 flex items-center justify-center gap-2">
        <Trophy className="w-6 h-6 text-yellow-400" />
        Tabla de Clasificación
      </h3>

      <div className="space-y-4">
        {sortedPlayers.map((player, index) => (
          <div 
            key={player.id}
            className="bg-black/40 rounded-lg p-4 border border-indigo-500/20 hover:border-indigo-500/50 transition-colors"
          >
            {/* Encabezado del Jugador */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div 
                  className="w-3 h-3 rounded-full shadow-[0_0_8px_currentColor]"
                  style={{ backgroundColor: player.color, color: player.color }}
                />
                <span className="font-bold text-lg text-white">{player.name}</span>
                {index === 0 && player.victoryPoints > 0 && (
                  <span className="text-xs bg-yellow-500/20 text-yellow-300 px-2 py-0.5 rounded border border-yellow-500/30">
                    Líder
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold text-white">{player.victoryPoints}</span>
                <span className="text-xs text-gray-400 uppercase tracking-wider">Puntos</span>
              </div>
            </div>

            {/* Desglose de Puntos */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-xs">
              {/* Galaxias */}
              <div className="flex items-center gap-2 bg-white/5 p-2 rounded" title="Cada Galaxia vale 1 punto">
                <Star className="w-4 h-4 text-blue-400" />
                <span className="text-gray-300">
                  {player.buildings.galaxies} Galaxias
                </span>
                <span className="ml-auto font-bold text-blue-400">
                  {player.buildings.galaxies}pts
                </span>
              </div>

              {/* Cúmulos */}
              <div className="flex items-center gap-2 bg-white/5 p-2 rounded" title="Cada Cúmulo vale 2 puntos">
                <Star className="w-4 h-4 text-yellow-400" />
                <span className="text-gray-300">
                  {player.buildings.clusters} Cúmulos
                </span>
                <span className="ml-auto font-bold text-yellow-400">
                  {player.buildings.clusters * 2}pts
                </span>
              </div>

              {/* Cartas de Victoria (Descubrimiento) */}
              <div className="flex items-center gap-2 bg-white/5 p-2 rounded">
                <Scroll className="w-4 h-4 text-green-400" />
                <span className="text-gray-300">
                  {player.discoveryCards.filter(c => c.type === 'descubrimiento').length} Secretas
                </span>
                <span className="ml-auto font-bold text-green-400">
                  {player.discoveryCards.filter(c => c.type === 'descubrimiento').length}pts
                </span>
              </div>

              {/* Cadena Más Larga */}
              <div 
                className={`flex items-center gap-2 p-2 rounded border cursor-help transition-all hover:scale-105 ${
                  player.hasLongestChain 
                    ? 'bg-orange-900/30 border-orange-500/50' 
                    : 'bg-white/5 border-transparent opacity-50'
                }`}
                title="Cadena filamentar más larga: El jugador con la cadena filamentar más larga con más de 4 filamentos consecutivos"
              >
                <Map className={`w-4 h-4 ${player.hasLongestChain ? 'text-orange-400' : 'text-gray-500'}`} />
                <span className={player.hasLongestChain ? 'text-orange-200 font-semibold' : 'text-gray-500'}>
                  Cadena Larga
                </span>
                {player.hasLongestChain && (
                  <span className="ml-auto font-bold text-orange-400">+2</span>
                )}
              </div>

              {/* Dominio Gravitacional */}
              <div 
                className={`flex items-center gap-2 p-2 rounded border cursor-help transition-all hover:scale-105 ${
                  player.hasDominioGravitacional 
                    ? 'bg-red-900/30 border-red-500/50' 
                    : 'bg-white/5 border-transparent opacity-50'
                }`}
                title="Mayor Dominio Gravitacional: El jugador con más pozos gravitacionales usados con más de 2 pozos gravitacionales usados"
              >
                <Shield className={`w-4 h-4 ${player.hasDominioGravitacional ? 'text-red-400' : 'text-gray-500'}`} />
                <span className={player.hasDominioGravitacional ? 'text-red-200 font-semibold' : 'text-gray-500'}>
                  Dominio Grav.
                </span>
                {player.hasDominioGravitacional && (
                  <span className="ml-auto font-bold text-red-400">+2</span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
