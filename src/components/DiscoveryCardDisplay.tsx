import { useGameStore } from '../state/gameStore';
import type { DiscoveryCard } from '../types/game';

export function DiscoveryCardDisplay() {
  const currentPlayerIndex = useGameStore((state) => state.currentPlayerIndex);
  const players = useGameStore((state) => state.players);
  const playDiscoveryCard = useGameStore((state) => state.playDiscoveryCard);
  const phase = useGameStore((state) => state.phase);

  const currentPlayer = players[currentPlayerIndex];

  if (phase !== 'building' || !currentPlayer.discoveryCards.length) {
    return null;
  }

  const handlePlayCard = (card: DiscoveryCard) => {
    if (card.type === 'descubrimiento') {
      // Las cartas de victoria secreta no se pueden jugar
      return;
    }
    playDiscoveryCard(card.id);
  };

  const getCardTypeColor = (type: DiscoveryCard['type']) => {
    switch (type) {
      case 'pozo_gravitacional':
        return 'bg-purple-600';
      case 'progreso':
        return 'bg-blue-600';
      case 'descubrimiento':
        return 'bg-yellow-600';
      default:
        return 'bg-gray-600';
    }
  };

  const getCardTypeName = (type: DiscoveryCard['type']) => {
    switch (type) {
      case 'pozo_gravitacional':
        return 'Pozo Gravitacional';
      case 'progreso':
        return 'Progreso';
      case 'descubrimiento':
        return 'Descubrimiento';
      default:
        return 'Carta';
    }
  };

  return (
    <div className="fixed right-4 top-20 bg-gray-800 p-4 rounded-lg shadow-lg max-w-sm max-h-[70vh] overflow-y-auto">
      <h3 className="text-white font-bold mb-3 text-lg">
        Tus Cartas ({currentPlayer.discoveryCards.length})
      </h3>
      
      {currentPlayer.hasDominioGravitacional && (
        <div className="mb-3 p-2 bg-purple-900 rounded border-2 border-purple-400">
          <p className="text-purple-200 font-bold text-sm">
            ⭐ Dominio Gravitacional (+2 puntos)
          </p>
          <p className="text-purple-300 text-xs">
            Pozos jugados: {currentPlayer.playedPozosGravitacionales}
          </p>
        </div>
      )}

      <div className="space-y-2">
        {currentPlayer.discoveryCards.map((card) => (
          <div
            key={card.id}
            className={`p-3 rounded border-2 ${
              card.type === 'descubrimiento'
                ? 'border-yellow-400 bg-yellow-900/30'
                : 'border-gray-600 bg-gray-700'
            }`}
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className={`px-2 py-0.5 rounded text-xs font-bold ${getCardTypeColor(
                      card.type
                    )}`}
                  >
                    {getCardTypeName(card.type)}
                  </span>
                  {card.victoryPoints && (
                    <span className="text-yellow-400 text-xs font-bold">
                      +{card.victoryPoints} PV
                    </span>
                  )}
                </div>
                <h4 className="text-white font-semibold text-sm">{card.name}</h4>
                <p className="text-gray-300 text-xs mt-1">{card.description}</p>
              </div>
            </div>

            {card.type !== 'descubrimiento' && (
              <button
                onClick={() => handlePlayCard(card)}
                className={`w-full mt-2 px-3 py-1.5 rounded font-semibold text-sm transition-colors ${
                  card.type === 'pozo_gravitacional'
                    ? 'bg-purple-600 hover:bg-purple-700 text-white'
                    : card.type === 'progreso'
                    ? 'bg-blue-600 hover:bg-blue-700 text-white'
                    : 'bg-gray-500 text-gray-300 cursor-not-allowed'
                }`}
              >
                Jugar Carta
              </button>
            )}
            
            {card.type === 'descubrimiento' && (
              <div className="mt-2 text-center text-yellow-400 text-xs italic">
                Carta de victoria secreta
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
