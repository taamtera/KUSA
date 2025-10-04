# docker file for next js frontend
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3000
CMD ["npm", "run", "dev"]

# docker build -t KUSAfrontend .
# docker run -d -p 3000:3000 --name KUSA-Frontend-Container KUSAfrontend
