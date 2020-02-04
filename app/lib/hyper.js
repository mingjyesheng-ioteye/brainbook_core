import _get from 'lodash.get'

const WEBSITE_SCAFFOLD = {
  '/index.html': (info) => `<!doctype html5>
<html>
  <head>
    <meta charset="utf-8">
    <link rel="stylesheet" href="/index.css">
  </head>
  <body>
    <main>
      <h1>${info.title || 'New website'}</h1>
      <p>
        This website was created with <a href="https://beakerbrowser.com/" title="The Beaker Browser">The Beaker Browser</a>.
      </p>

      <hr>

      <p>
        Want to share this website with friends? Share the URL:
      </p>

      <p><a href="/" id="url"></a></p>

      <hr>

      <p>
        Learn more about how HTML works: <a href="https://developer.mozilla.org/en-US/docs/Learn/HTML/Introduction_to_HTML">MDN Introduction to HTML</a>.
      </p>
    </main>
    <script type="module" src="/index.js"></script>
  </body>
</html>
`,
  '/index.css': () => `body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  background: #fafafd;
}

main {
  max-width: 800px;
  margin: 0 auto;
  padding: 1rem 1.5rem;
  box-sizing: border-box;
  height: 100vh;
  background: #fff;
}

main h1 {
  margin: 2rem 0;
}

main hr {
  border: 0;
  border-top: 1px solid #ccd;
  margin: 2rem 0;
}
`,
  '/index.js': () => `console.log("Hello, world!")
document.getElementById('url').textContent = location.toString()
`
}

const MODULE_SCAFFOLD = {
  '/index.md': (info) => `# ${info.title || 'New Module'}\n\n${info.description}`,
  '/index.js': () => `export function hello (who = 'world') {\n  return \`hello \${who}\`\n}`,
  '/demo': 'folder',
  '/demo/index.html': () => `<h1>Demo</h1>
<div id="demo-container"></div>

<script type="module">
  import * as myModule from '../index.js'
  document.getElementById('demo-container').innerHTML = \`
    <h2><code>hello('friends') => '\${myModule.hello('friends')}'</code></h2>
  \`
</script>`,
  '/tests': 'folder',
  '/tests/index.html': () => `<link rel="stylesheet" href="/theme/vendor/mocha.css" />
<script src="/theme/vendor/chai.js"></script>
<script src="/theme/vendor/mocha.js"></script>

<div id="mocha"></div>

<script>
  mocha.setup('bdd')
  mocha.checkLeaks()
</script>
<script type="module" src="./index.js"></script>
<script>
  mocha.run()
</script>`,
  '/tests/index.js': () => `/**
* Define your tests here.
* 
* Reference:
*  - Mocha Test Runner: https://mochajs.org/
*  - Chai Assertion Library: https://www.chaijs.com/
*/

import * as myModule from '../index.js'

describe('My Module', () => {
  describe('hello()', () => {
    it('should accept an audience string', () => {
      chai.assert.equal(myModule.hello('friends'), 'hello friends')
    })
    it('should default to "world"', () => {
      chai.assert.equal(myModule.hello(), 'hello world')
    })
  })
})`
}

export const BUILTIN_TYPES = [
  {type: '', theme: '', title: 'Files Drive', img: 'files-drive'},
  {type: 'website', theme: '', title: 'Website', img: 'website', scaffold: WEBSITE_SCAFFOLD},
  {type: 'wiki', theme: 'builtin:simple-wiki', img: 'simple-wiki', title: 'Wiki Site'},
  {type: 'module', theme: 'builtin:simple-module', img: 'simple-module', title: 'Module', scaffold: MODULE_SCAFFOLD},
  {type: 'code-snippet', theme: 'builtin:code-snippet', img: 'code-snippet', title: 'Code Snippet'}
]

export const BUILTIN_THEMES = [
  {url: 'builtin:blogger', title: 'Blogger', manifest: {theme: {drive_types: 'user'}}},
  {url: 'builtin:simple-wiki', title: 'Simple Wiki', manifest: {theme: {drive_types: 'website'}}},
  {url: 'builtin:simple-module', title: 'Simple Module', manifest: {theme: {drive_types: 'module'}}}
]

export function filterThemeByType (manifest, targetType) {
  var matchingTypes = _get(manifest, 'theme.drive_types', undefined)
  if (!matchingTypes) return true
  matchingTypes = Array.isArray(matchingTypes) ? matchingTypes : [matchingTypes]
  for (let matchingType of matchingTypes) {
    if (matchingType === '*') return true
    if (!matchingType && !targetType) return true
    if (matchingType === targetType) return true
  }
  return false
}