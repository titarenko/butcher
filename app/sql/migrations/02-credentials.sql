create table credentials (
	id smallserial primary key,
	role text not null,
	password text not null,
	repository text,
	branch text
);

grant select on credentials to butcher;