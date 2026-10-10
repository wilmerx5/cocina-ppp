const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');
const compiled = ts.transpileModule(fs.readFileSync(path.join(__dirname, '../src/lib/staffSocketSession.ts'), 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText;
const exported = {}; new Function('exports', compiled)(exported);
const install = exported.installStaffSocketSessionRecovery;
const tick = () => new Promise(resolve => setImmediate(resolve));
function fixture(refresh) {
 const handlers = new Map(); let connects = 0, lost = 0;
 const socket = { on: (event, fn) => handlers.set(event, fn), off: event => handlers.delete(event), connect: () => { connects++; } };
 const stop = install(socket, refresh, () => { lost++; });
 return { fire: (event, value) => handlers.get(event)?.(value), stop, stats: () => ({ connects, lost, listeners: handlers.size }) };
}
test('expired session refreshes and reconnects once', async () => {
 let calls=0;const f=fixture(async()=>{calls++;});
 f.fire('disconnect','io server disconnect');f.fire('connect_error',new Error('Unauthorized'));await tick();
 assert.equal(calls,1);assert.equal(f.stats().connects,1);assert.equal(f.stats().lost,0);
 f.fire('connect');f.fire('disconnect','io server disconnect');await tick();assert.equal(calls,2);
});
test('failed refresh asks for login without retrying credentials forever', async () => {
 let calls=0;const f=fixture(async()=>{calls++;throw new Error('expired');});
 f.fire('connect_error',new Error('Unauthorized'));await tick();
 assert.equal(calls,1);assert.equal(f.stats().connects,0);assert.equal(f.stats().lost,1);
});
test('a renewed session still denied staff access asks for login', async () => {
 let calls=0;const f=fixture(async()=>{calls++;});
 f.fire('connect_error',new Error('Unauthorized'));await tick();f.fire('connect_error',new Error('Unauthorized'));await tick();
 assert.equal(calls,1);assert.equal(f.stats().lost,1);
});
test('unmount during refresh prevents reconnection and removes listeners', async () => {
 let resolve;const f=fixture(()=>new Promise(r=>{resolve=r;}));
 f.fire('disconnect','io server disconnect');f.stop();resolve();await tick();
 assert.equal(f.stats().connects,0);assert.equal(f.stats().listeners,0);
});
test('transport failure does not refresh authentication', async () => {
 let calls=0;const f=fixture(async()=>{calls++;});
 f.fire('disconnect','transport close');f.fire('connect_error',new Error('network'));await tick();assert.equal(calls,0);
});
