#!/bin/sh

set -e

DIR=$(dirname "$0")

COMMAND=$1

if [ "$COMMAND" = "start" ]; then

	docker build --tag titarenko/butcher-pg $DIR/app/sql
	docker stop butcher-pg || true && docker rm butcher-pg || true
	docker run --detach --name butcher-pg titarenko/butcher-pg

	BUTCHER_PG_HOST=$(docker inspect -f "{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}" butcher-pg)

	export BUTCHER_PG="postgres://butcher:butcher@$BUTCHER_PG_HOST/butcher"
	export BUTCHER_WEB_APP_SECRET="c37649ab-e42f-4527-a019-1e7a49dc05cf"
	export BUTCHER_GITHUB_SECRET="be411475-5024-41bd-866a-d98e9f0678e9"

	export NODE_ENV=development

	npm run agent & npm run web-app

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

fi