ARG NODE_VERSION
FROM node:lts-alpine
LABEL 'maintainer'='omar' 
WORKDIR /app
COPY ./package*.json ./
RUN npm install --only=production
COPY . /app
EXPOSE 3000
CMD [ "npm", "run-script", "build" ]