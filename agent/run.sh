#!/bin/sh

set -e

DIR=$(dirname "$0")

docker build --tag butcher/agent $DIR
docker run \
	--volume /var/run/docker.sock:/var/run/docker.sock:ro \
	--volume /var/lib/butcher:/home/ev/.butcher \
	--detach \
	--env "BUTCHER_CONNECTION=$BUTCHER_CONNECTION" \
	--name butcher-agent \
	butcher/agent
docker logs --follow --timestamps butcher-agent