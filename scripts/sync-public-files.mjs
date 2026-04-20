import { execFileSync } from 'node:child_process'
import { cp, mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises'
import os from 'node:os'
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

const DOWNLOAD_PATHS = [
    '.claude-plugin',
    '.mcp.json',
    'README.md',
    'LICENSE',
    'hooks',
    'scripts/index-user-prompt-urls.mjs',
    'skills',
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

async function buildDownloadZip() {
    const zipPath = path.join(repoRoot, 'memex-garden-claude-plugin.zip')
    const tempRoot = await mkdtemp(path.join(os.tmpdir(), 'memex-claude-zip-'))
    const stagingRoot = path.join(tempRoot, 'memex-claude')

    try {
        await mkdir(stagingRoot, { recursive: true })

        for (const relativePath of DOWNLOAD_PATHS) {
            await cp(
                path.join(repoRoot, relativePath),
                path.join(stagingRoot, relativePath),
                { recursive: true },
            )
        }

        await rm(zipPath, { force: true })
        execFileSync(
            'zip',
            ['-r', zipPath, 'memex-claude', '-x', '*.DS_Store'],
            {
                cwd: tempRoot,
                stdio: 'ignore',
            },
        )
    } finally {
        await rm(tempRoot, { recursive: true, force: true })
    }
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

    const releaseConfig = JSON.parse(
        await readFile(
            path.join(monorepoRoot, 'config', 'release-version.json'),
            'utf8',
        ),
    )
    const packageJsonPath = path.join(repoRoot, 'package.json')
    const packageJson = JSON.parse(await readFile(packageJsonPath, 'utf8'))

    packageJson.version = releaseConfig.claudePlugin.version

    await writeFile(packageJsonPath, `${JSON.stringify(packageJson, null, 4)}\n`)
    await buildDownloadZip()

    console.log(`Synced Claude plugin files from ${monorepoRoot}`)
}

await syncPublicFiles()
