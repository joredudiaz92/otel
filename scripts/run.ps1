minikube start --memory=4096 --cpus=3

kubectl apply -f 00-infrastructure.yaml
kubectl apply -f 01-apps.yaml

kubectl get pods -n observability

minikube dashboard

minikube -p minikube docker-env ||  minikube -p minikube docker-env | Invoke-Expression (windows)
docker build -t service-a:latest .
kubectl rollout restart deployment/service-a -n observability
minikube image load # en ocasiones no carga al minikube
# verificar que se cambie el nombre de la imagen en 01-apps.yaml

# Conectar a psql
 kubectl.exe exec -it postgres-f8c856db9-2gs9j -n observability -- psql -U user -d appdb

# Generar tráfico llamando al Service A
kubectl port-forward svc/service-a 8080:8080 -n observability
kubectl port-forward svc/service-b 8081:8081 -n observability
kubectl port-forward svc/service-c 8082:8082 -n observability

# Jaeger UI (Trazas)
kubectl port-forward svc/jaeger 16686:16686 -n observability

# Prometheus UI (Métricas)
kubectl port-forward svc/prometheus 9090:9090 -n observability

# Grafana UI (Dashboards)
kubectl port-forward svc/grafana 3000:3000 -n observability


# run load test
k6 run load-test.js

k6 run --out influxdb=http://localhost:8086/k6db load-test.js # para exportar datos

# Crear chaos mesh
powershell -ExecutionPolicy Bypass -File .\scripts\setup-chaos-mesh.ps1

# chequear que el experimento se ejecuto correctamente
kubectl describe networkchaos latency-service-b -n observability

# borrar el experimento
kubectl delete -f .\chaos-experiments\chaos-latency-service-b.yaml