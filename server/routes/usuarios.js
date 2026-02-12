const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const pool = require('../db'); // Ajusta la ruta según tu estructura
const verificarToken = require('../middleware/auth');

// PUT - Actualizar perfil
router.put('/:id/perfil', verificarToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, email, password } = req.body;
    
    if (req.usuario.id !== parseInt(id)) {
      return res.status(403).json({ 
        success: false, 
        message: 'No autorizado para modificar este usuario' 
      });
    }

    let camposActualizar = [];
    let valores = [];
    let contador = 1;

    if (nombre) {
      camposActualizar.push(`nombre = $${contador}`);
      valores.push(nombre);
      contador++;
    }

    if (email) {
      const emailExistente = await pool.query(
        'SELECT id FROM usuarios WHERE email = $1 AND id != $2',
        [email, id]
      );
      
      if (emailExistente.rows.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'El email ya está registrado por otro usuario'
        });
      }
      
      camposActualizar.push(`email = $${contador}`);
      valores.push(email);
      contador++;
    }

    if (password) {
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(password, salt);
      camposActualizar.push(`password = $${contador}`);
      valores.push(passwordHash);
      contador++;
    }

    if (camposActualizar.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No hay campos para actualizar'
      });
    }

    valores.push(id);
    const query = `
      UPDATE usuarios 
      SET ${camposActualizar.join(', ')} 
      WHERE id = $${contador} 
      RETURNING id, nombre, email, puntos, co2_evitado
    `;

    const result = await pool.query(query, valores);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    res.json({
      success: true,
      message: 'Perfil actualizado exitosamente',
      usuario: result.rows[0]
    });

  } catch (error) {
    console.error('Error actualizando usuario:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

// DELETE - Eliminar cuenta
router.delete('/:id', verificarToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    if (req.usuario.id !== parseInt(id)) {
      return res.status(403).json({
        success: false,
        message: 'No autorizado para eliminar este usuario'
      });
    }

    await pool.query('DELETE FROM historial WHERE usuario_id = $1', [id]);
    
    const result = await pool.query(
      'DELETE FROM usuarios WHERE id = $1 RETURNING id, nombre, email',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    res.json({
      success: true,
      message: 'Cuenta eliminada exitosamente',
      usuario: result.rows[0]
    });

  } catch (error) {
    console.error('Error eliminando usuario:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

module.exports = router;