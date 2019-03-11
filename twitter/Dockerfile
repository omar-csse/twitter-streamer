FROM node:8
LABEL 'maintainer'='omar' 
WORKDIR /app
COPY ./package*.json ./
RUN npm install
COPY . /app
EXPOSE 3000
CMD node ./server/app.js