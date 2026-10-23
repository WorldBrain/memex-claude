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

Open `/mcp` and connect Memex with OAuth when prompted. The plugin uses only the hosted Memex MCP; no local companion process or Node.js installation is required.

### Claude Desktop

1. [Download](https://github.com/WorldBrain/memex-claude/releases/latest/download/memex-claude.zip) plugin
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

Claude manages the hosted Memex connection through OAuth. No API keys, bearer-token exports, or user IDs are required.

In Claude Code, open `/mcp` and authenticate `plugin:memex-garden:memex`, or run:

```sh
claude mcp login plugin:memex-garden:memex
```

Start a new session after installing the plugin so Claude loads its tools. Saving URLs uses the authenticated Memex tools when requested; installing the plugin does not automatically upload URLs from your prompts.

## Data and permissions

The plugin connects only to the hosted Memex MCP at `https://memex.garden/api/mcp`. It sends the arguments of requested Memex operations and receives the matching results. Discovery names `read_action` for retrieval and `write_action` for changes; the server rejects an action sent to the wrong tool. Write tools declare that they modify data so Claude can ask for confirmation.

The skill supports library search, saving public URLs, tags, sharing links, feeds, and handoff operations when explicitly requested. Saved content and metadata are stored by Memex under its [Privacy Policy](https://memex.garden/privacy/). The plugin runs no local server, background monitor, or prompt-upload hook. Reading a URL in a prompt does not automatically save it.

Auth docs:

- [Authentication](https://docs.memex.garden/general/authentication)

If Claude redirects to a `localhost` callback and Safari cannot connect, go back to Claude and retry the plugin connection. That callback is opened by Claude's local plugin OAuth flow and normally only works while Claude is waiting for the sign-in result.

## Docs

- [Available endpoints](https://docs.memex.garden/general/available-endpoints)
- [Response shape](https://docs.memex.garden/general/response-shape)
- [Buy credits](https://docs.memex.garden/general/buy-credits)
