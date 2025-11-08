import { useState } from 'react';
import { useGameStore } from '../state/gameStore';
import type { ResourceType } from '../types/game';

export function InventionSelector() {
  const selectingInventionResources = useGameStore((state) => state.selectingInventionResources);
  const confirmInventionResources = useGameStore((state) => state.confirmInventionResources);
  const cancelInventionSelection = useGameStore((state) => state.cancelInventionSelection);

  const [selectedResources, setSelectedResources] = useState<ResourceType[]>([]);

  if (!selectingInventionResources) {
    return null;
  }

  const resources: { type: ResourceType; name: string; icon: string; color: string }[] = [
    { type: 'dark-matter', name: 'Materia Oscura', icon: '🌑', color: 'bg-purple-600 hover:bg-purple-500' },
    { type: 'gas', name: 'Gas', icon: '💨', color: 'bg-blue-600 hover:bg-blue-500' },
    { type: 'dust', name: 'Polvo Cósmico', icon: '✨', color: 'bg-yellow-600 hover:bg-yellow-500' },
    { type: 'energy', name: 'Energía', icon: '⚡', color: 'bg-red-600 hover:bg-red-500' },
    { type: 'stars', name: 'Estrellas', icon: '⭐', color: 'bg-orange-600 hover:bg-orange-500' },
  ];

  const toggleResource = (resourceType: ResourceType) => {
    if (selectedResources.includes(resourceType)) {
      setSelectedResources(selectedResources.filter(r => r !== resourceType));
    } else if (selectedResources.length < 2) {
      setSelectedResources([...selectedResources, resourceType]);
    }
  };

  const handleConfirm = () => {
    if (selectedResources.length === 2) {
      confirmInventionResources(selectedResources[0], selectedResources[1]);
      setSelectedResources([]);
    }
  };

  const handleCancel = () => {
    cancelInventionSelection();
    setSelectedResources([]);
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div className="bg-gradient-to-br from-blue-900 to-purple-900 p-8 rounded-lg shadow-2xl max-w-2xl border-4 border-blue-400">
        <h2 className="text-white font-bold text-2xl mb-2 text-center">
          🔬 Invención Galáctica
        </h2>
        <p className="text-blue-200 text-center mb-6 text-sm">
          Selecciona 2 recursos gratis del banco ({selectedResources.length}/2)
        </p>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
          {resources.map((resource) => {
            const isSelected = selectedResources.includes(resource.type);
            const count = selectedResources.filter(r => r === resource.type).length;
            
            return (
              <button
                key={resource.type}
                onClick={() => toggleResource(resource.type)}
                className={`${resource.color} text-white p-6 rounded-lg font-semibold transition-all transform hover:scale-105 shadow-lg relative ${
                  isSelected ? 'ring-4 ring-yellow-400' : ''
                }`}
              >
                <div className="text-5xl mb-2">{resource.icon}</div>
                <div className="text-lg">{resource.name}</div>
                {count > 0 && (
                  <div className="absolute top-2 right-2 bg-yellow-400 text-black w-8 h-8 rounded-full flex items-center justify-center font-bold text-lg">
                    {count}
                  </div>
                )}
              </button>
            );
          })}
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleCancel}
            className="flex-1 px-4 py-3 bg-gray-600 hover:bg-gray-500 text-white rounded-lg font-semibold transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleConfirm}
            disabled={selectedResources.length !== 2}
            className={`flex-1 px-4 py-3 rounded-lg font-semibold transition-all ${
              selectedResources.length === 2
                ? 'bg-green-600 hover:bg-green-500 text-white'
                : 'bg-gray-700 text-gray-400 cursor-not-allowed'
            }`}
          >
            Confirmar
          </button>
        </div>
      </div>
    </div>
  );
}
