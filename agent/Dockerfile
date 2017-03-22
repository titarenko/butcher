FROM node:boron

ENV NODE_ENV production
ENV DEBIAN_FRONTEND noninteractive

RUN apt-get install -y git

RUN curl -fsSLO https://get.docker.com/builds/Linux/x86_64/docker-17.03.0-ce.tgz && \
	tar --strip-components=1 -xvzf docker-17.03.0-ce.tgz -C /usr/local/bin

WORKDIR /srv

RUN npm i bluebird totlog

COPY . .

STOPSIGNAL SIGINT

ENTRYPOINT ["node"]
CMD ["./index.js"]