create table repositories (
	id smallserial primary key,

	name text not null,
	secret text not null,
	script text not null,

	created_at timestamptz not null,
	updated_at timestamptz,
	removed_at timestamptz
);

create unique index repositories_name_unique on repositories (name) where removed_at is null;

grant select, insert, update on repositories to butcher;
grant all on sequence repositories_id_seq to butcher;

create table branches (
	id smallserial primary key,

	repository_id smallint references repositories not null,
	name text not null,

	created_at timestamptz not null,
	updated_at timestamptz,
	removed_at timestamptz
);

create unique index branches_name_unique on branches (name) where removed_at is null;

grant select, insert, update on branches to butcher;
grant all on sequence branches_id_seq to butcher;