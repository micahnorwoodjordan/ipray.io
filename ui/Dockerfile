FROM node:20-alpine

COPY . .

RUN ls -ahl && sleep 5 && pwd && sleep 5

RUN cd app && npx expo export

EXPOSE 443

CMD ["node", "server.js"]
