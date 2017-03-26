create table executions (
	id serial primary key,
	branch_id int references branches not null,
	command jsonb not null,
	feedback text,
	created_at timestamptz not null default now(),
	updated_at timestamptz,
	finished_at timestamptz
);

grant select, insert, update on executions to butcher;
grant all on sequence executions_id_seq to butcher;