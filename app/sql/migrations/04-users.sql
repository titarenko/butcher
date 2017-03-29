create table users (
	id smallserial primary key,
	name text not null,
	password_hash text not null,
	roles smallint[] not null
);

create unique index users_name_unique on users (name);

grant select on users to butcher;