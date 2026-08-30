require('./tracer');
const express = require('express');
const { Pool } = require('pg');

const app = express();
const pool = new Pool({
  host: process.env.DB_HOST || 'postgres.observability',
  user: 'user',
  password: 'secret',
  database: 'appdb',
});

app.get('/productos/:id', async (req, res) => {
  const { id } = req.params;

  try {
    // Consulta parametrizada para evitar inyecciones SQL
    const dbRes = await pool.query('SELECT * FROM productos WHERE id = $1', [id]);

    if (dbRes.rows.length === 0) {
      return res.status(404).json({ status: 'error', message: 'Producto no encontrado' });
    }

    res.json({
      status: 'success',
      data: dbRes.rows[0]
    });
  } catch (err) {
    console.error('Error en consulta SQL:', err);
    res.status(500).json({ status: 'error', error: err.message });
  }
});

app.listen(8081, () => console.log('Service B escuchando en el puerto 8081'));