import test from 'node:test';
import assert from 'node:assert/strict';
import {
  applyImport,
  createContact,
  filterAndSort,
  isSamePerson,
  normalizeContact,
  validateContact,
} from '../src/lib/contacts.js';

const method = (type, value, label) => ({ type, value, ...(label ? { label } : {}) });

function contact(overrides = {}) {
  return normalizeContact({
    name: '林晚',
    company: '澄野设计',
    title: '产品设计师',
    tags: ['设计', '客户'],
    favorite: false,
    methods: [method('phone', '13800138000'), method('email', 'wan@example.com')],
    ...overrides,
  });
}

test('normalizeContact keeps multiple methods and trims values', () => {
  const normalized = contact({
    methods: [
      method('phone', ' 13800138000 '),
      method('phone', '13900139000'),
      method('other', 'wan_design', '小红书'),
      method('email', ''),
    ],
  });
  assert.equal(normalized.methods.length, 3);
  assert.equal(normalized.methods[0].value, '13800138000');
  assert.equal(normalized.methods[2].label, '小红书');
  assert.equal(normalized.methods[2].type, 'other');
  assert.ok(normalized.id);
  assert.ok(normalized.createdAt);
});

test('validateContact reports required name and duplicate methods', () => {
  const errors = validateContact({
    name: ' ',
    methods: [
      { id: 'm1', type: 'phone', value: '13800138000' },
      { id: 'm2', type: 'phone', value: '138 0013 8000' },
      { id: 'm3', type: 'email', value: 'not-an-email' },
      { id: 'm4', type: 'phone', value: '' },
    ],
  });
  assert.equal(errors.name, '请填写姓名');
  assert.ok(errors.m2);
  assert.ok(errors.m3);
  assert.ok(errors.m4);
  assert.equal(errors.m1, undefined);
});

test('search matches names, tags and contact method values', () => {
  const contacts = [
    contact({ id: 'a', name: '林晚', company: '澄野设计', tags: ['设计'] }),
    contact({
      id: 'b',
      name: '陈屿',
      company: '南山实验室',
      title: '算法工程师',
      tags: ['技术'],
      methods: [method('phone', '13911882046')],
    }),
    contact({
      id: 'c',
      name: '苏禾',
      company: '自由摄影师',
      title: '商业摄影',
      tags: ['摄影'],
      favorite: true,
      methods: [method('wechat', 'suhe_studio')],
    }),
  ];
  assert.deepEqual(
    filterAndSort(contacts, { query: '设计' }).map((item) => item.name),
    ['林晚'],
  );
  assert.deepEqual(
    filterAndSort(contacts, { query: '13800138000' }).map((item) => item.name),
    ['林晚'],
  );
  assert.deepEqual(
    filterAndSort(contacts, { query: '摄影' }).map((item) => item.name),
    ['苏禾'],
  );
});

test('favorites are always sorted first', () => {
  const contacts = [
    contact({ id: 'a', name: '普通联系人', updatedAt: new Date(Date.now() - 1000).toISOString() }),
    contact({
      id: 'b',
      name: '收藏联系人',
      favorite: true,
      updatedAt: new Date(Date.now() - 100000).toISOString(),
    }),
  ];
  assert.deepEqual(
    filterAndSort(contacts, { sort: 'recent' }).map((item) => item.name),
    ['收藏联系人', '普通联系人'],
  );
  assert.deepEqual(
    filterAndSort(contacts, { scope: 'favorites' }).map((item) => item.name),
    ['收藏联系人'],
  );
  assert.deepEqual(
    filterAndSort(contacts, { tag: '设计' }).map((item) => item.name),
    ['收藏联系人', '普通联系人'],
  );
});

test('isSamePerson requires the same name and a shared phone or email', () => {
  const a = contact({ name: '林晚', methods: [method('phone', '138-0013-8000')] });
  const b = contact({ name: '林晚', methods: [method('phone', '13800138000')] });
  const c = contact({ name: '林晚', methods: [method('phone', '13900139000')] });
  const d = contact({ name: '林晚', methods: [method('email', 'wan@example.com')] });
  assert.equal(isSamePerson(a, b), true);
  assert.equal(isSamePerson(a, c), false);
  assert.equal(isSamePerson(a, d), false);
  assert.equal(isSamePerson(contact({ name: '陈屿', methods: [] }), contact({ name: '陈屿', methods: [] })), true);
  assert.equal(isSamePerson(a, contact({ name: '陈屿', methods: [method('phone', '13800138000')] })), false);
});

test('applyImport creates new contacts and merges duplicate rows', () => {
  const existing = [
    contact({
      id: 'existing',
      name: '林晚',
      favorite: true,
      methods: [method('phone', '13800138000'), method('email', 'wan@example.com')],
      createdAt: '2026-01-01T00:00:00.000Z',
    }),
  ];
  const imported = [
    {
      name: '林晚',
      company: '澄野设计',
      tags: ['设计', '老朋友'],
      favorite: null,
      methods: [method('phone', '13800138000'), method('phone', '13900139000')],
      note: '新的工作号码',
    },
    { name: '陈屿', tags: ['技术'], favorite: true, methods: [method('phone', '13911882046')] },
  ];
  const merged = applyImport(existing, imported, 'merge');
  assert.equal(merged.created, 1);
  assert.equal(merged.updated, 1);
  assert.equal(merged.skipped, 0);
  assert.equal(merged.contacts.length, 2);
  const lin = merged.contacts.find((item) => item.name === '林晚');
  assert.equal(lin.id, 'existing');
  assert.equal(lin.createdAt, '2026-01-01T00:00:00.000Z');
  assert.equal(lin.favorite, true);
  assert.deepEqual(lin.tags, ['设计', '客户', '老朋友']);
  assert.equal(lin.methods.length, 2);
  assert.equal(lin.note, '新的工作号码');

  const skipped = applyImport(existing, imported, 'skip');
  assert.equal(skipped.created, 1);
  assert.equal(skipped.updated, 0);
  assert.equal(skipped.skipped, 1);
  assert.deepEqual(skipped.skippedNames, ['林晚']);
  assert.equal(skipped.contacts.length, 2);
});

test('createContact assigns an id and timestamps', () => {
  const created = createContact({ name: '新朋友', methods: [method('phone', '13800138001')] });
  assert.ok(created.id);
  assert.ok(created.createdAt);
  assert.ok(created.updatedAt);
  assert.equal(created.name, '新朋友');
});
