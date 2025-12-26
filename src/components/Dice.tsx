import React, { useState, useRef } from 'react';
import { Dice1, Dice2, Dice3, Dice4, Dice5, Dice6, Sparkles } from 'lucide-react';
import diceSound from '../assets/dice.mp3';

interface DiceProps {
  onRoll: () => void;
  values: [number, number];
  disabled?: boolean;
}

const DiceIcon = ({ value }: { value: number }) => {
  const icons = [Dice1, Dice2, Dice3, Dice4, Dice5, Dice6];
  const Icon = icons[value - 1] || Dice1;
  return <Icon className="w-12 h-12" />;
};

/**
 * Componente para simular tiradas de dados
 */
export const Dice: React.FC<DiceProps> = ({ onRoll, values, disabled }) => {
  const [rolling, setRolling] = useState(false);
  const handleRoll = () => {
    if (disabled || rolling) return;

    // Reproducir sonido de dados
    try {
      const audio = new Audio(diceSound);
      audio.play().catch(err => console.log('Error al reproducir sonido:', err));
    } catch (error) {
      console.error('Error al inicializar audio:', error);
    }

    setRolling(true);
    setTimeout(() => {
      onRoll();
      setRolling(false);
    }, 500);
  };

  const total = values[0] + values[1];

  return (
    <div className="flex flex-col items-center gap-4 p-6 bg-gradient-to-br from-purple-900/50 to-blue-900/50 rounded-xl border-2 border-purple-500/30">
      
      <h3 className="text-lg font-bold text-purple-300 flex items-center gap-2">
        <Sparkles className="w-5 h-5" />
        Dados Cósmicos
      </h3>

      <div className="flex gap-4">
        <div
          className={`
            bg-white text-purple-900 p-4 rounded-lg shadow-lg
            ${rolling ? 'animate-roll' : ''}
          `}
        >
          <DiceIcon value={values[0] || 1} />
        </div>
        <div
          className={`
            bg-white text-purple-900 p-4 rounded-lg shadow-lg
            ${rolling ? 'animate-roll' : ''}
          `}
        >
          <DiceIcon value={values[1] || 1} />
        </div>
      </div>

      {total > 0 && (
        <div className="text-center">
          <p className="text-3xl font-bold text-yellow-400">{total}</p>
          <p className="text-sm text-gray-300">Total</p>
        </div>
      )}

      <button
        onClick={handleRoll}
        disabled={disabled || rolling}
        className={`
          px-6 py-3 rounded-lg font-bold text-white
          transition-all duration-200
          ${
            disabled || rolling
              ? 'bg-gray-600 cursor-not-allowed opacity-50'
              : 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 hover:scale-105 shadow-lg'
          }
        `}
      >
        {rolling ? 'Lanzando...' : 'Lanzar Dados'}
      </button>
    </div>
  );
};
