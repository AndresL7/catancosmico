import React from 'react';
import { useGameStore } from '../state/gameStore';
import { BUILD_COSTS, RESOURCE_NAMES } from '../utils/constants';
import { canBuild } from '../utils/gameLogic';
import { Building2, Zap, Circle, Minus } from 'lucide-react';
import type { BuildingType } from '../types/game';

/**
 * Menú de construcción para edificios y cartas
 */
export const BuildMenu: React.FC = () => {
  const { players, currentPlayerIndex, build, buyDiscoveryCard, discoveryDeck } = useGameStore();
  const currentPlayer = players[currentPlayerIndex];

  const buildings: Array<{
    type: BuildingType;
    name: string;
    icon: typeof Building2;
    description: string;
  }> = [
    {
      type: 'galaxy',
      name: 'Galaxia',
      icon: Circle,
      description: 'Colonia estelar (1 punto)',
    },
    {
      type: 'filament',
      name: 'Filamento',
      icon: Minus,
      description: 'Conexión cósmica',
    },
    {
      type: 'cluster',
      name: 'Cúmulo',
      icon: Building2,
      description: 'Ciudad estelar (2 puntos)',
    },
  ];

  return (
    <div className="p-6 bg-gradient-to-br from-gray-900/80 to-gray-800/80 rounded-xl border-2 border-gray-700">
      <h3 className="text-xl font-bold mb-4 text-center text-purple-300">
        Menú de Construcción
      </h3>

      <div className="grid grid-cols-1 gap-3">
        {buildings.map((building) => {
          const canBuildThis = canBuild(currentPlayer, building.type);
          const cost = BUILD_COSTS[building.type];
          const Icon = building.icon;

          return (
            <button
              key={building.type}
              onClick={() => build(building.type)}
              disabled={!canBuildThis}
              className={`
                p-4 rounded-lg border-2 transition-all duration-200
                ${
                  canBuildThis
                    ? 'border-purple-500 bg-purple-900/30 hover:bg-purple-800/50 hover:scale-105 cursor-pointer'
                    : 'border-gray-700 bg-gray-800/30 opacity-50 cursor-not-allowed'
                }
              `}
            >
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg ${canBuildThis ? 'bg-purple-600' : 'bg-gray-700'}`}>
                  <Icon className="w-6 h-6" />
                </div>

                <div className="flex-1 text-left">
                  <h4 className="font-bold text-sm mb-1">{building.name}</h4>
                  <p className="text-xs text-gray-400 mb-2">{building.description}</p>

                  {/* Costo */}
                  <div className="flex flex-wrap gap-1">
                    {Object.entries(cost).map(([resource, amount]) => (
                      <span
                        key={resource}
                        className={`
                          text-[10px] px-2 py-1 rounded-full
                          ${canBuildThis ? 'bg-blue-900/50 text-blue-300' : 'bg-gray-700/50 text-gray-400'}
                        `}
                      >
                        {amount} {RESOURCE_NAMES[resource as keyof typeof RESOURCE_NAMES]}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </button>
          );
        })}

        {/* Botón especial para Carta de Descubrimiento */}
        <button
          onClick={buyDiscoveryCard}
          disabled={!canBuild(currentPlayer, 'discovery') || discoveryDeck.length === 0}
          className={`
            p-4 rounded-lg border-2 transition-all duration-200
            ${
              canBuild(currentPlayer, 'discovery') && discoveryDeck.length > 0
                ? 'border-yellow-500 bg-yellow-900/30 hover:bg-yellow-800/50 hover:scale-105 cursor-pointer'
                : 'border-gray-700 bg-gray-800/30 opacity-50 cursor-not-allowed'
            }
          `}
        >
          <div className="flex items-start gap-3">
            <div className={`p-2 rounded-lg ${canBuild(currentPlayer, 'discovery') && discoveryDeck.length > 0 ? 'bg-yellow-600' : 'bg-gray-700'}`}>
              <Zap className="w-6 h-6" />
            </div>

            <div className="flex-1 text-left">
              <h4 className="font-bold text-sm mb-1">Carta de Descubrimiento</h4>
              <p className="text-xs text-gray-400 mb-2">
                Cartas cosmológicas ({discoveryDeck.length} restantes)
              </p>

              {/* Costo */}
              <div className="flex flex-wrap gap-1">
                {Object.entries(BUILD_COSTS['discovery']).map(([resource, amount]) => (
                  <span
                    key={resource}
                    className={`
                      text-[10px] px-2 py-1 rounded-full
                      ${canBuild(currentPlayer, 'discovery') && discoveryDeck.length > 0 ? 'bg-blue-900/50 text-blue-300' : 'bg-gray-700/50 text-gray-400'}
                    `}
                  >
                    {amount} {RESOURCE_NAMES[resource as keyof typeof RESOURCE_NAMES]}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </button>
      </div>
    </div>
  );
};
