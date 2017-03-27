create table agents (
	id smallserial primary key,
	token text not null,

	stage text,
	repository text,
	branch text,

	name text,
	ip text,

	connected_at timestamptz,
	disconnected_at timestamptz
);

grant select, insert, update, delete on agents to butcher;
grant all on sequence agents_id_seq to butcher;