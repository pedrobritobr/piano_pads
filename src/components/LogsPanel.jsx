import React from "react";
import packageJson from "../../package.json";

export function LogsPanel({ logs, showLogs, onToggleLogs, onClearLogs }) {
  return (
    <>
      {/* Painel de Logs */}
      {showLogs && (
        <div className="fixed bottom-16 left-4 right-4 max-w-3xl mx-auto h-64 bg-gray-900 text-white rounded-lg shadow-2xl overflow-hidden z-40">
          <div className="bg-gray-800 px-4 py-2 flex justify-between items-center">
            <span className="font-semibold text-sm">Console de Logs</span>
            <button
              onClick={onClearLogs}
              className="text-xs bg-red-500 hover:bg-red-600 px-2 py-1 rounded transition"
            >
              Limpar
            </button>
          </div>
          <div className="overflow-y-auto h-[calc(100%-2.5rem)] p-3 space-y-1 text-xs font-mono">
            {logs.length === 0 ? (
              <div className="text-gray-400 text-center py-4">Nenhum log ainda</div>
            ) : (
              logs.map((log) => (
                <div
                  key={log.id}
                  className={`p-2 rounded ${
                    log.type === "error"
                      ? "bg-red-900/50 text-red-200"
                      : log.type === "warning"
                      ? "bg-yellow-900/50 text-yellow-200"
                      : log.type === "success"
                      ? "bg-green-900/50 text-green-200"
                      : "bg-gray-800 text-gray-300"
                  }`}
                >
                  <span className="text-gray-500">[{log.timestamp}]</span>{" "}
                  {log.message}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Botão para mostrar/ocultar logs */}
      <button
        onClick={onToggleLogs}
        className="fixed bottom-2 left-2 bg-gray-800 text-white px-3 py-2 rounded-lg shadow-lg text-xs font-semibold hover:bg-gray-700 transition z-50"
      >
        {showLogs ? "Ocultar Logs" : "Mostrar Logs"}
      </button>

      {/* Versão do App */}
      <div className="fixed bottom-2 right-2 text-xs text-gray-400">
        v{packageJson.version}
      </div>
    </>
  );
}
