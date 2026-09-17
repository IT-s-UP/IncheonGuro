const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');
test('member course storage isolates accounts and clears only the withdrawn account', () => {
  const data = {};
  const storage = new Proxy({
    getItem: key => data[key] ?? null,
    setItem: (key, value) => { data[key] = value; },
    removeItem: key => { delete data[key]; },
  }, { ownKeys: () => Object.keys(data), getOwnPropertyDescriptor: () => ({ enumerable: true, configurable: true }) });
  const context = { exports: {}, localStorage: storage };
  vm.runInNewContext(ts.transpileModule(fs.readFileSync('src/auth/accountStorage.ts', 'utf8'),
    { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText, context);
  const { accountStorage, setStorageMember, clearMemberStorage } = context.exports;
  storage.setItem('incheonguro-my-courses', 'legacy must not be imported');
  assert.equal(accountStorage.getItem('incheonguro-my-courses'), null);
  setStorageMember('1');
  assert.equal(accountStorage.getItem('incheonguro-my-courses'), null);
  accountStorage.setItem('incheonguro-my-courses', 'owner course');
  setStorageMember('2');
  assert.equal(accountStorage.getItem('incheonguro-my-courses'), null);
  accountStorage.setItem('incheonguro-my-courses', 'other course');
  setStorageMember('1');
  assert.equal(accountStorage.getItem('incheonguro-my-courses'), 'owner course');
  clearMemberStorage();
  assert.equal(accountStorage.getItem('incheonguro-my-courses'), null);
  setStorageMember('3');
  assert.equal(accountStorage.getItem('incheonguro-my-courses'), null);
  setStorageMember('2');
  assert.equal(accountStorage.getItem('incheonguro-my-courses'), 'other course');
});
