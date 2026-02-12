import React, { useState } from 'react';
import './EditProfile.css';

const EditProfile = ({ usuario, onActualizar, onCancelar, onEliminarCuenta }) => {
  const [formData, setFormData] = useState({
    nombre: usuario?.nombre || '',
    email: usuario?.email || '',
    password: '',
    confirmPassword: ''
  });
  
  const [errores, setErrores] = useState({});
  const [loading, setLoading] = useState(false);
  const [mostrarConfirmacionEliminar, setMostrarConfirmacionEliminar] = useState(false);
  const [mensajeExito, setMensajeExito] = useState('');

  // ============================================
  // VALIDACIONES
  // ============================================
  const validarEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const validarFormulario = () => {
    const nuevosErrores = {};

    // Validar nombre
    if (!formData.nombre.trim()) {
      nuevosErrores.nombre = 'El nombre es obligatorio';
    } else if (formData.nombre.length < 3) {
      nuevosErrores.nombre = 'El nombre debe tener al menos 3 caracteres';
    }

    // Validar email
    if (!formData.email.trim()) {
      nuevosErrores.email = 'El email es obligatorio';
    } else if (!validarEmail(formData.email)) {
      nuevosErrores.email = 'Formato de email inválido';
    }

    // Validar contraseña solo si se está actualizando
    if (formData.password) {
      if (formData.password.length < 8) {
        nuevosErrores.password = 'La contraseña debe tener al menos 8 caracteres';
      }
      if (formData.password !== formData.confirmPassword) {
        nuevosErrores.confirmPassword = 'Las contraseñas no coinciden';
      }
    }

    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  // ============================================
  // MANEJADORES DE EVENTOS
  // ============================================
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    // Limpiar error del campo cuando el usuario escribe
    if (errores[name]) {
      setErrores({
        ...errores,
        [name]: ''
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validarFormulario()) return;
    
    setLoading(true);
    setMensajeExito('');
    
    try {
      // Preparar datos para enviar (solo campos modificados)
      const datosActualizar = {};
      if (formData.nombre !== usuario.nombre) datosActualizar.nombre = formData.nombre;
      if (formData.email !== usuario.email) datosActualizar.email = formData.email;
      if (formData.password) datosActualizar.password = formData.password;
      
      const token = localStorage.getItem('token');
      
      const response = await fetch(`http://localhost:5000/api/usuarios/${usuario.id}/perfil`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(datosActualizar)
      });
      
      const data = await response.json();
      
      if (data.success) {
        setMensajeExito('¡Perfil actualizado exitosamente!');
        setTimeout(() => {
          onActualizar(data.usuario);
        }, 1500);
      } else {
        setErrores({ general: data.message });
      }
    } catch (error) {
      setErrores({ general: 'Error de conexión con el servidor' });
    } finally {
      setLoading(false);
    }
  };

  const handleEliminarCuenta = async () => {
    setLoading(true);
    
    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch(`http://localhost:5000/api/usuarios/${usuario.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Cerrar sesión y redirigir
        localStorage.removeItem('token');
        localStorage.removeItem('usuario');
        onEliminarCuenta();
      } else {
        setErrores({ general: data.message });
        setMostrarConfirmacionEliminar(false);
      }
    } catch (error) {
      setErrores({ general: 'Error al eliminar la cuenta' });
      setMostrarConfirmacionEliminar(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="edit-profile-container">
      <div className="edit-profile-card">
        <h2>Editar Perfil</h2>
        
        {mensajeExito && (
          <div className="alert alert-success">
            ✅ {mensajeExito}
          </div>
        )}
        
        {errores.general && (
          <div className="alert alert-error">
            ❌ {errores.general}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          {/* Campo Nombre */}
          <div className="form-group">
            <label htmlFor="nombre">Nombre completo</label>
            <input
              type="text"
              id="nombre"
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              className={errores.nombre ? 'error' : ''}
              placeholder="Tu nombre"
            />
            {errores.nombre && (
              <span className="error-message">{errores.nombre}</span>
            )}
          </div>
          
          {/* Campo Email */}
          <div className="form-group">
            <label htmlFor="email">Correo electrónico</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={errores.email ? 'error' : ''}
              placeholder="tu@email.com"
            />
            {errores.email && (
              <span className="error-message">{errores.email}</span>
            )}
          </div>
          
          {/* Campo Nueva Contraseña */}
          <div className="form-group">
            <label htmlFor="password">Nueva contraseña (opcional)</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className={errores.password ? 'error' : ''}
              placeholder="Mínimo 8 caracteres"
            />
            {errores.password && (
              <span className="error-message">{errores.password}</span>
            )}
          </div>
          
          {/* Campo Confirmar Contraseña */}
          <div className="form-group">
            <label htmlFor="confirmPassword">Confirmar contraseña</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className={errores.confirmPassword ? 'error' : ''}
              placeholder="Repite tu contraseña"
            />
            {errores.confirmPassword && (
              <span className="error-message">{errores.confirmPassword}</span>
            )}
          </div>
          
          {/* Botones de acción */}
          <div className="form-actions">
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? 'Guardando...' : 'Guardar Cambios'}
            </button>
            <button 
              type="button" 
              className="btn btn-secondary"
              onClick={onCancelar}
              disabled={loading}
            >
              Cancelar
            </button>
          </div>
        </form>
        
        {/* Sección de eliminar cuenta */}
        <div className="delete-account-section">
          <hr />
          <h3 className="delete-title">Zona de Peligro</h3>
          
          {!mostrarConfirmacionEliminar ? (
            <button 
              className="btn btn-danger"
              onClick={() => setMostrarConfirmacionEliminar(true)}
            >
              🗑️ Eliminar mi cuenta
            </button>
          ) : (
            <div className="confirm-delete">
              <p className="warning-text">
                ⚠️ ¿Estás completamente seguro? Esta acción eliminará:
              </p>
              <ul className="warning-list">
                <li>Tu perfil y datos personales</li>
                <li>Todo tu historial de clasificaciones</li>
                <li>Tus puntos y logros</li>
              </ul>
              <p className="warning-text-bold">
                ¡Esta acción NO se puede deshacer!
              </p>
              <div className="confirm-actions">
                <button 
                  className="btn btn-danger"
                  onClick={handleEliminarCuenta}
                  disabled={loading}
                >
                  {loading ? 'Eliminando...' : 'Sí, eliminar mi cuenta'}
                </button>
                <button 
                  className="btn btn-secondary"
                  onClick={() => setMostrarConfirmacionEliminar(false)}
                  disabled={loading}
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EditProfile;