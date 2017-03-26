create table events (
	id serial primary key,
	time timestamptz not null,
	ip text not null,
	headers jsonb not null,
	body jsonb not null
);

grant select, insert on events to butcher;
grant all on sequence events_id_seq to butcher; 