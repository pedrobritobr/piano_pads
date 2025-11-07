import React from "react";

export function WakeLockPrompt({ onAccept, onDecline }) {
  return (
    <div>
      <div>
        <div>
          <div>🔒</div>
          <h2>Manter Tela Ligada</h2>
          <p>
            Deseja manter a tela do dispositivo sempre ativa durante o uso do aplicativo? 
            Isso evita que a tela desligue automaticamente enquanto você toca.
          </p>
        </div>
        <div>
          <button onClick={onDecline}>Não</button>
          <button onClick={onAccept}>Sim, manter ligada</button>
        </div>
      </div>
    </div>
  );
}
