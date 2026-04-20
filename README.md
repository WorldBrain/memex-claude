# Memex Claude Code plugin

This repository is the public standalone release and review repository for the Memex Claude Code plugin.

The canonical editable source still lives in [WorldBrain/memex-v2](https://github.com/WorldBrain/memex-v2). This repo exists so Claude reviewers and users can install, inspect, and validate the plugin without cloning the full monorepo.

## Install from this repo

Validate the repo directly:

```bash
claude plugin validate /absolute/path/to/claude-memex
```

## Run from a local checkout

```bash
claude --plugin-dir /absolute/path/to/claude-memex
```

Then run `/mcp` in Claude Code and confirm the `memex` server is connected.

## What the plugin does

This plugin connects Claude Code to the hosted Memex MCP server at `https://api.memex.garden/mcp`.

It includes:

- hosted Memex MCP access
- `search_content`
- `save_content_by_url`
- the bundled `memex-agent-skill`
- a `UserPromptSubmit` hook that indexes every URL from the user's prompt before Claude continues

## Required credentials

See the canonical auth guide:

- [Authentication](https://docs.memex.garden/general/authentication)

Choose one auth mode before starting Claude Code.

API key mode:

```bash
export MEMEX_API_KEY="YOUR_MEMEX_API_KEY"
export MEMEX_USER_ID="YOUR_MEMEX_USER_ID"
```

Bearer token mode:

```bash
export MEMEX_BEARER_TOKEN="YOUR_OAUTH_ACCESS_TOKEN"
```

Optional override:

```bash
export MEMEX_API_BASE_URL="https://api.memex.garden"
```

`MEMEX_BEARER_TOKEN` takes precedence over `MEMEX_API_KEY` if both are set. `MEMEX_USER_ID` is optional. `MEMEX_API_BASE_URL` defaults to `https://api.memex.garden`.

If you are using Claude's custom connector UI instead of the local Claude Code plugin flow, do not install this repo. Use the literal connector URL `https://api.memex.garden/mcp` and complete the OAuth flow there.

## Reviewer notes

Useful review prompts:

1. `Search my Memex library for pages about MCP authentication and summarize the top results.`
2. `Save https://docs.memex.garden/general/authentication into Memex, then confirm whether it was new or already indexed.`
3. `Search Memex for recent saved content about Claude plugins and return the source URLs you used.`

Behavior and disclosures:

- The plugin sends Memex-authenticated requests to the hosted Memex MCP server and `POST /save-content-by-url`.
- The plugin does not bundle local model inference or a local MCP wrapper.
- The hook blocks prompt submission if URL auto-indexing fails.
- The skill is scoped to Memex library search and Memex URL saves.
- The plugin relies on the same public Memex docs used by the hosted connector flow:
  - [Available endpoints](https://docs.memex.garden/general/available-endpoints)
  - [Response shape](https://docs.memex.garden/general/response-shape)
  - [Buy credits](https://docs.memex.garden/general/buy-credits)

## Release flow

This repo is intended to be synced automatically from `WorldBrain/memex-v2` whenever `master` changes there.

The public plugin files here are:

- `.claude-plugin/plugin.json`
- `.mcp.json`
- `hooks/`
- `scripts/index-user-prompt-urls.mjs`
- `skills/memex-agent-skill/`

If you need to sync from the monorepo manually:

```bash
node scripts/sync-public-files.mjs /absolute/path/to/memex-v2
```
