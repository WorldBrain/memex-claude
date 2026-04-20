# Memex Claude Code plugin

This bundle is for Claude Code. It connects Claude Code to the hosted Memex MCP server instead of running a local wrapper.

## Public standalone repo

The public standalone review repo for this plugin is:

- `https://github.com/WorldBrain/memex-claude`

Claude reviewers and users who want the smallest self-contained checkout should use that repo.

## Download the plugin

[Download](https://github.com/WorldBrain/memex-claude/raw/main/memex-garden-claude-plugin.zip) the plugin.

## Install from the marketplace

The repo now exposes a Claude marketplace catalog at its root, so you can add it directly from GitHub:

```bash
claude plugin marketplace add WorldBrain/memex-v2
claude plugin install memex-garden@memex-plugins
```

To refresh the catalog later:

```bash
claude plugin marketplace update memex-plugins
```

If you are working from a local clone instead of GitHub, you can also test the marketplace locally:

```bash
claude plugin marketplace add /absolute/path/to/memex-v2
claude plugin install memex-garden@memex-plugins
```

If you are using Claude's custom connector UI, do not install this bundle. Use `https://api.memex.garden/mcp` as the connector URL and complete the OAuth flow described in the auth docs.

Do not paste the local `.mcp.json` value into Claude's web UI. Use the literal URL `https://api.memex.garden/mcp`.

## What it includes

- Hosted MCP server connection to `https://api.memex.garden/mcp`
- Memex tools:
    - `search_content`
    - `save_content_by_url`
- The bundled `memex-agent-skill`
- A bundled `UserPromptSubmit` hook that indexes every URL from the user's prompt into Memex before Claude continues

## Required credentials

See the canonical auth guide:

- `https://docs.memex.garden/general/authentication`

For the local Claude Code bundle, choose one auth mode before starting Claude Code.

API key mode:

```bash
export MEMEX_API_KEY="YOUR_MEMEX_API_KEY"
export MEMEX_USER_ID="YOUR_MEMEX_USER_ID" # optional
```

Bearer token mode:

```bash
export MEMEX_BEARER_TOKEN="YOUR_OAUTH_ACCESS_TOKEN"
```

Optional overrides:

```bash
export MEMEX_API_BASE_URL="https://api.memex.garden"
```

`MEMEX_BEARER_TOKEN` takes precedence over `MEMEX_API_KEY` if both are set.
`MEMEX_USER_ID` is optional. Memex can resolve the user from `MEMEX_API_KEY` when needed.
`MEMEX_API_BASE_URL` defaults to `https://api.memex.garden`.

## Run from a local checkout

From this repository:

```bash
claude --plugin-dir /absolute/path/to/memex-v2/memex-claude
```

Then run `/mcp` in Claude Code and confirm the `memex` server is connected.

If you installed through the marketplace, use `/plugin list` to confirm the plugin is enabled instead of launching Claude with `--plugin-dir`.

For the standalone public checkout instead:

```bash
claude --plugin-dir /absolute/path/to/memex-claude
```

## Notes

- The plugin's `.mcp.json` sends `Authorization: Bearer ...` when `MEMEX_BEARER_TOKEN` is set.
- Otherwise, the plugin uses `x-api-key` and optional `x-user-id` headers for the hosted MCP server.
- The bundled `UserPromptSubmit` hook follows the same precedence when calling `POST /save-content-by-url`.
- `search_content` now defaults to the compact search shape. Pass `raw: true` only when you need the richer machine-readable payload.
- Compact search responses return a `results` array with stable top-level fields plus optional `user_notes` and slim `media`. Raw responses preserve `referencesByResultId`, `referencedEntities`, and nested annotation `references`.
- Claude custom connectors use OAuth against the same `https://api.memex.garden/mcp` URL. They do not use this local bundle or its environment variables.
- In Claude's custom connector form, enter the literal URL `https://api.memex.garden/mcp` and leave OAuth client ID and secret blank. Memex supports Dynamic Client Registration.
- Raw MCP responses return the Memex payload in `result.structuredContent`.
- If the prompt contains one or more URLs, the bundled hook saves each URL through `POST /save-content-by-url` before Claude processes the prompt.
- If auto-indexing fails, the hook blocks the prompt so the workflow stays strict.
- No separate hook setup is required once the plugin is installed and enabled.
- Endpoint catalog: `https://docs.memex.garden/general/available-endpoints`
- Response contract: `https://docs.memex.garden/general/response-shape`
- Portable skill: `https://docs.memex.garden/for-agents/skill-md`
