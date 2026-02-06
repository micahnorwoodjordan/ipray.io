FROM node:20-alpine

COPY . .

RUN cd app && npm ci && npx expo export --platform web

EXPOSE 443

CMD ["node", "server.js"]
