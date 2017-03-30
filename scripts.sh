#!/bin/sh

set -e

DIR=$(dirname "$0")

COMMAND=$1

if [ "$COMMAND" = "start" ]; then

	export NODE_ENV=development

	if [ ! "$(docker ps -a | grep butcher-pg)" ]; then
		docker build --tag titarenko/butcher-pg -f ./app/sql/Dockerfile $DIR
		docker run \
			--detach \
			--env "PG_ROOT_PWD=root" \
			--env "PG_APP_PWD=butcher" \
			--name butcher-pg \
			titarenko/butcher-pg
	fi
	PG_HOST=$(docker inspect -f "{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}" butcher-pg)

	docker build --tag titarenko/butcher-migrator -f ./app/sql/migrations/Dockerfile $DIR
	if [ "$(docker ps -a | grep butcher-migrator)" ]; then
		docker rm -f butcher-migrator
	fi
	docker run \
		--detach \
		--restart on-failure \
		--env "PG=postgres://root:root@$PG_HOST/butcher" \
		--env "NODE_ENV=$NODE_ENV" \
		--name butcher-migrator \
		titarenko/butcher-migrator

	export BUTCHER_CONNECTION="token@localhost:3002"
	export BUTCHER_HOME="/var/lib/butcher"
	export PG="postgres://butcher:butcher@$PG_HOST/butcher"
	export WEB_APP_SECRET="c37649ab-e42f-4527-a019-1e7a49dc05cf"

	npm run app & npm run agent

elif [ "$COMMAND" = "release" ]; then

	docker build --tag titarenko/butcher-agent $DIR/agent

	docker build --tag titarenko/butcher-pg -f ./app/sql/Dockerfile $DIR
	docker build --tag titarenko/butcher-migrator -f ./app/sql/migrations/Dockerfile $DIR

	docker build --tag titarenko/butcher-app -f ./app/Dockerfile $DIR
	docker build --tag titarenko/butcher-bootstrapper -f ./app/bootstrapper/Dockerfile $DIR

	docker push titarenko/butcher-agent

	docker push titarenko/butcher-pg
	docker push titarenko/butcher-migrator

	docker push titarenko/butcher-app
	docker push titarenko/butcher-bootstrapper

elif [ "$COMMAND" = "test" ]; then

	curl \
		-H "content-type: application/json" \
		-H "x-hub-signature: sha1=cf81e911ac98f52526f9f9f08d31d3049fd584f2" \
		-d "@ev.json" \
		-v \
		localhost:3000/api/events

fi