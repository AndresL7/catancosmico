import React, { useState } from 'react';
import { useGameStore } from '../state/gameStore';
import type { ResourceType } from '../types/game';
import { RESOURCE_NAMES } from '../utils/constants';
import { ArrowRightLeft, X, Check, Plus } from 'lucide-react';

export const TradePanel: React.FC = () => {
  const { players, currentPlayerIndex, tradeOffers, createTradeOffer, acceptTradeOffer, cancelTradeOffer } = useGameStore();
  const currentPlayer = players[currentPlayerIndex];
  
  const [offering, setOffering] = useState<Partial<Record<ResourceType, number>>>({});
  const [requesting, setRequesting] = useState<Partial<Record<ResourceType, number>>>({});
  const [showCreateTrade, setShowCreateTrade] = useState(false);
  
  const resourceTypes: ResourceType[] = ['dark-matter', 'gas', 'dust', 'energy', 'stars'];
  
  const updateOffering = (resource: ResourceType, value: number) => {
    setOffering(prev => ({
      ...prev,
      [resource]: value > 0 ? value : undefined
    }));
  };
  
  const updateRequesting = (resource: ResourceType, value: number) => {
    setRequesting(prev => ({
      ...prev,
      [resource]: value > 0 ? value : undefined
    }));
  };
  
  const handleCreateOffer = () => {
    // Verificar que haya algo que ofrecer y algo que solicitar
    const hasOffering = Object.values(offering).some(v => v && v > 0);
    const hasRequesting = Object.values(requesting).some(v => v && v > 0);
    
    if (!hasOffering || !hasRequesting) {
      alert('Debes especificar qué ofreces y qué solicitas');
      return;
    }
    
    createTradeOffer(offering, requesting);
    setOffering({});
    setRequesting({});
    setShowCreateTrade(false);
  };
  
  const canAcceptOffer = (offerId: string) => {
    const offer = tradeOffers.find(o => o.id === offerId);
    if (!offer || offer.fromPlayerId === currentPlayer.id) return false;
    
    // Verificar que tengamos los recursos solicitados
    for (const [resource, amount] of Object.entries(offer.requesting)) {
      if ((currentPlayer.resources[resource as ResourceType] || 0) < (amount || 0)) {
        return false;
      }
    }
    return true;
  };
  
  return (
    <div className="p-6 bg-gradient-to-br from-purple-900/40 to-blue-900/40 rounded-xl border-2 border-purple-500/30">
      <h3 className="text-xl font-bold mb-4 text-center text-purple-300 flex items-center justify-center gap-2">
        <ArrowRightLeft className="w-6 h-6" />
        Comercio Interestelar
      </h3>
      
      {/* Botón para crear oferta */}
      {!showCreateTrade && (
        <button
          onClick={() => setShowCreateTrade(true)}
          className="w-full mb-4 px-4 py-3 bg-green-600/80 hover:bg-green-500 text-white rounded-lg transition-all duration-200 font-semibold flex items-center justify-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Crear Nueva Oferta
        </button>
      )}
      
      {/* Formulario para crear oferta */}
      {showCreateTrade && (
        <div className="mb-6 p-4 bg-black/30 rounded-lg border border-purple-500/20">
          <div className="flex justify-between items-center mb-3">
            <h4 className="text-lg font-bold text-purple-300">Nueva Oferta</h4>
            <button
              onClick={() => {
                setShowCreateTrade(false);
                setOffering({});
                setRequesting({});
              }}
              className="text-gray-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          {/* Ofrezco */}
          <div className="mb-4">
            <p className="text-sm text-green-400 font-semibold mb-2">Ofrezco:</p>
            <div className="grid grid-cols-5 gap-2">
              {resourceTypes.map(resource => (
                <div key={resource} className="flex flex-col items-center">
                  <label className="text-xs text-gray-300 mb-1 text-center">{RESOURCE_NAMES[resource]}</label>
                  <input
                    type="number"
                    min="0"
                    max={currentPlayer.resources[resource] || 0}
                    value={offering[resource] || 0}
                    onChange={(e) => updateOffering(resource, parseInt(e.target.value) || 0)}
                    className="w-full px-2 py-1 bg-gray-800 text-white text-center rounded border border-gray-600 focus:border-purple-500 focus:outline-none"
                  />
                  <span className="text-xs text-gray-500 mt-1">({currentPlayer.resources[resource] || 0})</span>
                </div>
              ))}
            </div>
          </div>
          
          {/* Solicito */}
          <div className="mb-4">
            <p className="text-sm text-yellow-400 font-semibold mb-2">Solicito:</p>
            <div className="grid grid-cols-5 gap-2">
              {resourceTypes.map(resource => (
                <div key={resource} className="flex flex-col items-center">
                  <label className="text-xs text-gray-300 mb-1 text-center">{RESOURCE_NAMES[resource]}</label>
                  <input
                    type="number"
                    min="0"
                    value={requesting[resource] || 0}
                    onChange={(e) => updateRequesting(resource, parseInt(e.target.value) || 0)}
                    className="w-full px-2 py-1 bg-gray-800 text-white text-center rounded border border-gray-600 focus:border-purple-500 focus:outline-none"
                  />
                </div>
              ))}
            </div>
          </div>
          
          <button
            onClick={handleCreateOffer}
            className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg transition-colors duration-200 font-semibold"
          >
            Publicar Oferta
          </button>
        </div>
      )}
      
      {/* Lista de ofertas activas */}
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {tradeOffers.length === 0 && (
          <p className="text-gray-400 text-center py-4 text-sm">No hay ofertas de comercio activas</p>
        )}
        
        {tradeOffers.map(offer => {
          const offeringPlayer = players.find(p => p.id === offer.fromPlayerId);
          const isMyOffer = offer.fromPlayerId === currentPlayer.id;
          
          return (
            <div
              key={offer.id}
              className={`p-4 rounded-lg border-2 ${
                isMyOffer 
                  ? 'bg-blue-900/20 border-blue-500/50' 
                  : 'bg-purple-900/20 border-purple-500/50'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <p className="font-bold text-sm" style={{ color: offeringPlayer?.color }}>
                  {offeringPlayer?.name}
                </p>
                {isMyOffer && (
                  <button
                    onClick={() => cancelTradeOffer(offer.id)}
                    className="text-red-400 hover:text-red-300"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
              
              <div className="grid grid-cols-3 gap-2 items-center text-xs">
                {/* Ofrece */}
                <div className="text-green-400">
                  {Object.entries(offer.offering).map(([resource, amount]) => (
                    amount && amount > 0 ? (
                      <div key={resource}>
                        {amount}x {RESOURCE_NAMES[resource as ResourceType]}
                      </div>
                    ) : null
                  ))}
                </div>
                
                {/* Flecha */}
                <div className="flex justify-center">
                  <ArrowRightLeft className="w-4 h-4 text-gray-400" />
                </div>
                
                {/* Solicita */}
                <div className="text-yellow-400">
                  {Object.entries(offer.requesting).map(([resource, amount]) => (
                    amount && amount > 0 ? (
                      <div key={resource}>
                        {amount}x {RESOURCE_NAMES[resource as ResourceType]}
                      </div>
                    ) : null
                  ))}
                </div>
              </div>
              
              {!isMyOffer && (
                <button
                  onClick={() => acceptTradeOffer(offer.id, currentPlayer.id)}
                  disabled={!canAcceptOffer(offer.id)}
                  className={`w-full mt-3 px-3 py-2 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all duration-200 text-sm ${
                    canAcceptOffer(offer.id)
                      ? 'bg-green-600 hover:bg-green-500 text-white cursor-pointer'
                      : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  <Check className="w-4 h-4" />
                  {canAcceptOffer(offer.id) ? 'Aceptar' : 'No tienes recursos'}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
