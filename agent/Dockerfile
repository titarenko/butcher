FROM node:boron

WORKDIR /srv

RUN npm i totlog

COPY . .

STOPSIGNAL SIGINT

ENTRYPOINT ["node"]
CMD ["./index.js"]