FROM mongo:4.2
WORKDIR /db/init
COPY scripts/db-script.js .
RUN mongo --host custom-built-mongodb db-script.js

FROM mhart/alpine-node:12
WORKDIR /app
COPY . .
COPY charan .
RUN npm ci --prod
RUN ls -a
CMD ["npm", "run", "start:prod"]