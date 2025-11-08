import React from "react";
import packageJson from "../../package.json";
import "./LogsPanel.scss";

export function LogsPanel({ logs, showLogs, onToggleLogs, onClearLogs }) {
  return (
    <div className="LogsPanel">
      {/* Versão do App */}
      <div>v{packageJson.version}</div>

      {/* Botão para mostrar/ocultar logs */}
      <button onClick={onToggleLogs}>{showLogs ? "Ocultar Logs" : "Mostrar Logs"}</button>

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
    </div>
  );
}
