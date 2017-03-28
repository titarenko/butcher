create table agents (
	id smallserial primary key,
	token text not null,

	stage text,
	repository text,
	branch text,

	name text,
	ip text,

	created_at timestamptz not null,
	updated_at timestamptz,
	removed_at timestamptz,

	connected_at timestamptz,
	disconnected_at timestamptz
);

create unique index agents_token_unique on agents (token) where removed_at is null; 

grant select, insert, update, delete on agents to butcher;
grant all on sequence agents_id_seq to butcher;