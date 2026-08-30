require('./tracer');
const express = require('express');
const { Pool } = require('pg');

const app = express();
const pool = new Pool({
  host: process.env.DB_HOST || 'postgres.observability.svc.cluster.local',
  user: 'user',
  password: 'secret',
  database: 'appdb',
  port: 5432,
});

// Endpoint que extrae la lista completa de productos
app.get('/productos', async (req, res) => {
  try {
    const dbRes = await pool.query('SELECT * FROM productos ORDER BY id ASC');
    res.json({
      status: 'success',
      servicio: 'service-c',
      total: dbRes.rowCount,
      data: dbRes.rows
    });
  } catch (err) {
    console.error('Error ejecutando consulta en PostgreSQL:', err);
    res.status(500).json({ status: 'error', error: err.message });
  }
});

app.listen(8082, () => console.log('Service C escuchando en el puerto 8082'));