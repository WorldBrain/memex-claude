# Memex Plugin for Claude

This is the Claude plugin for [Memex.Garden](https://memex.garden), a bookmarking second brain for humans and agents.

You can save, transcribe, summarize and search anything you come across. Websites, notes, web highlights, YouTube, X, TikTok, Instagram, PDFs, Reddit or images. Here is our [Privacy Policy](https://memex.garden/privacy) and our [docs](https://docs.memex.garden).

## How to install

### Claude Code

Run these commands in Claude Code:

```text
/plugin marketplace add WorldBrain/memex-claude
/plugin install memex-garden@memex-plugins
/reload-plugins
```

Open `/mcp` and connect Memex with OAuth when prompted. Live handoffs require Node.js 22 or newer.

### Claude Desktop

1. [Download](https://github.com/WorldBrain/memex-claude/raw/main/memex-garden-claude-plugin.zip) plugin
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

## Live handoffs in Claude Code

The plugin bundles a local Realtime MCP and a Claude Code background monitor.
The first authenticated Memex operation automatically exchanges a short-lived,
single-use pairing ticket between the hosted OAuth connection and the local
MCP. No second login or separate enable command is required.
`/memex:enable-realtime-handoffs` remains available for explicit repair. The
local process then maintains a Supabase Realtime WebSocket, refreshes its
session, reconnects automatically, and forwards approved handoffs into
interactive Claude Code sessions. Durable handoff rows remain the source of
truth, so missed events can still be fetched later.

This requires Node.js 22 or newer on the machine running Claude Code. It does not require a separate Memex companion app. Claude web chat and Claude Code on the web currently allow on-demand use of the hosted handoff tools, but do not let a remote connector start an unsolicited cloud conversation.

## Authentication

Use OAuth when installing the Claude plugin through the upload flow above.

For local Claude Code plugin use, provide an OAuth bearer token:

```bash
export MEMEX_BEARER_TOKEN="YOUR_OAUTH_ACCESS_TOKEN"
```

You can also use an API key:

```bash
export MEMEX_API_KEY="YOUR_MEMEX_API_KEY"
export MEMEX_USER_ID="YOUR_MEMEX_USER_ID"
```

Optional override:

```bash
export MEMEX_API_BASE_URL="https://memex.garden/api"
```

Auth precedence:

- `MEMEX_BEARER_TOKEN` is used first when present
- otherwise the plugin uses `MEMEX_API_KEY`
- `MEMEX_USER_ID` is optional
- `MEMEX_API_BASE_URL` defaults to `https://memex.garden/api`

Auth docs:

- [Authentication](https://docs.memex.garden/general/authentication)

If Claude redirects to a `localhost` callback and Safari cannot connect, go back to Claude and retry the plugin connection. That callback is opened by Claude's local plugin OAuth flow and normally only works while Claude is waiting for the sign-in result.

## Docs

- [Available endpoints](https://docs.memex.garden/general/available-endpoints)
- [Response shape](https://docs.memex.garden/general/response-shape)
- [Buy credits](https://docs.memex.garden/general/buy-credits)
