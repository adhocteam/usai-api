#!/usr/bin/env node
/**
 * Security audit gate with documented exceptions.
 *
 * Runs `npm audit --json` and fails if any high/critical advisory is found,
 * unless the advisory's GHSA ID is allowlisted in `.audit-allowlist.json`.
 * Allowlist entries must document a reason and may set an `expires` date
 * (YYYY-MM-DD); expired entries fail the gate to force re-review.
 *
 * Accepted exceptions are documented in SECURITY.md under
 * "Known Accepted Vulnerabilities".
 *
 * Usage: npm run audit:check
 */
const { execSync } = require('child_process')
const fs = require('fs')
const path = require('path')

const root = path.resolve(__dirname, '..')
const allowlistPath = path.join(root, '.audit-allowlist.json')
const allowlist = fs.existsSync(allowlistPath)
  ? JSON.parse(fs.readFileSync(allowlistPath, 'utf8'))
  : []

let raw
try {
  raw = execSync('npm audit --json', {
    cwd: root,
    maxBuffer: 64 * 1024 * 1024,
  }).toString()
} catch (err) {
  // npm audit exits non-zero when vulnerabilities exist; the JSON report
  // is still written to stdout.
  if (!err.stdout) throw err
  raw = err.stdout.toString()
}
const report = JSON.parse(raw)

const GATED_SEVERITIES = ['high', 'critical']

// Collect root advisories (objects in `via`); cascading entries reference
// these roots by name, so gating the roots covers the full dependency chain.
const advisories = new Map()
for (const vuln of Object.values(report.vulnerabilities || {})) {
  for (const via of vuln.via || []) {
    if (typeof via === 'object' && GATED_SEVERITIES.includes(via.severity)) {
      const ghsa = via.url ? via.url.split('/').pop() : String(via.source)
      advisories.set(ghsa, via)
    }
  }
}

const today = new Date().toISOString().slice(0, 10)
const failures = []
for (const [ghsa, adv] of advisories) {
  const label = `${ghsa} (${adv.severity}) in ${adv.name}: ${adv.title}`
  const entry = allowlist.find((e) => e.ghsa === ghsa)
  if (!entry) {
    failures.push(`${label} — not allowlisted`)
  } else if (entry.expires && entry.expires < today) {
    failures.push(
      `${label} — allowlist entry expired ${entry.expires}; re-review required`
    )
  } else {
    console.log(`⚠️  Accepted (allowlisted until ${entry.expires || 'n/a'}): ${label}`)
    console.log(`    Reason: ${entry.reason}`)
  }
}

if (failures.length > 0) {
  console.error('❌ Unaccepted high/critical vulnerabilities found:')
  for (const failure of failures) {
    console.error(`  - ${failure}`)
  }
  console.error(
    'Fix the vulnerability, or add a documented exception to .audit-allowlist.json and SECURITY.md.'
  )
  process.exit(1)
}

console.log('✅ No unaccepted high/critical vulnerabilities')
