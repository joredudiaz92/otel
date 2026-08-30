FROM node:18-alpine

WORKDIR /app

# Copia los archivos de configuración e instala las dependencias dentro de la imagen
COPY package*.json ./
RUN npm install --production

# Copia el código fuente
COPY . .

EXPOSE 8080
CMD ["node", "index.js"]