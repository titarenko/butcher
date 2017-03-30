#!/bin/bash

set -e

SUBJECT=${1:-"app"}

if [ "$SUBJECT" = "app" ]; then

	#########
	# input #
	#########

	if [ ! \( "$BUTCHER_PG_ROOT_PWD" -a "$BUTCHER_PG_APP_PWD" -a "$BUTCHER_WEB_APP_SECRET" \) ]; then
		read -s -p "enter master password: " master_pwd
		echo -e "\n"
	fi

	PG_ROOT_PWD=${BUTCHER_PG_ROOT_PWD:-"`echo "81feb854f8e9497880a2c26605f813f2$master_pwd" | md5sum | cut -d ' ' -f 1`"}
	PG_APP_PWD=${BUTCHER_PG_APP_PWD:-"`echo "3e34638679de409199a79710331313e9$master_pwd" | md5sum | cut -d ' ' -f 1`"}
	WEB_APP_SECRET=${BUTCHER_WEB_APP_SECRET:-"`echo "f31f54e5fb84450fb3ce572e0326f87f$master_pwd" | md5sum | cut -d ' ' -f 1`"}
	WEB_APP_CERT_PATH=${BUTCHER_WEB_APP_CERT_PATH}

	if [ ! $WEB_APP_CERT_PATH ]; then
		candidates=(/etc/letsencrypt/archive/*)
		if [ ${#candidates[@]} -eq 1 ]; then
			WEB_APP_CERT_PATH=${candidates[0]}
		else
			read -p "enter domain name: " domain
			WEB_APP_CERT_PATH=/etc/letsencrypt/archive/$domain
		fi
	fi

	ENGINE_APP_PORT=${BUTCHER_ENGINE_APP_PORT:-"703"}

	######
	# DB #
	######

	if [ ! "$(docker ps -a | grep butcher-pg)" ]; then
		docker run \
			--detach \
			--restart always
			--env "PG_ROOT_PWD=$PG_ROOT_PWD"
			--env "PG_APP_PWD=$PG_APP_PWD"
			--volume "/var/lib/butcher-pg:/var/lib/butcher-pg"
			--name butcher-pg \
			titarenko/butcher-pg
	fi
	PG_HOST=$(docker inspect -f "{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}" butcher-pg)

	if [ "$(docker ps -a | grep butcher-migrator)" ]; then
		docker rm -f butcher-migrator
	fi
	docker run \
		--restart on-failure \
		--env "PG=postgres://root:$PG_ROOT_PWD@$PG_HOST/butcher" \
		--env "NODE_ENV=production" \
		--name butcher-migrator \
		titarenko/butcher-migrator

	ADMIN_PWD=$BUTCHER_ADMIN_PWD
	if [ ! "$ADMIN_PWD" ]; then
		read -p "enter admin password: " ADMIN_PWD
	fi
	docker run
		--env "ADMIN_NAME=admin"
		--env "ADMIN_PWD=$ADMIN_PWD"
		--name butcher-bootstrapper
		titarenko/butcher-bootstrapper

	#######
	# app #
	#######

	if [ "$(docker ps -a | grep butcher)" ]; then
		docker rm -f butcher
	fi
	docker run \
		--detach
		--restart always \
		--env "PG=postgres://butcher:$PG_APP_PWD@$PG_HOST/butcher" \
		--env "WEB_APP_SECRET=$WEB_APP_SECRET" \
		--publish "80:3000"
		--publish "443:3001"
		--publish "$ENGINE_APP_PORT:3002"
		--volume "$WEB_APP_CERT_PATH:/etc/letsencrypt:ro"
		--volume "/var/run/docker.sock:/var/run/docker.sock:ro"
		--name butcher \
		titarenko/butcher

elif [ "$SUBJECT" = "agent" ]; then

	BUTCHER_CONNECTION=$BUTCHER_CONNECTION
	if [ ! "$BUTCHER_CONNECTION" ]; then
		read -p "enter connection string (token@host:port): " BUTCHER_CONNECTION
	fi
	BUTCHER_HOME=${BUTCHER_HOME:-"/var/lib/butcher"}

	if [ "$(docker ps -a | grep butcher-agent)" ]; then
		docker rm -f butcher-agent
	fi
	docker run \
		--detach \
		--restart always \
		--env "BUTCHER_CONNECTION=$BUTCHER_CONNECTION" \
		--env "BUTCHER_HOME=$BUTCHER_HOME" \
		--name butcher-agent \
		titarenko/butcher-agent

fi

echo "done!"