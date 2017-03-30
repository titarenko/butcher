FROM node:boron

ENV NODE_ENV production

WORKDIR /srv

COPY package.json .
RUN npm i

COPY . .

ENTRYPOINT ["node"]
CMD ["./bootstrapper"]