const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});


app.post('/api/auth/register', async (req, res) => {
  const { nombre, email, password } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await pool.query(
      'INSERT INTO usuarios (nombre, email, password) VALUES ($1, $2, $3) RETURNING id, nombre, email',
      [nombre, email, hashedPassword]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(400).json({ error: "El email ya está registrado." });
  }
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await pool.query('SELECT * FROM usuarios WHERE email = $1', [email]);
    if (user.rows.length === 0) return res.status(404).json({ error: "Usuario no encontrado" });

    const validPassword = await bcrypt.compare(password, user.rows[0].password);
    if (!validPassword) return res.status(401).json({ error: "Contraseña incorrecta" });

    const token = jwt.sign({ id: user.rows[0].id }, process.env.JWT_SECRET, { expiresIn: '24h' });
    res.json({ token, user: { id: user.rows[0].id, nombre: user.rows[0].nombre, puntos: user.rows[0].puntos } });
  } catch (err) {
    res.status(500).json({ error: "Error en el servidor" });
  }
});


app.get('/api/residuos', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM residuos ORDER BY RANDOM()');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/historial', async (req, res) => {
  const { usuario_id, residuo_id, acierto } = req.body;
  try {
    await pool.query(
      'INSERT INTO historial (usuario_id, residuo_id, acierto) VALUES ($1, $2, $3)',
      [usuario_id, residuo_id, acierto]
    );

    if (acierto) {
      await pool.query('UPDATE usuarios SET puntos = puntos + 10 WHERE id = $1', [usuario_id]);
    }

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "No se pudo guardar el progreso" });
  }
});

app.get('/api/usuario/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const user = await pool.query('SELECT nombre, puntos, creado_en FROM usuarios WHERE id = $1', [id]);
    const historial = await pool.query(
      `SELECT h.fecha, h.acierto, r.nombre as objeto, r.icono 
       FROM historial h JOIN residuos r ON h.residuo_id = r.id 
       WHERE h.usuario_id = $1 ORDER BY h.fecha DESC LIMIT 5`, [id]
    );
    res.json({ perfil: user.rows[0], historial: historial.rows });
  } catch (err) {
    res.status(500).json({ error: "Error al obtener perfil" });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Servidor EcoGuide corriendo en puerto ${PORT}`));