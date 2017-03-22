#!/bin/sh

COMMAND=$1

if [ "$COMMAND" = "start" ]; then

	npm run agent & \
	npm run web-app & \
	npm run engine

elif [ "$COMMAND" = "build" ]; then

	echo "TODO build"

fi