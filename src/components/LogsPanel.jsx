import React from "react";
import packageJson from "../../package.json";

export function LogsPanel({ logs, showLogs, onToggleLogs, onClearLogs }) {
  return (
    <>
      {/* Painel de Logs */}
      {showLogs && (
        <div>
          <div>
            <span>Console de Logs</span>
            <button onClick={onClearLogs}>Limpar</button>
          </div>
          <div>
            {logs.length === 0 ? (
              <div>Nenhum log ainda</div>
            ) : (
              logs.map((log) => (
                <div key={log.id}>
                  <span>[{log.timestamp}]</span>{" "}
                  {log.message}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Botão para mostrar/ocultar logs */}
      <button onClick={onToggleLogs}>{showLogs ? "Ocultar Logs" : "Mostrar Logs"}</button>

      {/* Versão do App */}
      <div>v{packageJson.version}</div>
    </>
  );
}
