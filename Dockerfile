# Etapa de build
FROM node:18-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install --legacy-peer-deps
COPY . .
RUN npm run build

# Etapa de producción
FROM node:18-alpine AS production
WORKDIR /app
ENV NODE:ENV=production
COPY --from=build /app/public ./public
COPY --from=build /app/next ./next
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package.json ./package.json
EXPOSE 3000
CMD ["npm", "start"]
