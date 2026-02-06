FROM node:20-alpine

COPY . .

RUN cd app && npx expo export

EXPOSE 443

CMD ["node", "server.js"]
