import { useGameStore } from '../state/gameStore';
import type { ResourceType } from '../types/game';

export function MonopolySelector() {
  const selectingMonopolyResource = useGameStore((state) => state.selectingMonopolyResource);
  const playMonopolyCard = useGameStore((state) => state.playMonopolyCard);
  const cancelMonopolySelection = useGameStore((state) => state.cancelMonopolySelection);

  if (!selectingMonopolyResource) {
    return null;
  }

  const resources: { type: ResourceType; name: string; icon: string; color: string }[] = [
    { type: 'dark-matter', name: 'Materia Oscura', icon: '🌑', color: 'bg-purple-600 hover:bg-purple-500' },
    { type: 'gas', name: 'Gas', icon: '💨', color: 'bg-blue-600 hover:bg-blue-500' },
    { type: 'dust', name: 'Polvo Cósmico', icon: '✨', color: 'bg-yellow-600 hover:bg-yellow-500' },
    { type: 'energy', name: 'Energía', icon: '⚡', color: 'bg-red-600 hover:bg-red-500' },
    { type: 'stars', name: 'Estrellas', icon: '⭐', color: 'bg-orange-600 hover:bg-orange-500' },
  ];

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div className="bg-gradient-to-br from-purple-900 to-blue-900 p-8 rounded-lg shadow-2xl max-w-2xl border-4 border-yellow-400">
        <h2 className="text-white font-bold text-2xl mb-2 text-center">
          🌌 Monopolio Cósmico
        </h2>
        <p className="text-yellow-200 text-center mb-6 text-sm">
          Selecciona un tipo de recurso para robar TODOS de ese tipo a tus oponentes
        </p>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
          {resources.map((resource) => (
            <button
              key={resource.type}
              onClick={() => playMonopolyCard(resource.type)}
              className={`${resource.color} text-white p-6 rounded-lg font-semibold transition-all transform hover:scale-105 shadow-lg`}
            >
              <div className="text-5xl mb-2">{resource.icon}</div>
              <div className="text-lg">{resource.name}</div>
            </button>
          ))}
        </div>

        <button
          onClick={cancelMonopolySelection}
          className="w-full px-4 py-3 bg-gray-600 hover:bg-gray-500 text-white rounded-lg font-semibold transition-colors"
        >
          Cancelar
        </button>
      </div>
    </div>
  );
}
