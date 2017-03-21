# butcher (WIP)

Simple node.js builds & deployments triggered by push to GitHub 

# How does it work

## When branch is pushed

1. Find and invoke matching `build` agent with `build` command
1. Once build is finished, find and invoke matching staging `agent` with `stage` command
1. Once release button is pressed (see dashboard), find and invoke matching `production` agent with `release` command

## When branch is deleted

1. Find and invoke matching `staging` agent with `clear` command

# How to install

## Setup agent

1. Set `BUTCHER_CONNECTION` environment variable to `role:password@host/[repository]`

part | meaning
--- | --- | ---
role | can be `build`, `staging` or `production`
password | something hard to guess
host | host with buther dashboard
repository | optional, if specified, agent will handle commands related to given repository only

1. Run agent (TODO specify how)

## Setup dashboard

1. Run dashboard (TODO specify how)

## Configure repository

Add `.butcher.js` to your repository:

```js
{
	// any command with any args

	build: ['./docker.sh', 'build'], 
	stage: ['./docker.sh', 'run'],
	release: ['./docker.sh', 'release'],
	clear: ['./docker.sh', 'clear'],
}
```

# License

MIT