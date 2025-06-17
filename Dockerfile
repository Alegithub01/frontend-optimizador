# Etapa de build
FROM node:18-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm install --legacy-peer-deps
COPY . .
RUN npm run build

# Etapa de producción
FROM node:18-alpine
WORKDIR /app
COPY --from=build /app .
RUN npm install --production --legacy-peer-deps
EXPOSE 3000
CMD ["node", "dist/main"]
