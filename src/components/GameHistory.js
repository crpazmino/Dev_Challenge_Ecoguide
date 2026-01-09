import React from 'react';

const GameHistory = ({ history }) => {
  return (
    <div className="history-section">
      <h3>Tu Historial Reciente</h3>
      <div className="history-table-container">
        {history.length === 0 ? (
          <p className="no-data">Aún no has clasificado ningún objeto.</p>
        ) : (
          <table className="history-table">
            <thead>
              <tr>
                <th>Objeto</th>
                <th>Resultado</th>
                <th>Fecha</th>
              </tr>
            </thead>
            <tbody>
              {history.map((entry, index) => (
                <tr key={index} className={entry.acierto ? 'row-success' : 'row-fail'}>
                  <td>
                    <span className="history-icon">{entry.icono}</span> {entry.objeto}
                  </td>
                  <td>
                    {entry.acierto ? '✅ Acertaste' : '❌ Fallaste'}
                  </td>
                  <td>
                    {new Date(entry.fecha).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default GameHistory;