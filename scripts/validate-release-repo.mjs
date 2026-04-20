import { access, readFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const REQUIRED_FILES = [
    '.claude-plugin/plugin.json',
    '.mcp.json',
    'README.md',
    'LICENSE',
    'hooks/hooks.json',
    'memex-garden-claude-plugin.zip',
    'scripts/index-user-prompt-urls.mjs',
    'skills/memex-agent-skill/SKILL.md',
]

const EXPECTED_REPOSITORY_URL = 'https://github.com/WorldBrain/memex-claude'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const repoRoot = path.resolve(__dirname, '..')

async function assertFileExists(relativePath) {
    await access(path.join(repoRoot, relativePath))
}

function assertSemver(version) {
    if (!/^\d+\.\d+\.\d+$/.test(version)) {
        throw new Error(`Plugin version must be x.y.z, received ${version}`)
    }
}

async function validate() {
    for (const relativePath of REQUIRED_FILES) {
        await assertFileExists(relativePath)
    }

    const pluginManifest = JSON.parse(
        await readFile(
            path.join(repoRoot, '.claude-plugin', 'plugin.json'),
            'utf8',
        ),
    )
    const packageJson = JSON.parse(
        await readFile(path.join(repoRoot, 'package.json'), 'utf8'),
    )
    assertSemver(pluginManifest.version)

    if (pluginManifest.repository !== EXPECTED_REPOSITORY_URL) {
        throw new Error(
            `Plugin repository must be ${EXPECTED_REPOSITORY_URL}, received ${pluginManifest.repository}`,
        )
    }

    if (packageJson.version !== pluginManifest.version) {
        throw new Error('package.json version must match .claude-plugin/plugin.json.')
    }

    console.log('Claude plugin release repo validation passed.')
}

await validate()
