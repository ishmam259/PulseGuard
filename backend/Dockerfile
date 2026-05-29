FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY . .
EXPOSE 5000
RUN chmod +x entrypoint.sh
ENTRYPOINT ["./entrypoint.sh"]
