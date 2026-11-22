import { useGameStore } from '../state/gameStore';
import { X } from 'lucide-react';
import darkMatterImg from '../assets/materia-oscura.jpg';
import gasImg from '../assets/gas.jpg';
import dustImg from '../assets/polvo-cosmico.jpg';
import energyImg from '../assets/energia.jpg';
import starsImg from '../assets/estrellas.jpg';
import sparkleSound from '../assets/sparkle.mp3';

export function Tutorial() {
  const { showTutorial, closeTutorial } = useGameStore();

  if (!showTutorial) return null;

  const handleStartGame = () => {
    // Reproducir sonido de inicio
    const audio = new Audio(sparkleSound);
    audio.play().catch(err => console.log('Error al reproducir sonido:', err));
    
    closeTutorial();
  };

  const resources = [
    { name: 'Materia Oscura', image: darkMatterImg, color: '#8B5CF6' },
    { name: 'Gas', image: gasImg, color: '#06B6D4' },
    { name: 'Polvo', image: dustImg, color: '#F59E0B' },
    { name: 'Energía', image: energyImg, color: '#10B981' },
    { name: 'Estrellas', image: starsImg, color: '#FBBF24' },
  ];

  return (
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-purple-900/95 to-blue-900/95 rounded-2xl border-4 border-purple-500 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-purple-800 to-blue-800 p-6 flex items-center justify-between border-b-4 border-purple-500">
          <h2 className="text-3xl font-bold text-white flex items-center gap-3">
            🌌 Bienvenido a Catán Cósmico
          </h2>
          <button
            onClick={closeTutorial}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-8 space-y-8">
          {/* Recursos */}
          <div>
            <h3 className="text-2xl font-bold text-yellow-300 mb-4">
              📦 Recursos del Universo
            </h3>
            <p className="text-gray-300 mb-6">
              Los hexágonos del tablero producen diferentes recursos cuando sale su número:
            </p>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {resources.map((resource) => (
                <div
                  key={resource.name}
                  className="flex flex-col items-center p-4 bg-black/30 rounded-lg border-2 transition-all hover:scale-105"
                  style={{ borderColor: resource.color }}
                >
                  <img
                    src={resource.image}
                    alt={resource.name}
                    className="w-20 h-20 rounded-lg mb-2 object-cover"
                  />
                  <span className="text-sm font-bold text-center" style={{ color: resource.color }}>
                    {resource.name}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Construcción */}
          <div>
            <h3 className="text-2xl font-bold text-green-300 mb-4">
              🏗️ Cómo Construir
            </h3>
            <div className="space-y-4 text-gray-300">
              <div className="bg-blue-900/30 p-4 rounded-lg border-2 border-blue-500">
                <h4 className="font-bold text-blue-300 mb-2">🌟 Filamentos (Carreteras)</h4>
                <p className="mb-2">• Costo: 1 Materia Oscura + 1 Gas</p>
                <p className="text-sm text-blue-200">
                  Haz clic en "Filamento" en el menú de construcción, luego selecciona una arista del tablero.
                </p>
              </div>

              <div className="bg-purple-900/30 p-4 rounded-lg border-2 border-purple-500">
                <h4 className="font-bold text-purple-300 mb-2">⭐ Galaxias (Poblados)</h4>
                <p className="mb-2">• Costo: 1 Materia Oscura + 1 Gas + 1 Polvo + 1 Energía</p>
                <p className="mb-2">• Produce: 1 recurso por turno</p>
                <p className="text-sm text-purple-200">
                  Haz clic en "Galaxia" en el menú de construcción, luego selecciona un vértice del tablero.
                </p>
              </div>

              <div className="bg-orange-900/30 p-4 rounded-lg border-2 border-orange-500">
                <h4 className="font-bold text-orange-300 mb-2">🌌 Cúmulos (Ciudades)</h4>
                <p className="mb-2">• Costo: 2 Materia Oscura + 1 Polvo + 1 Gas + 1 Estrella</p>
                <p className="mb-2">• Produce: 2 recursos por turno (¡el doble!)</p>
                <p className="text-sm text-orange-200">
                  Haz clic en "Cúmulo" en el menú, luego selecciona una de tus galaxias para mejorarla.
                </p>
              </div>

              <div className="bg-yellow-900/30 p-4 rounded-lg border-2 border-yellow-500">
                <h4 className="font-bold text-yellow-300 mb-2">🃏 Cartas de Descubrimiento</h4>
                <p className="mb-2">• Costo: 1 Polvo + 1 Energía + 1 Estrella</p>
                <p className="text-sm text-yellow-200">
                  Obtén cartas especiales con efectos poderosos. ¡Algunas dan puntos de victoria!
                </p>
              </div>
            </div>
          </div>

          {/* Objetivo */}
          <div>
            <h3 className="text-2xl font-bold text-red-300 mb-4">
              🏆 Objetivo del Juego
            </h3>
            <div className="bg-gradient-to-r from-red-900/50 to-pink-900/50 p-6 rounded-lg border-2 border-red-500">
              <p className="text-xl text-center font-bold text-white mb-2">
                ¡Sé el primero en alcanzar {useGameStore.getState().victoryPointsToWin} puntos de victoria!
              </p>
              <p className="text-center text-gray-300">
                Gana puntos construyendo galaxias (1 punto), cúmulos (2 puntos) y con cartas especiales.
              </p>
            </div>
          </div>

          {/* Botón Comenzar */}
          <button
            onClick={handleStartGame}
            className="w-full py-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 rounded-lg font-bold text-xl transition-all hover:scale-105 flex items-center justify-center gap-2"
          >
            🚀 ¡Comenzar a Jugar!
          </button>
        </div>
      </div>
    </div>
  );
}
