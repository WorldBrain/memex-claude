# Memex Plugin for Claude

This is the Claude plugin for [Memex.Garden](https://memex.garden), a bookmarking second brain for humans and agents.

You can save, transcribe, summarize and search anything you come across. Websites, notes, web highlights, YouTube, X, TikTok, Instagram, PDFs, Reddit or images. Here is our [Privacy Policy](https://memex.garden/privacy) and our [docs](https://docs.memex.garden).

## How to install

1. Download plugin: [Download](https://github.com/WorldBrain/memex-claude/raw/main/memex-garden-claude-plugin.zip)
2. Go to Claude's `Customize` tab
3. `Personal Plugins` > `+` icon > `Create Plugin` > `Upload Plugin`
4. Select the zip
5. Select `Memex Garden Plugin` > `Connectors` > `Connect`
6. Follow the OAuth flow
7. Optionally adjust tool permissions
8. You're done. You can now chat with Memex in your conversations.

## Example prompts

1. `Search my Memex library for pages about MCP authentication and summarize the top results.`
2. `Save https://docs.memex.garden/general/authentication into Memex, and tag it with #tutorials`

## Authentication

The default and recommended auth path for Memex is OAuth.

If you use Memex through Claude's connector UI, Claude connects to `https://api.memex.garden/mcp` and completes the Memex OAuth flow directly. In that flow, you do not paste API keys into Claude.

For a local Claude Code plugin checkout like this repo, you can still use the same Memex auth model by providing an OAuth bearer token:

```bash
export MEMEX_BEARER_TOKEN="YOUR_OAUTH_ACCESS_TOKEN"
```

The plugin also supports API keys as an optional alternative for local setups and testing:

```bash
export MEMEX_API_KEY="YOUR_MEMEX_API_KEY"
export MEMEX_USER_ID="YOUR_MEMEX_USER_ID"
```

Optional override:

```bash
export MEMEX_API_BASE_URL="https://api.memex.garden"
```

Auth precedence:

- `MEMEX_BEARER_TOKEN` is used first when present
- otherwise the plugin uses `MEMEX_API_KEY`
- `MEMEX_USER_ID` is optional
- `MEMEX_API_BASE_URL` defaults to `https://api.memex.garden`

Canonical auth docs:

- [Authentication](https://docs.memex.garden/general/authentication)

If you are using Claude's custom connector UI instead of the local Claude Code plugin flow, do not install this repo. Use the literal connector URL `https://api.memex.garden/mcp` and complete the OAuth flow there.

## Reviewer notes

Behavior and disclosures:

- The plugin sends Memex-authenticated requests to the hosted Memex MCP server and `POST /save-content-by-url`.
- The plugin does not bundle local model inference or a local MCP wrapper.
- The hook blocks prompt submission if URL auto-indexing fails.
- The skill is scoped to Memex library search and Memex URL saves.
- Memex OAuth is the default auth path for the hosted connector flow and the recommended path for local plugin use. API keys remain optional for local setups.
- The plugin relies on the same public Memex docs used by the hosted connector flow:
  - [Available endpoints](https://docs.memex.garden/general/available-endpoints)
  - [Response shape](https://docs.memex.garden/general/response-shape)
  - [Buy credits](https://docs.memex.garden/general/buy-credits)
