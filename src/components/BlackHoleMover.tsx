import { useGameStore } from '../state/gameStore';

export function BlackHoleMover() {
  const movingBlackHole = useGameStore((state) => state.movingBlackHole);
  const selectingVictim = useGameStore((state) => state.selectingVictim);
  const players = useGameStore((state) => state.players);
  const selectVictimToSteal = useGameStore((state) => state.selectVictimToSteal);
  const cancelBlackHoleMove = useGameStore((state) => state.cancelBlackHoleMove);

  if (!movingBlackHole && !selectingVictim) {
    return null;
  }

  // Modo: Seleccionar víctima para robar
  if (selectingVictim) {
    return (
      <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
        <div className="bg-gray-800 p-6 rounded-lg shadow-2xl max-w-md">
          <h2 className="text-white font-bold text-xl mb-4">
            Selecciona un jugador para robar
          </h2>
          <p className="text-gray-300 mb-6">
            Hay {selectingVictim.adjacentPlayerIds.length} jugador(es) adyacente(s) al Agujero Negro.
            Elige uno para robarle un recurso aleatorio.
          </p>

          <div className="space-y-3">
            {selectingVictim.adjacentPlayerIds.map((playerId) => {
              const player = players.find((p) => p.id === playerId);
              if (!player) return null;

              const totalResources = Object.values(player.resources).reduce(
                (sum, amount) => sum + amount,
                0
              );

              return (
                <button
                  key={playerId}
                  onClick={() => selectVictimToSteal(playerId)}
                  className="w-full p-3 rounded border-2 transition-colors hover:bg-gray-700"
                  style={{
                    borderColor: player.color,
                    backgroundColor: `${player.color}20`,
                  }}
                  disabled={totalResources === 0}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: player.color }}
                      />
                      <span className="text-white font-semibold">{player.name}</span>
                    </div>
                    <span className="text-gray-300 text-sm">
                      {totalResources} recurso{totalResources !== 1 ? 's' : ''}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          <button
            onClick={cancelBlackHoleMove}
            className="w-full mt-4 px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded font-semibold transition-colors"
          >
            Cancelar
          </button>
        </div>
      </div>
    );
  }

  // Modo: Seleccionar hexágono para mover el agujero negro
  return (
    <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-40">
      <div className="bg-gradient-to-br from-purple-900 to-blue-900 p-6 rounded-lg shadow-2xl border-2 border-yellow-400 animate-pulse">
        <h2 className="text-white font-bold text-xl mb-2 text-center">
          🌌 Mover el Agujero Negro
        </h2>
        <p className="text-yellow-200 text-center mb-4 text-sm">
          Haz clic en cualquier hexágono del tablero
        </p>

        <button
          onClick={cancelBlackHoleMove}
          className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-colors"
        >
          Cancelar
        </button>
      </div>
    </div>
  );
}
