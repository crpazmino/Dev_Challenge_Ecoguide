import React, { useState } from 'react';

const Auth = ({ onLogin }) => {
  const [isRegister, setIsRegister] = useState(false);
  const [formData, setFormData] = useState({ nombre: '', email: '', password: '' });
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    const endpoint = isRegister ? '/api/auth/register' : '/api/auth/login';
    
    try {
      const response = await fetch(`http://localhost:5000${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.error || 'Algo salió mal');

      if (!isRegister) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        onLogin(data.user);
      } else {
        alert("Registro exitoso, ahora inicia sesión");
        setIsRegister(false);
      }
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="auth-container">
      <form className="auth-form" onSubmit={handleSubmit}>
        <h2>{isRegister ? 'Crear Cuenta' : 'Iniciar Sesión'}</h2>
        {error && <p className="error-msg">{error}</p>}
        
        {isRegister && (
          <input 
            type="text" 
            placeholder="Nombre" 
            onChange={(e) => setFormData({...formData, nombre: e.target.value})} 
            required 
          />
        )}
        
        <input 
          type="email" 
          placeholder="Email" 
          onChange={(e) => setFormData({...formData, email: e.target.value})} 
          required 
        />
        
        <input 
          type="password" 
          placeholder="Contraseña" 
          onChange={(e) => setFormData({...formData, password: e.target.value})} 
          required 
        />

        <button type="submit" className="btn-main">
          {isRegister ? 'Registrarse' : 'Entrar'}
        </button>

        <p onClick={() => setIsRegister(!isRegister)} className="switch-auth">
          {isRegister ? '¿Ya tienes cuenta? Loguéate' : '¿No tienes cuenta? Regístrate'}
        </p>
      </form>
    </div>
  );
};

export default Auth;