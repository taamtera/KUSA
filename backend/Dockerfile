# docker file for node js backend
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3001
CMD ["npm", "start"]

# docker build -t KUSAbackend .
# docker run -d -p 3001:3001 --name KUSA-Backend-Container KUSAbackend