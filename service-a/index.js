require('./tracer');
const express = require('express');
const http = require('http');

const app = express();

app.get('/productos/:id', (req, res) => {
  const { id } = req.params;

  // Llama a Service B pasándole el ID exacto
  http.get(`http://service-b.observability.svc.cluster.local:8081/productos/${id}`, (response) => {
    let data = '';
    response.on('data', chunk => data += chunk);
    response.on('end', () => {
      res.status(response.statusCode);
      res.setHeader('Content-Type', 'application/json');
      res.send(data);
    });
  }).on('error', (err) => {
    res.status(500).json({ error: `Error llamando a Service B: ${err.message}` });
  });
});

app.listen(8080, () => console.log('Service A escuchando en el puerto 8080'));