---
name: enable-realtime-handoffs
description: Pair the Memex Claude plugin's local MCP with Supabase Realtime so approved Memex handoffs arrive live. The normal Memex skill performs this automatically; use this skill for explicit setup or repair.
---

# Enable Realtime handoffs

Use this skill only to pair the two MCP components bundled by the Memex plugin:

- `memex`: the hosted OAuth-authenticated MCP
- `memex-realtime`: the plugin-local MCP that owns the Supabase WebSocket

## Required runbook

1. Call the plugin-local `realtime_handoff_status` tool. Do not expose its session details.
2. If the status reports an existing pairing, preserve it. Do not create a new ticket.
3. Otherwise call the hosted Memex tool `create_realtime_handoff_connection_ticket` with `client: "memex_claude_plugin"`.
4. Immediately call the plugin-local `connect_realtime_handoffs` tool with the returned `ticket` and `exchangeUrl`. The ticket is single-use and expires after two minutes.
5. Do not print, summarize, or otherwise expose the ticket to the user.
6. Report the returned connection state and the number of approved pending handoffs found during the durable-queue catch-up.
7. If the hosted tool requests authentication, complete the Memex OAuth flow, start a new Claude session, and rerun `/memex:enable-realtime-handoffs`.
8. If the local tool is missing, tell the user to reinstall or update the Memex plugin and start a new Claude session. Do not ask them to install a companion application.

After successful pairing, the local MCP refreshes its Supabase session and reconnects automatically while Claude keeps the MCP process running. In interactive Claude Code sessions, the bundled monitor forwards live handoffs into Claude automatically. Realtime notifications are wake-up signals only; `public.handoffs` remains the durable source of truth.

## Host limitation

Claude web chat and Claude Code on the web do not currently expose a plugin API that lets a remote connector start an unsolicited cloud conversation. In those hosts, use the hosted handoff tools on demand. Automatic live delivery requires a host that runs the plugin's local MCP and monitor components.
