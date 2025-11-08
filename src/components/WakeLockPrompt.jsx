import React, { useState, useRef, useEffect } from "react";
import "./WakeLockPrompt.scss";

export function WakeLockPrompt({ onAccept, onDecline }) {
  const [closing, setClosing] = useState(false);
  const timerRef = useRef(null);
  const DURATION = 200; // deve ficar alinhado com a transição CSS

  const closeWithAnimation = (cb) => {
    if (closing) return;
    setClosing(true);
    timerRef.current = setTimeout(() => {
      if (typeof cb === "function") cb();
    }, DURATION);
  };

  const handleDecline = () => closeWithAnimation(onDecline);
  const handleAccept = () => closeWithAnimation(onAccept);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return (
    <>
      {/* overlay separado para que backdrop-filter afete o fundo e não o próprio prompt */}
      <div
        className={
          "WakeLockPrompt__overlay" + (closing ? " WakeLockPrompt__overlay--closing" : "")
        }
        onClick={handleDecline}
        aria-hidden="true"
      />

      <div
        className={"WakeLockPrompt" + (closing ? " WakeLockPrompt--closing" : "")}
        role="dialog"
        aria-modal="true"
      >
        <div>
          <h3>🔒Manter Tela Ligada</h3>
          <p>
            Deseja manter a tela do dispositivo sempre ativa durante o uso do
            aplicativo? Isso evita que a tela desligue automaticamente enquanto
            você toca.
          </p>
        </div>
        <div className="WakeLockPrompt__buttons">
          <button onClick={handleDecline}>Não</button>
          <button onClick={handleAccept}>Sim, manter ligada</button>
        </div>
      </div>
    </>
  );
}
