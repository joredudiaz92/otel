# ==============================================================================
# SCRIPT DE AUTOMATIZACIÓN PARA CHAOS MESH EN WINDOWS (POWERSHELL)
# ==============================================================================
# Requisitos previos: Minikube debe estar corriendo (`minikube start`).
# Ejecuta este script en una consola de PowerShell con privilegios de Administrador.
function kubectl {
    minikube kubectl -- $args
}

$ErrorActionPreference = "Stop"

Write-Host "=== 1. Verificando e instalando Helm ===" -ForegroundColor Cyan
if (-not (Get-Command helm -ErrorAction SilentlyContinue)) {
    Write-Host "Helm no encontrado. Instalando a través de winget..." -ForegroundColor Yellow
    winget install Helm.Helm --silent --accept-source-agreements --accept-package-agreements
    
    # Actualizar la variable de entorno PATH para la sesión actual
    $env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")
    
    if (-not (Get-Command helm -ErrorAction SilentlyContinue)) {
        Write-Error "No se pudo detectar Helm tras la instalación. Por favor, reinicia PowerShell e inténtalo de nuevo."
    }
} else {
    Write-Host "Helm ya está instalado." -ForegroundColor Green
}

Write-Host "`n=== 2. Configurando repositorios de Chaos Mesh ===" -ForegroundColor Cyan
helm repo add chaos-mesh https://charts.chaos-mesh.org
helm repo update

Write-Host "`n=== 3. Instalando Chaos Mesh en Minikube ===" -ForegroundColor Cyan
# Determinamos el entorno de ejecución (Docker es el estándar en Minikube para Windows)
helm install chaos-mesh chaos-mesh/chaos-mesh `
  --namespace chaos-mesh `
  --set chaosDaemon.runtime=docker `
  --set chaosDaemon.socketPath=/var/run/docker.sock `
  --create-namespace

Write-Host "`n=== 4. Esperando a que los componentes estén listos ===" -ForegroundColor Cyan
Write-Host "Esto puede tomar un par de minutos mientras se descargan las imágenes..." -ForegroundColor Yellow
Start-Sleep -Seconds 15
kubectl wait --namespace chaos-mesh --for=condition=ready pod --all --timeout=300s

Write-Host "`n=== 5. Creando carpeta de experimentos y archivos YAML ===" -ForegroundColor Cyan
if (-not (Test-Path -Path "k8s")) {
    New-Item -ItemType Directory -Path "k8s" | Out-Null
}

# Experimento 1: Latencia en service-b (200ms)
$latencyYaml = @"
apiVersion: chaos-mesh.org/v1alpha1
kind: NetworkChaos
metadata:
  name: latency-service-b
  namespace: observability
spec:
  action: delay
  mode: all
  selector:
    labelSelectors:
      app: "service-b"
  delay:
    latency: '200ms'
    correlation: '100'
  direction: to
  duration: '5m'
"@
$latencyYaml | Out-File -FilePath "chaos-experiments\chaos-latency-service-b.yaml" -Encoding utf8

# Experimento 2: Tasa de errores del 10% en service-c
$errorYaml = @"
apiVersion: chaos-mesh.org/v1alpha1
kind: HTTPChaos
metadata:
  name: error-rate-service-c
  namespace: observability
spec:
  mode: all
  selector:
    labelSelectors:
      app: "service-c"
  target: Request
  port: 8080
  abort: true
  percentage: 10
  duration: '5m'
"@
$errorYaml | Out-File -FilePath "chaos-experiments\chaos-errors-service-c.yaml" -Encoding utf8

Write-Host "Archivos YAML de caos creados en la carpeta 'chaos-experiments/'." -ForegroundColor Green

Write-Host "`n=== [PROCESO COMPLETADO] ===" -ForegroundColor Green
Write-Host "Para aplicar los experimentos ejecuta:" -ForegroundColor Yellow
Write-Host "`nCopia el token para el dashboard de chaos mesh" -ForegroundColor Yellow
Write-Host "  kubectl -n observability create token account-observability-manager-amaip"
Write-Host "  kubectl apply -f chaos-experiments/chaos-latency-service-b.yaml -n observability"
Write-Host "  kubectl apply -f chaos-experiments/chaos-errors-service-c.yaml -n observability"
Write-Host "`nPara abrir el panel visual (Dashboard) en otra terminal ejecuta:" -ForegroundColor Yellow
Write-Host "  kubectl port-forward -n chaos-mesh service/chaos-dashboard 2333:2333"
