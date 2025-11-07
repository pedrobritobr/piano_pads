import React from "react";

export function WakeLockPrompt({ onAccept, onDecline }) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-in fade-in zoom-in duration-200">
        <div className="text-center mb-4">
          <div className="text-4xl mb-3">🔒</div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">
            Manter Tela Ligada
          </h2>
          <p className="text-gray-600 text-sm leading-relaxed">
            Deseja manter a tela do dispositivo sempre ativa durante o uso do aplicativo? 
            Isso evita que a tela desligue automaticamente enquanto você toca.
          </p>
        </div>
        <div className="flex gap-3 mt-6">
          <button
            onClick={onDecline}
            className="flex-1 py-3 px-4 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold rounded-lg transition"
          >
            Não
          </button>
          <button
            onClick={onAccept}
            className="flex-1 py-3 px-4 bg-indigo-500 hover:bg-indigo-600 text-white font-semibold rounded-lg transition"
          >
            Sim, manter ligada
          </button>
        </div>
      </div>
    </div>
  );
}
