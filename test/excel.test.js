import test from 'node:test';
import assert from 'node:assert/strict';
import XLSX from 'xlsx-js-style';
import {
  EXCEL_COLUMNS,
  buildTemplateWorkbook,
  buildWorkbook,
  contactToRow,
  parseImportBuffer,
} from '../src/lib/excel.js';
import { normalizeContact } from '../src/lib/contacts.js';

const method = (type, value, label) => ({ type, value, ...(label ? { label } : {}) });

function fixtureContact(overrides = {}) {
  return normalizeContact({
    id: 'fixture-1',
    name: '林晚',
    company: '澄野设计',
    title: '产品设计师',
    birthday: '1996-04-18',
    tags: ['设计', '客户'],
    favorite: true,
    note: '多行备注\n第二行',
    methods: [
      method('phone', '13800138000'),
      method('phone', '13900139000'),
      method('phone', '13700137000'),
      method('phone', '13600136000'),
      method('email', 'wan@example.com'),
      method('email', 'linwan@example.com'),
      method('email', 'third@example.com'),
      method('wechat', 'linwan_design'),
      method('wechat', 'linwan_backup'),
      method('qq', '12345678'),
      method('address', '上海市徐汇区安福路 288 号'),
      method('address', '杭州市西湖区转塘 7 号楼'),
      method('other', 'linwan_art', '小红书'),
      method('other', 'linwan_design', 'GitHub'),
    ],
    ...overrides,
  });
}

function workbookToBuffer(workbook) {
  return XLSX.write(workbook, { type: 'array', bookType: 'xlsx' });
}

test('export has one row per contact and one column per information type', () => {
  const { workbook, rows, count } = buildWorkbook([fixtureContact()], { favoritesOnly: false });
  assert.equal(count, 1);
  assert.equal(workbook.SheetNames[0], '通讯录');
  assert.equal(rows.length, 2);
  assert.deepEqual(rows[0], EXCEL_COLUMNS.map((column) => column.header));
  assert.equal(rows[1][0], '林晚');
  assert.equal(rows[1][5], '是');
  assert.equal(rows[1][6], '13800138000');
  assert.equal(rows[1][7], '13900139000');
  assert.equal(rows[1][8], '13700137000 / 13600136000');
  assert.equal(rows[1][9], 'wan@example.com');
  assert.equal(rows[1][10], 'linwan@example.com / third@example.com');
  assert.equal(rows[1][11], 'linwan_design / linwan_backup');
  assert.equal(rows[1][13], '上海市徐汇区安福路 288 号\n杭州市西湖区转塘 7 号楼');
  assert.equal(rows[1][14], '小红书: linwan_art\nGitHub: linwan_design');
});

test('export only favorites when asked', () => {
  const favorite = fixtureContact({ id: 'a', name: '林晚', favorite: true });
  const normal = fixtureContact({ id: 'b', name: '陈屿', favorite: false });
  const result = buildWorkbook([favorite, normal], { favoritesOnly: true });
  assert.equal(result.count, 1);
  assert.equal(result.rows.length, 2);
  assert.equal(result.rows[1][0], '林晚');
});

test('Excel round trip preserves phones, emails, labels, tags and favorite', () => {
  const original = fixtureContact();
  const { workbook } = buildWorkbook([original], { favoritesOnly: false });
  const parsed = parseImportBuffer(workbookToBuffer(workbook));
  assert.equal(parsed.errors.length, 0);
  assert.equal(parsed.contacts.length, 1);
  const imported = parsed.contacts[0];
  assert.equal(imported.name, '林晚');
  assert.equal(imported.favorite, true);
  assert.equal(imported.birthday, '1996-04-18');
  assert.deepEqual(imported.tags, ['设计', '客户']);
  assert.equal(imported.methods.filter((item) => item.type === 'phone').length, 4);
  assert.equal(imported.methods.filter((item) => item.type === 'email').length, 3);
  assert.equal(imported.methods.filter((item) => item.type === 'wechat').length, 2);
  assert.equal(imported.methods.filter((item) => item.type === 'address').length, 2);
  const others = imported.methods.filter((item) => item.type === 'other');
  assert.deepEqual(
    others.map((item) => `${item.label}:${item.value}`),
    ['小红书:linwan_art', 'GitHub:linwan_design'],
  );
  assert.equal(imported.note, '多行备注\n第二行');
});

test('import template can be parsed back', () => {
  const parsed = parseImportBuffer(workbookToBuffer(buildTemplateWorkbook()));
  assert.equal(parsed.contacts.length, 2);
  assert.equal(parsed.contacts[0].name, '示例·林晚');
  assert.equal(parsed.contacts[0].favorite, true);
  assert.ok(parsed.contacts[1].methods.length >= 3);
});

test('unknown headers are ignored and aliases are accepted', () => {
  const headers = ['Name', 'Company', 'Phone', 'E-mail', 'Bookmark', 'Tags', 'Unknown'];
  const worksheet = XLSX.utils.aoa_to_sheet([
    headers,
    ['Chen Yu', 'Nanshan Lab', '13911882046', 'yu@example.com', 'yes', '技术、同学', 'x'],
  ]);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
  const parsed = parseImportBuffer(workbookToBuffer(workbook));
  assert.equal(parsed.contacts.length, 1);
  assert.equal(parsed.contacts[0].name, 'Chen Yu');
  assert.equal(parsed.contacts[0].favorite, true);
  assert.equal(parsed.contacts[0].methods[0].value, '13911882046');
  assert.equal(parsed.contacts[0].methods[1].type, 'email');
});

test('invalid rows are reported without blocking valid rows', () => {
  const worksheet = XLSX.utils.aoa_to_sheet([
    ['姓名', '手机1', '邮箱1', '生日'],
    ['沈知微', '13800001234', 'zhiwei@example.com', 1997 / 1],
    ['', '13100000000', '', ''],
    ['潘越', '13500009999', 'not-an-email', '1998-07-21'],
  ]);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, '通讯录');
  const parsed = parseImportBuffer(workbookToBuffer(workbook));
  assert.equal(parsed.contacts.length, 2);
  assert.equal(parsed.errors.length, 2);
  assert.ok(parsed.errors.some((error) => error.row === 3 && error.message.includes('缺少姓名')));
  assert.ok(parsed.errors.some((error) => error.row === 4 && error.message.includes('邮箱')));
  assert.equal(parsed.contacts[1].methods.length, 1);
});

test('header can be below a title row', () => {
  const worksheet = XLSX.utils.aoa_to_sheet([
    ['我的通讯录'],
    [],
    ['姓名', '公司'],
    ['林晚', '澄野设计'],
  ]);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'S');
  const parsed = parseImportBuffer(workbookToBuffer(workbook));
  assert.equal(parsed.contacts.length, 1);
  assert.equal(parsed.contacts[0].company, '澄野设计');
});

test('workbook without a name header is rejected', () => {
  const worksheet = XLSX.utils.aoa_to_sheet([['公司', '手机'], ['澄野设计', '13800138000']]);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'S');
  assert.throws(() => parseImportBuffer(workbookToBuffer(workbook)), /姓名/);
});

test('formula-looking values are exported as text', () => {
  const contact = fixtureContact({ name: '=HYPERLINK("http://evil")' });
  const row = contactToRow(contact);
  assert.equal(row.name.startsWith("'"), true);
});
