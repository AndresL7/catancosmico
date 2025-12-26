import { useEffect, useState } from 'react';
import { useGameStore } from './state/gameStore';
import { Board } from './components/Board';
import { Dice } from './components/Dice';
import { PlayerPanel } from './components/PlayerPanel';
import { BuildMenu } from './components/BuildMenu';
import { TradePanel } from './components/TradePanel';
import { VictoryPanel } from './components/VictoryPanel';
import { DiscoveryCardDisplay } from './components/DiscoveryCardDisplay';
import { BlackHoleMover } from './components/BlackHoleMover';
import { MonopolySelector } from './components/MonopolySelector';
import { InventionSelector } from './components/InventionSelector';
import { Tutorial } from './components/Tutorial';
import { Rocket, RotateCcw, Trophy, ArrowRight, Users } from 'lucide-react';
import sparkleSound from './assets/sparkle.mp3';

function App() {
  const {
    players,
    currentPlayerIndex,
    diceValues,
    phase,
    turn,
    winner,
    victoryPointsToWin,
    rollDiceAction,
    endTurn,
    newGame,
    loadGame,
    upgradingToCluster,
    cancelClusterUpgrade,
    placingGalaxy,
    placingFilament,
    cancelPlacingGalaxy,
    cancelPlacingFilament,
  } = useGameStore();

  const [showStartScreen, setShowStartScreen] = useState(true);
  const [selectedPlayers, setSelectedPlayers] = useState(4);
  const [selectedVictoryPoints, setSelectedVictoryPoints] = useState(10);

  // Cargar juego guardado al iniciar
  useEffect(() => {
    const savedGame = localStorage.getItem('catanCosmico');
    if (savedGame) {
      try {
        const parsed = JSON.parse(savedGame);
        // Solo ocultar la pantalla de inicio si el juego guardado es válido
        if (parsed && parsed.players && parsed.board) {
          loadGame();
          setShowStartScreen(false);
        }
      } catch (error) {
        console.error('Error al cargar juego:', error);
        // Si hay error, mostrar pantalla de inicio
        setShowStartScreen(true);
      }
    }
  }, [loadGame]);

  const startGame = () => {
    // Reproducir sonido de inicio
    const audio = new Audio(sparkleSound);
    audio.play().catch(err => console.log('Error al reproducir sonido:', err));
    
    newGame(selectedPlayers, selectedVictoryPoints);
    setShowStartScreen(false);
  };

  const resetToStartScreen = () => {
    setShowStartScreen(true);
  };

  const currentPlayer = players && players[currentPlayerIndex] ? players[currentPlayerIndex] : null;
  const hasRolled = diceValues[0] > 0 && diceValues[1] > 0;

  // Pantalla inicial de selección de jugadores
  if (showStartScreen) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-gradient-to-br from-purple-900/50 to-blue-900/50 p-8 rounded-2xl border-2 border-purple-500/30">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Rocket className="w-12 h-12 text-purple-400" />
              <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 via-pink-500 to-blue-500 bg-clip-text text-transparent">
                Catán Cósmico
              </h1>
            </div>
            <p className="text-gray-400">Conquista el universo</p>
            <p className="text-gray-500 text-xs mt-1">by Andrés López Echeverri</p>
          </div>

          <div className="mb-6">
            <label className="flex items-center gap-2 text-lg font-bold text-purple-300 mb-3">
              <Users className="w-5 h-5" />
              Número de Jugadores
            </label>
            <div className="grid grid-cols-2 gap-3">
              {[3, 4].map((num) => (
                <button
                  key={num}
                  onClick={() => setSelectedPlayers(num)}
                  className={`
                    p-4 rounded-lg border-2 font-bold text-lg transition-all
                    ${
                      selectedPlayers === num
                        ? 'border-purple-500 bg-purple-600/50 scale-105'
                        : 'border-gray-600 bg-gray-800/30 hover:border-purple-400'
                    }
                  `}
                >
                  {num} Jugadores
                </button>
              ))}
            </div>
          </div>

          <div className="mb-6">
            <label className="flex items-center gap-2 text-lg font-bold text-yellow-300 mb-3">
              <Trophy className="w-5 h-5" />
              Puntos para Ganar
            </label>
            <div className="grid grid-cols-3 gap-3">
              {[8, 10, 12].map((points) => (
                <button
                  key={points}
                  onClick={() => setSelectedVictoryPoints(points)}
                  className={`
                    p-4 rounded-lg border-2 font-bold text-lg transition-all
                    ${
                      selectedVictoryPoints === points
                        ? 'border-yellow-500 bg-yellow-600/50 scale-105'
                        : 'border-gray-600 bg-gray-800/30 hover:border-yellow-400'
                    }
                  `}
                >
                  {points}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={startGame}
            className="w-full px-6 py-4 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg font-bold text-lg hover:scale-105 transition-all flex items-center justify-center gap-2"
          >
            <Rocket className="w-5 h-5" />
            Comenzar Juego
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full p-4 md:p-8">
      {/* Header */}
      <header className="mb-8 text-center">
        <div className="flex items-center justify-center gap-3 mb-2">
          <Rocket className="w-10 h-10 text-purple-400" />
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-400 via-pink-500 to-blue-500 bg-clip-text text-transparent">
            Catán Cósmico
          </h1>
          <Rocket className="w-10 h-10 text-blue-400 transform scale-x-[-1]" />
        </div>
        <p className="text-gray-400 text-sm">
          Conquista el universo · Turno {turn} · Meta: {victoryPointsToWin} puntos
        </p>
      </header>

      {/* Pantalla de Victoria */}
      {winner && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 animate-build">
          <div className="bg-gradient-to-br from-yellow-900 to-purple-900 p-8 rounded-2xl border-4 border-yellow-400 max-w-md">
            <div className="text-center">
              <Trophy className="w-20 h-20 mx-auto mb-4 text-yellow-400 animate-pulse" />
              <h2 className="text-3xl font-bold mb-2 text-yellow-300">
                ¡Victoria Cósmica!
              </h2>
              <p className="text-xl mb-6">
                {players.find((p) => p.id === winner)?.name} ha conquistado el universo
              </p>
              <button
                onClick={resetToStartScreen}
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg font-bold hover:scale-105 transition-all"
              >
                Nueva Partida
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Columna Izquierda: Paneles de Jugadores */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-black/30 p-4 rounded-xl border border-gray-700">
            <h2 className="text-lg font-bold mb-3 text-purple-300">Jugadores</h2>
            <div className="space-y-3">
              {players.map((player, index) => (
                <PlayerPanel
                  key={player.id}
                  player={player}
                  isCurrentPlayer={index === currentPlayerIndex}
                />
              ))}
            </div>
          </div>

          {/* Botón Nuevo Juego */}
          <button
            onClick={resetToStartScreen}
            className="w-full px-4 py-3 bg-red-900/50 hover:bg-red-800/70 border-2 border-red-700 rounded-lg font-bold transition-all flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-5 h-5" />
            Nueva Partida
          </button>
        </div>

        {/* Columna Central: Tablero */}
        <div className="lg:col-span-2 space-y-6">
          <Board />

          {/* Fila de Dados y Acciones */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Dados */}
            <Dice
              onRoll={rollDiceAction}
              values={diceValues}
              disabled={phase !== 'playing' || hasRolled}
            />

            {/* Info del Turno */}
            <div className="flex flex-col justify-center gap-4 p-6 bg-gradient-to-br from-gray-900/50 to-gray-800/50 rounded-xl border-2 border-gray-700">
              {currentPlayer && (
                <div>
                  <h3 className="text-sm text-gray-400 mb-1">Turno de:</h3>
                  <div className="flex items-center gap-2">
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: currentPlayer.color }}
                    />
                    <span className="text-xl font-bold">{currentPlayer.name}</span>
                  </div>
                </div>
              )}

              <div>
                <h3 className="text-sm text-gray-400 mb-1">Fase:</h3>
                <span className="text-lg font-semibold text-purple-300">
                  {phase === 'playing' && !hasRolled && '🎲 Lanza los dados'}
                  {phase === 'building' && '🏗️ Construye o comercia'}
                  {phase === 'ended' && '🏆 Partida terminada'}
                </span>
              </div>

              <button
                onClick={endTurn}
                disabled={!hasRolled || phase === 'ended'}
                className={`
                  px-4 py-3 rounded-lg font-bold flex items-center justify-center gap-2
                  transition-all duration-200
                  ${
                    hasRolled && phase !== 'ended'
                      ? 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 hover:scale-105'
                      : 'bg-gray-700 cursor-not-allowed opacity-50'
                  }
                `}
              >
                Terminar Turno
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Menú de Construcción */}
          {hasRolled && phase === 'building' && <BuildMenu />}
          
          {/* Panel de Comercio */}
          {hasRolled && phase === 'building' && <TradePanel />}

          {/* Panel de Victoria */}
          <VictoryPanel />
        </div>
      </div>

      {/* Cartas de Descubrimiento */}
      <DiscoveryCardDisplay />

      {/* Modal para mover Agujero Negro */}
      <BlackHoleMover />

      {/* Modal para Monopolio Cósmico */}
      <MonopolySelector />

      {/* Modal para Invención Galáctica */}
      <InventionSelector />

      {/* Tutorial inicial */}
      <Tutorial />

      {/* Indicador de modo colocación de galaxia */}
      {placingGalaxy && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-40">
          <div className="bg-gradient-to-br from-purple-900 to-blue-900 p-6 rounded-lg shadow-2xl border-4 border-purple-400 animate-pulse">
            <h2 className="text-white font-bold text-xl mb-2 text-center">
              ⭐ Colocar Galaxia
            </h2>
            <p className="text-purple-200 text-center mb-4 text-sm">
              Haz clic en un vértice (intersección) del tablero para construir tu galaxia.<br/>
              Producirá 1 recurso por turno.
            </p>
            <button
              onClick={cancelPlacingGalaxy}
              className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-colors"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Indicador de modo colocación de filamento */}
      {placingFilament && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-40">
          <div className="bg-gradient-to-br from-blue-900 to-cyan-900 p-6 rounded-lg shadow-2xl border-4 border-blue-400 animate-pulse">
            <h2 className="text-white font-bold text-xl mb-2 text-center">
              🌟 Colocar Filamento
            </h2>
            <p className="text-blue-200 text-center mb-4 text-sm">
              Haz clic en una arista (línea entre hexágonos) del tablero para construir tu filamento.<br/>
              Conecta tus galaxias para expandir tu imperio cósmico.
            </p>
            <button
              onClick={cancelPlacingFilament}
              className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-colors"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Indicador de modo upgrade a cúmulo */}
      {upgradingToCluster && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-40">
          <div className="bg-gradient-to-br from-yellow-900 to-orange-900 p-6 rounded-lg shadow-2xl border-4 border-yellow-400 animate-pulse">
            <h2 className="text-white font-bold text-xl mb-2 text-center">
              ✨ Mejorar a Cúmulo
            </h2>
            <p className="text-yellow-200 text-center mb-4 text-sm">
              Haz clic en una de tus galaxias (círculos) para mejorarla.<br/>
              El cúmulo producirá el doble de recursos.
            </p>
            <button
              onClick={cancelClusterUpgrade}
              className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-colors"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="mt-12 text-center text-gray-500 text-sm">
        <p>🌌 Catán Cósmico v1.0 · Inspirado en Catan · Creado con React + TypeScript + Zustand</p>
      </footer>
    </div>
  );
}

export default App;
