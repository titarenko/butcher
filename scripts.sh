#!/bin/sh

set -e

DIR=$(dirname "$0")

COMMAND=$1

if [ "$COMMAND" = "start" ]; then

	npm run agent & \
	npm run web-app & \
	npm run engine

elif [ "$COMMAND" = "build" ]; then

	docker build --tag titarenko/butcher-agent $DIR/agent
	docker build --tag titarenko/butcher-dashboard $DIR/dashboard

elif [ "$COMMAND" = "run-agent" ]; then

	docker run \
		--volume /var/run/docker.sock:/var/run/docker.sock:ro \
		--volume /var/lib/butcher:/home/ev/.butcher \
		--detach \
		--env "BUTCHER_CONNECTION=$BUTCHER_CONNECTION" \
		--name butcher-agent \
		titarenko/butcher-agent
	docker logs --follow --timestamps butcher-agent

elif [ "$COMMAND" = "run" ]; then

	echo "TODO run"

fi