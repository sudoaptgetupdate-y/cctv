FROM node:20-slim

# ติดตั้ง OpenSSL สำหรับ Prisma และ FFmpeg สำหรับ Snapshot
RUN apt-get update && apt-get install -y openssl ffmpeg && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package*.json ./
RUN npm install

# Copy prisma folder explicitly before everything else to ensure migrations are there
COPY prisma ./prisma/

COPY . .

# Generate Prisma Client
RUN npx prisma generate

EXPOSE 5000

CMD ["npm", "start"]
