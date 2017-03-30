#!/bin/sh

set -e

psql -U postgres -v ON_ERROR_STOP=1 << EndOfMessage

create user root with password '$PG_ROOT_PWD';
create user butcher with password '$PG_APP_PWD';

create database butcher template template0 owner root
	encoding 'utf8'
	lc_collate = 'en_US.UTF-8'
	lc_ctype = 'en_US.UTF-8';

\\connect butcher

set role root;

create table migrations (
	name text primary key,
	applied_at timestamptz not null default now()
);

grant connect on database butcher to butcher;

EndOfMessage