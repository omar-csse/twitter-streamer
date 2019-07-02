ARG NODE_VERSION
FROM node:lts
LABEL 'maintainer'='omar' 
WORKDIR /app
COPY ./package*.json ./
RUN npm install
COPY . /app
EXPOSE 3000
CMD [ "npm", "run-script", "build" ]