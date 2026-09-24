/**
 * Minimal entry check for the built browser half. It executes `lib/client.js`
 * in a VM with a stub loader, then asserts the registration id, the plugin
 * module face, and the module-table requests the factory makes.
 */
import { readFile } from 'node:fs/promises'
import { createRequire } from 'node:module'
import vm from 'node:vm'

const require = createRequire(import.meta.url)
const packageName = require('../package.json').name
const clientPath = new URL('../lib/client.js', import.meta.url)
const source = await readFile(clientPath, 'utf8')

/** Fail the check with one actionable line. */
function check(condition, message) {
  if (!condition) throw new Error(`client entry check: ${message}`)
}

check(!/^\s*import\s/m.test(source), 'the bundle keeps a top-level ESM import')
check(!/^\s*export\s/m.test(source), 'the bundle keeps a top-level ESM export')

const registrations = []
const document = {
  head: { appendChild() {} },
  querySelector: () => null,
  createElement: () => ({ dataset: {}, textContent: '', remove() {} }),
}
const window = {
  __ModuleLoader__: { load: registration => { registrations.push(registration) } },
  matchMedia: () => ({ matches: false }),
}

vm.runInNewContext(source, { window, document, console }, { filename: 'lib/client.js' })

check(registrations.length === 1, `expected one loader registration, saw ${registrations.length}`)
const [registration] = registrations
check(registration.id === packageName, `registration id "${registration.id}" is not the package name "${packageName}"`)

const requested = []
const fakeRequire = (specifier) => {
  requested.push(specifier)
  if (specifier === 'react') {
    return {
      createElement: () => null,
      useState: value => [value, () => {}],
      useSyncExternalStore: (_subscribe, getSnapshot) => getSnapshot(),
    }
  }
  if (specifier === '@deepseek-ai/dsh-client-ui-primitives') return { Switch: () => null }
  throw new Error(`unexpected module-table request: ${specifier}`)
}

const face = registration.factory(fakeRequire)
check(face.name === 'reduce-effects', `plugin module name "${face.name}" is unexpected`)
const inject = [...face.inject].sort()
check(
  JSON.stringify(inject) === JSON.stringify(['configForms', 'locale', 'slots']),
  `inject list is ${JSON.stringify(inject)}`,
)
check(typeof face.apply === 'function', 'the plugin face exports no apply function')
check(
  requested.includes('react') && requested.includes('@deepseek-ai/dsh-client-ui-primitives'),
  `the factory resolved ${JSON.stringify(requested)}`,
)

console.log(`${packageName}: client entry check passed (${requested.join(', ')})`)
