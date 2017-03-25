create table repositories (
	id smallserial primary key,
	name text not null,
	url text not null,
	ssh text not null,
	created_at timestamptz not null default now(),
	updated_at timestamptz,
	removed_at timestamptz
);

grant select, insert, update on repositories to butcher;
grant all on sequence repositories_id_seq to butcher;

create table branches (
	id smallserial primary key,
	repository_id smallint not null references repositories,
	name text not null,
	created_at timestamptz not null default now(),
	updated_at timestamptz,
	removed_at timestamptz
);

grant select, insert, update on branches to butcher;
grant all on sequence branches_id_seq to butcher;