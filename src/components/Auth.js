import React, { useState } from 'react';
import EditProfile from './EditProfile';
import './Auth.css';

const Auth = () => {
  const [modo, setModo] = useState('login'); // 'login' o 'register'
  const [usuarioActual, setUsuarioActual] = useState(null);
  const [mostrarEditProfile, setMostrarEditProfile] = useState(false);
  
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    password: ''
  });

  const handleLoginSuccess = (usuarioData) => {
    setUsuarioActual(usuarioData);
    localStorage.setItem('usuario', JSON.stringify(usuarioData));
    setMostrarEditProfile(false);
  };

  const handleActualizarPerfil = (usuarioActualizado) => {
    setUsuarioActual(usuarioActualizado);
    localStorage.setItem('usuario', JSON.stringify(usuarioActualizado));
    setMostrarEditProfile(false);
  };

  const handleEliminarCuenta = () => {
    setUsuarioActual(null);
    localStorage.removeItem('usuario');
    localStorage.removeItem('token');
    setMostrarEditProfile(false);
    setModo('login');
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Aquí va tu lógica de login/registro existente
  };

  // SI EL USUARIO YA ESTÁ AUTENTICADO Y QUIERE EDITAR PERFIL
  if (usuarioActual && mostrarEditProfile) {
    return (
      <EditProfile 
        usuario={usuarioActual}
        onActualizar={handleActualizarPerfil}
        onCancelar={() => setMostrarEditProfile(false)}
        onEliminarCuenta={handleEliminarCuenta}
      />
    );
  }

  // SI EL USUARIO YA ESTÁ AUTENTICADO (PERO NO EDITANDO)
  if (usuarioActual) {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <h2>Bienvenido, {usuarioActual.nombre}!</h2>
          <div className="user-info">
            <p><strong>Email:</strong> {usuarioActual.email}</p>
            <p><strong>Puntos:</strong> {usuarioActual.puntos || 0}</p>
            <p><strong>CO₂ evitado:</strong> {usuarioActual.co2_evitado || 0} kg</p>
          </div>
          <div className="auth-actions">
            <button 
              onClick={() => setMostrarEditProfile(true)}
              className="btn btn-primary"
            >
              ✏️ Editar Perfil
            </button>
            <button 
              onClick={() => {
                setUsuarioActual(null);
                localStorage.clear();
              }}
              className="btn btn-secondary"
            >
              🚪 Cerrar Sesión
            </button>
          </div>
        </div>
      </div>
    );
  }

  // FORMULARIO DE LOGIN/REGISTRO (cuando no hay usuario)
  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>{modo === 'login' ? 'Iniciar Sesión' : 'Registrarse'}</h2>
        
        <form onSubmit={handleSubmit}>
          {modo === 'register' && (
            <div className="form-group">
              <label>Nombre</label>
              <input
                type="text"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                required
              />
            </div>
          )}
          
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label>Contraseña</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>
          
          <button type="submit" className="btn btn-primary">
            {modo === 'login' ? 'Entrar al Sistema' : 'Registrarse'}
          </button>
        </form>
        
        <p className="auth-switch">
          {modo === 'login' 
            ? '¿No tienes cuenta? ' 
            : '¿Ya tienes cuenta? '}
          <button 
            onClick={() => setModo(modo === 'login' ? 'register' : 'login')}
            className="btn-link"
          >
            {modo === 'login' ? 'Regístrate gratis' : 'Iniciar Sesión'}
          </button>
        </p>
      </div>
    </div>
  );
};

export default Auth;