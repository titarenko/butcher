FROM node:boron

ENV NODE_ENV production
ENV DEBIAN_FRONTEND noninteractive

RUN apt-get update && apt-get install -y apt-transport-https ca-certificates curl software-properties-common
RUN curl -fsSL https://download.docker.com/linux/debian/gpg | apt-key add -
RUN add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/debian jessie stable"
RUN apt-get update && apt-get install -y git docker-ce

WORKDIR /srv

RUN npm i bluebird totlog

COPY . .

STOPSIGNAL SIGINT

ENTRYPOINT ["node"]
CMD ["./index.js"]