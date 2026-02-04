FROM node:20-alpine

WORKDIR /app

COPY server.js .
COPY app/ ./app/

EXPOSE 443

CMD ["node", "server.js"]
