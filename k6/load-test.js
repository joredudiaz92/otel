import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  scenarios: {
    trafico_sostenido: {
      executor: 'constant-vus',
      vus: 10,              // Cantidad de usuarios virtuales simultáneos
      duration: '5m',       // Duración sostenida de 5 minutos
    },
  },
  thresholds: {
    http_req_failed: ['rate<0.01'],   // Menos del 1% de errores esperados
    http_req_duration: ['p(95)<500'], // El 95% de las peticiones deben ser menores a 500ms
  },
};

// IDs de los 4 productos en base de datos
const productIds = [1, 2, 3, 4];

export default function () {
  // Selección aleatoria del servicio (1, 2 o 3)
  const serviceSelector = Math.floor(Math.random() * 3) + 1;
  
  // Selección aleatoria del ID de producto
  const randomProductId = productIds[Math.floor(Math.random() * productIds.length)];

  let res;

  switch (serviceSelector) {
    case 1:
      // Servicio A: Requiere ID de producto
      res = http.get(`http://localhost:8080/products/${randomProductId}`);
      check(res, {
        'Servicio A HTTP 200': (r) => r.status === 200,
      });
      break;

    case 2:
      // Servicio B: Requiere ID de producto
      res = http.get(`http://localhost:8081/products/${randomProductId}`);
      check(res, {
        'Servicio B HTTP 200': (r) => r.status === 200,
      });
      break;

    case 3:
      // Servicio C: Consulta directa sin ID
      res = http.get('http://localhost:8082/products');
      check(res, {
        'Servicio C HTTP 200': (r) => r.status === 200,
      });
      break;
  }

  // Pausa corta entre peticiones por VU para simular tráfico realista
  sleep(0.5);
}