import { cp, mkdir, rm } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const REQUIRED_PATHS = [
    ['memex-claude/.claude-plugin/plugin.json', '.claude-plugin/plugin.json'],
    ['memex-claude/.mcp.json', '.mcp.json'],
    ['memex-claude/hooks/hooks.json', 'hooks/hooks.json'],
    [
        'memex-claude/scripts/index-user-prompt-urls.mjs',
        'scripts/index-user-prompt-urls.mjs',
    ],
    [
        'memex-claude/skills/memex-agent-skill/SKILL.md',
        'skills/memex-agent-skill/SKILL.md',
    ],
]

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const repoRoot = path.resolve(__dirname, '..')

function resolveMonorepoRoot() {
    const candidate = process.argv[2] ?? process.env.MEMEX_MONOREPO_DIR

    if (!candidate) {
        throw new Error(
            'Pass the Memex monorepo path as the first argument or set MEMEX_MONOREPO_DIR.',
        )
    }

    return path.resolve(candidate)
}

async function syncPublicFiles() {
    const monorepoRoot = resolveMonorepoRoot()

    await rm(path.join(repoRoot, '.claude-plugin'), {
        recursive: true,
        force: true,
    })
    await rm(path.join(repoRoot, 'hooks'), {
        recursive: true,
        force: true,
    })
    await rm(path.join(repoRoot, 'skills'), {
        recursive: true,
        force: true,
    })

    for (const [sourceRelativePath, destinationRelativePath] of REQUIRED_PATHS) {
        const sourcePath = path.join(monorepoRoot, sourceRelativePath)
        const destinationPath = path.join(repoRoot, destinationRelativePath)

        await mkdir(path.dirname(destinationPath), { recursive: true })
        await cp(sourcePath, destinationPath, { recursive: true })
    }

    console.log(`Synced Claude plugin files from ${monorepoRoot}`)
}

await syncPublicFiles()
