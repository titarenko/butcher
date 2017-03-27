#!/bin/sh

set -e

DIR=$(dirname "$0")

COMMAND=$1

if [ "$COMMAND" = "start" ]; then

	if [ ! "$(docker ps -a | grep butcher-pg)" ]; then
		docker build --tag titarenko/butcher-pg $DIR/app/sql
		docker run --detach --name butcher-pg titarenko/butcher-pg
	fi

	export BUTCHER_PG_HOST=$(docker inspect -f "{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}" butcher-pg)
	export NODE_ENV=development

	docker build --tag titarenko/butcher-migrator $DIR/app/sql/migrations
	if [ "$(docker ps -a | grep butcher-migrator)" ]; then
		docker rm -f butcher-migrator
	fi
	docker run \
		--detach \
		--restart on-failure \
		--env "PG=postgres://root:root@$BUTCHER_PG_HOST/butcher" \
		--env "NODE_ENV=$NODE_ENV" \
		--name butcher-migrator \
		titarenko/butcher-migrator

	export BUTCHER="token@localhost:3002"
	export BUTCHER_PG="postgres://butcher:butcher@$BUTCHER_PG_HOST/butcher"
	export BUTCHER_WEB_APP_SECRET="c37649ab-e42f-4527-a019-1e7a49dc05cf"
	export BUTCHER_GITHUB_SECRET="be411475-5024-41bd-866a-d98e9f0678e9"

	npm run app & npm run agent

elif [ "$COMMAND" = "build" ]; then

	docker build --tag titarenko/butcher-agent $DIR/agent
	docker build --tag titarenko/butcher-app $DIR/app

elif [ "$COMMAND" = "run-agent" ]; then

	docker run \
		--volume /var/run/docker.sock:/var/run/docker.sock:ro \
		--volume /var/lib/butcher:/home/ev/.butcher \
		--detach \
		--env "BUTCHER_CONNECTION=$BUTCHER_CONNECTION" \
		--name butcher-agent \
		titarenko/butcher-agent
	docker logs --follow --timestamps butcher-agent

elif [ "$COMMAND" = "run-app" ]; then

	echo "TODO run"

elif [ "$COMMAND" = "test" ]; then

	curl \
		-H "content-type: application/json" \
		-H "x-hub-signature: sha1=cf81e911ac98f52526f9f9f08d31d3049fd584f2" \
		-d "@ev.json" \
		-v \
		localhost:3000/api/events

fi