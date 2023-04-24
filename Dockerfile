FROM node:12

# Create app directory
WORKDIR /usr/src/spark-nodejs

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./

RUN npm install
# If you are building your code for production
# RUN npm ci --only=production

# Bundle app source
COPY . .

# build project
RUN npm run build

#EXPOSE 8085
CMD ["node" , "build/server.js"]