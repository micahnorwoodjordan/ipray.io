FROM node:20-alpine

COPY . .

RUN cd app && npm ci && npx expo export --platform web

# for digitalocean
EXPOSE 443

CMD ["node", "server.js"]
