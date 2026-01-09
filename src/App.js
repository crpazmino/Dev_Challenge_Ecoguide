import React, { useState, useEffect } from 'react';
import Auth from './components/Auth';
import WasteItem from './components/WasteItem';
import Bin from './components/Bin';
import './App.css';

function App() {
  // --- ESTADOS ---
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')));
  const [wasteData, setWasteData] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState({ text: "¡Bienvenido! Clasifica el objeto", color: "#333" });

  // --- CARGAR DATOS DE LA DB ---
  useEffect(() => {
    if (user) {
      fetch('http://localhost:5000/api/residuos')
        .then(res => res.json())
        .then(data => {
          setWasteData(data);
          setLoading(false);
        })
        .catch(err => console.error("Error cargando residuos:", err));
    }
  }, [user]);

  // --- LÓGICA DEL JUEGO ---
  const currentItem = wasteData[currentIndex];

  const handleDragStart = (e, item) => {
    e.dataTransfer.setData("itemType", item.tipo);
    e.dataTransfer.setData("itemId", item.id);
  };

  const onDropResult = async (isCorrect) => {
    if (!currentItem) return;

    // Enviar resultado al historial del Backend
    try {
      await fetch('http://localhost:5000/api/historial', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          usuario_id: user.id,
          residuo_id: currentItem.id,
          acierto: isCorrect
        }),
      });
    } catch (err) {
      console.error("Error guardando historial:", err);
    }

    // Feedback visual y cambio de objeto
    if (isCorrect) {
      setFeedback({ text: `✅ ¡Correcto! ${currentItem.consejo}`, color: "#2ecc71" });
      setTimeout(() => {
        nextItem();
      }, 2000);
    } else {
      setFeedback({ text: "❌ ¡Ups! Ese contenedor no es el correcto.", color: "#e74c3c" });
    }
  };

  const nextItem = () => {
    setFeedback({ text: "Siguiente objeto...", color: "#333" });
    if (currentIndex < wasteData.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      setFeedback({ text: "🎉 ¡Completaste todos los residuos de hoy!", color: "#3498db" });
    }
  };

  const logout = () => {
    localStorage.clear();
    setUser(null);
  };

  // --- RENDERS CONDICIONALES ---

  // 1. Si no hay usuario logueado
  if (!user) {
    return <Auth onLogin={(userData) => setUser(userData)} />;
  }

  // 2. Si está cargando datos de la DB
  if (loading) {
    return (
      <div className="app-container">
        <h2 className="loading-text">Cargando EcoGuide...</h2>
      </div>
    );
  }

  // 3. Interfaz del Juego
  return (
    <div className="app-container">
      <header className="main-header">
        <div className="user-info">
          <h1>EcoGuide</h1>
          <p>Explorador: <strong>{user.nombre}</strong></p>
        </div>
        <button onClick={logout} className="btn-logout">Cerrar Sesión</button>
      </header>

      <main className="game-area">
        <div className="feedback-hub" style={{ borderLeft: `8px solid ${feedback.color}` }}>
          {feedback.text}
        </div>

        <div className="waste-display">
          {currentIndex < wasteData.length ? (
            <WasteItem item={currentItem} onDragStart={handleDragStart} />
          ) : (
            <button className="btn-main" onClick={() => window.location.reload()}>Jugar de nuevo</button>
          )}
        </div>

        <div className="bins-layout">
          <Bin type="yellow" label="Plásticos" onDropCorrect={onDropResult} />
          <Bin type="blue" label="Papel/Cartón" onDropCorrect={onDropResult} />
          <Bin type="green" label="Vidrio" onDropCorrect={onDropResult} />
          <Bin type="grey" label="Orgánico" onDropCorrect={onDropResult} />
          <Bin type="special" label="Peligrosos" onDropCorrect={onDropResult} />
        </div>
      </main>
    </div>
  );
}

export default App;