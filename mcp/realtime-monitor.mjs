#!/usr/bin/env node

import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import process from 'node:process'
import { Buffer } from 'node:buffer'
import { clearInterval, setInterval } from 'node:timers'

const stateDirectory =
    process.env.MEMEX_REALTIME_STATE_DIR ||
    process.env.CLAUDE_PLUGIN_DATA ||
    process.env.GROK_PLUGIN_DATA ||
    path.join(os.homedir(), '.memex', 'agent-plugin')
const eventsPath = path.join(stateDirectory, 'handoff-events.ndjson')

fs.mkdirSync(stateDirectory, { recursive: true, mode: 0o700 })
fs.closeSync(fs.openSync(eventsPath, 'a', 0o600))

let offset = fs.statSync(eventsPath).size
let pending = ''

function emitEvent(line) {
    try {
        const event = JSON.parse(line)
        if (event.type !== 'memex_handoff_ready' || !event.handoff) return
        process.stdout.write(
            `An approved Memex handoff is ready. Follow the Memex Process Handoffs runbook for this authenticated event: ${JSON.stringify(event.handoff)}\n`,
        )
    } catch (error) {
        process.stderr.write(`Ignored invalid Memex handoff event: ${error.message}\n`)
    }
}

function readNewEvents() {
    const size = fs.statSync(eventsPath).size
    if (size < offset) {
        offset = 0
        pending = ''
    }
    if (size === offset) return

    const length = size - offset
    const buffer = Buffer.alloc(length)
    const descriptor = fs.openSync(eventsPath, 'r')
    try {
        fs.readSync(descriptor, buffer, 0, length, offset)
    } finally {
        fs.closeSync(descriptor)
    }
    offset = size
    const lines = `${pending}${buffer.toString('utf8')}`.split('\n')
    pending = lines.pop() ?? ''
    for (const line of lines) {
        if (line.trim()) emitEvent(line)
    }
}

const timer = setInterval(() => {
    try {
        readNewEvents()
    } catch (error) {
        process.stderr.write(`Memex Realtime monitor error: ${error.message}\n`)
    }
}, 250)

function stop() {
    clearInterval(timer)
    process.exit(0)
}

process.on('SIGINT', stop)
process.on('SIGTERM', stop)
