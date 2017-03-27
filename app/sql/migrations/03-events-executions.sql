create table events (
	id serial primary key,
	time timestamptz not null,
	ip text not null,
	headers jsonb not null,
	body jsonb not null
);

grant select, insert on events to butcher;
grant all on sequence events_id_seq to butcher;

create table executions (
	id serial primary key,

	event_id int references events not null,
	branch_id smallint references branches not null,
	agent_id smallint references agents not null,

	command jsonb not null,
	feedback text,
	is_failed boolean,

	created_at timestamptz not null default now(),
	updated_at timestamptz,
	finished_at timestamptz
);

grant select, insert, update on executions to butcher;
grant all on sequence executions_id_seq to butcher;