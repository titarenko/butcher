FROM node:boron

ENV NODE_ENV production

WORKDIR /srv

COPY package.json .
RUN npm i

COPY . .
RUN npm run build-app

STOPSIGNAL SIGINT

EXPOSE 3000
EXPOSE 3001
EXPOSE 3002

ENTRYPOINT ["node"]
CMD ["./app"]