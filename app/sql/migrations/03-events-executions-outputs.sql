create table events (
	id serial primary key,
	occurred_at timestamptz not null,
	ip text not null,
	headers jsonb not null,
	body jsonb not null
);

comment on column events.headers is 'HTTP request headers';
comment on column events.body is 'HTTP request body';

grant select, insert on events to butcher;
grant all on sequence events_id_seq to butcher;

create table executions (
	id serial primary key,

	event_id int references events not null,
	branch_id smallint references branches not null,
	agent_id smallint references agents not null,

	command jsonb not null,
	exit_code int,

	started_at timestamptz not null,
	updated_at timestamptz,
	finished_at timestamptz,

	aborted_at timestamptz,
	error text
);

comment on column executions.error is 'reason why execution was aborted';

grant select, insert, update on executions to butcher;
grant all on sequence executions_id_seq to butcher;

create table outputs (
	id serial primary key,
	execution_id int references executions not null,
	occurred_at timestamptz not null,
	is_error boolean not null,
	content text not null,
);

grant select, insert on outputs to butcher;
grant all on sequence outputs_id_seq to butcher;