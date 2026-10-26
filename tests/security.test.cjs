const test = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
const path = require('node:path');

test('external API markup stays text and does not enter innerHTML', async () => {
 const payload = '<img src=x onerror=alert(1)>';
 const nodes = { search: { value: 'City &units=metric', addEventListener() {} }, searchBtn: { addEventListener() {} }, result: { textContent: '', innerHTML: 'unchanged' } };
 let requestUrl;
 const context = { document: { getElementById(id) { return nodes[id]; } }, result: nodes.result, console, alert() {}, fetch: async url => { requestUrl = url; return { json: async () => ({ name: payload, weather: [{ description: payload }], main: { temp: 20 }, results: [{ name: nodes.search.value, skydescriptionlong: payload, tempc: 20 }] }) }; } };
 vm.createContext(context);
 vm.runInContext(fs.readFileSync(path.join(__dirname, '..', 'fetch.js'), 'utf8'), context);
 await vm.runInContext('search()', context);
 assert.equal(nodes.result.innerHTML, 'unchanged');
 assert.ok(nodes.result.textContent.includes(payload));

});
