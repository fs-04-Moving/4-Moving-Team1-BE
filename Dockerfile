# 개발용
FROM node:18

WORKDIR /app

# package.json 먼저 복사 (캐시 활용)
COPY package*.json ./

RUN npm install

# 전체 코드 복사
COPY . .
RUN npx prisma generate   # 여기 추가!

EXPOSE 5050
CMD ["npm", "run", "dev"]


# 배포용
# FROM node:18

# WORKDIR /app
# COPY . .

# RUN npm install

# EXPOSE 5050
# CMD ["npm", "run", "start"]
