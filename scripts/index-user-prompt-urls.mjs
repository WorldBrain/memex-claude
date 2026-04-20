import process from 'node:process'

const DEFAULT_API_BASE_URL = 'https://api.memex.garden'
const TRAILING_PUNCTUATION = /[),.;!?]+$/
const URL_PATTERN = /https?:\/\/[^\s<>"'`]+/gi

function readStdin() {
    return new Promise((resolve, reject) => {
        let data = ''
        process.stdin.setEncoding('utf8')
        process.stdin.on('data', (chunk) => {
            data += chunk
        })
        process.stdin.on('end', () => resolve(data))
        process.stdin.on('error', reject)
    })
}

function trimTrailingPunctuation(url) {
    let cleaned = url
    while (TRAILING_PUNCTUATION.test(cleaned)) {
        cleaned = cleaned.replace(TRAILING_PUNCTUATION, '')
    }
    return cleaned
}

function extractUrls(prompt) {
    const matches = prompt.match(URL_PATTERN) ?? []
    const deduped = new Set()

    for (const match of matches) {
        const candidate = trimTrailingPunctuation(match.trim())
        try {
            const parsed = new URL(candidate)
            deduped.add(parsed.toString())
        } catch {
            continue
        }
    }

    return [...deduped]
}

function getApiBaseUrl() {
    const explicitBaseUrl =
        process.env.MEMEX_API_BASE_URL?.trim() ||
        process.env.MEMEX_API_URL?.trim()
    if (explicitBaseUrl) {
        return explicitBaseUrl.replace(/\/$/, '')
    }

    const mcpUrl = process.env.MEMEX_MCP_URL?.trim()
    if (mcpUrl) {
        return mcpUrl.replace(/\/mcp\/?$/, '').replace(/\/$/, '')
    }

    return DEFAULT_API_BASE_URL
}

function writeDecision(payload) {
    process.stdout.write(JSON.stringify(payload))
    process.exit(0)
}

function block(reason) {
    writeDecision({
        decision: 'block',
        reason,
    })
}

function allowWithContext(additionalContext) {
    writeDecision({
        hookSpecificOutput: {
            hookEventName: 'UserPromptSubmit',
            additionalContext,
        },
    })
}

function getAuthHeaders() {
    const bearerToken = process.env.MEMEX_BEARER_TOKEN?.trim()
    if (bearerToken) {
        return {
            headers: {
                Authorization: `Bearer ${bearerToken}`,
            },
            authDescription: 'MEMEX_BEARER_TOKEN',
        }
    }

    const apiKey = process.env.MEMEX_API_KEY?.trim()
    if (!apiKey) {
        return null
    }

    const userId = process.env.MEMEX_USER_ID?.trim()

    return {
        headers: {
            ...(userId ? { 'x-user-id': userId } : {}),
            'x-api-key': apiKey,
        },
        authDescription: userId
            ? 'MEMEX_USER_ID and MEMEX_API_KEY'
            : 'MEMEX_API_KEY',
    }
}

async function saveUrl({ apiBaseUrl, authHeaders, url }) {
    const response = await fetch(`${apiBaseUrl}/save-content-by-url`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            ...authHeaders,
        },
        body: JSON.stringify({ url }),
    })

    const text = await response.text()
    let payload
    try {
        payload = text ? JSON.parse(text) : null
    } catch {
        payload = text
    }

    if (!response.ok) {
        const errorMessage =
            typeof payload === 'object' && payload !== null
                ? payload.error || payload.message || JSON.stringify(payload)
                : String(payload || `HTTP ${response.status}`)

        throw new Error(errorMessage)
    }

    return payload
}

async function main() {
    const rawInput = await readStdin()
    const hookInput = rawInput ? JSON.parse(rawInput) : {}
    const prompt = typeof hookInput.prompt === 'string' ? hookInput.prompt : ''
    const urls = extractUrls(prompt)

    if (urls.length === 0) {
        return
    }

    const auth = getAuthHeaders()

    if (!auth) {
        block(
            'Memex URL auto-indexing is enabled, but no supported Memex credentials were found. Export MEMEX_BEARER_TOKEN or MEMEX_API_KEY, then retry the prompt.',
        )
    }

    const apiBaseUrl = getApiBaseUrl()
    const failures = []
    const indexed = []

    for (const url of urls) {
        try {
            const result = await saveUrl({
                apiBaseUrl,
                authHeaders: auth.headers,
                url,
            })
            indexed.push({
                url,
                isNew:
                    typeof result === 'object' &&
                    result !== null &&
                    'isNew' in result
                        ? result.isNew === true
                        : undefined,
            })
        } catch (error) {
            failures.push({
                url,
                error: error instanceof Error ? error.message : String(error),
            })
        }
    }

    if (failures.length > 0) {
        const failureText = failures
            .map((failure) => `${failure.url}: ${failure.error}`)
            .join('\n')

        block(
            `Memex URL auto-indexing failed. The prompt was not sent to Claude.\n${failureText}`,
        )
    }

    const summary = indexed
        .map((item) =>
            item.isNew === false ? `${item.url} (already indexed)` : item.url,
        )
        .join('\n- ')

    allowWithContext(
        `Memex auto-indexed these URLs before processing the user's prompt using ${auth.authDescription}:\n- ${summary}`,
    )
}

main().catch((error) => {
    const reason =
        error instanceof Error ? error.message : 'Unknown Memex indexing error'
    block(`Memex URL auto-indexing failed before prompt processing: ${reason}`)
})
