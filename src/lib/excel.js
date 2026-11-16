import XLSX from 'xlsx-js-style';
import { newMethod } from './contacts.js';
import { splitTags, todayStamp } from './utils.js';

/**
 * Excel is the interchange format of this project. One contact is one row;
 * every information type has its own column. Multiple values in a single cell
 * use " / ", semicolons or newlines, so no information is lost when there are
 * more phones / emails than dedicated slots.
 */
export const EXCEL_COLUMNS = [
  { key: 'name', header: '姓名', width: 12, required: true },
  { key: 'company', header: '公司', width: 18 },
  { key: 'title', header: '职位', width: 16 },
  { key: 'birthday', header: '生日', width: 13 },
  { key: 'tags', header: '标签', width: 16 },
  { key: 'favorite', header: '收藏', width: 8 },
  { key: 'phone1', header: '手机1', width: 17 },
  { key: 'phone2', header: '手机2', width: 17 },
  { key: 'phone3', header: '手机3', width: 17 },
  { key: 'email1', header: '邮箱1', width: 26 },
  { key: 'email2', header: '邮箱2', width: 26 },
  { key: 'wechat', header: '微信', width: 16 },
  { key: 'qq', header: 'QQ', width: 14 },
  { key: 'address', header: '地址', width: 30 },
  { key: 'other', header: '其他', width: 24 },
  { key: 'note', header: '备注', width: 32 },
];

export const TEMPLATE_FILENAME = '联络簿_导入模板.xlsx';
export const MAX_IMPORT_BYTES = 8 * 1024 * 1024;
export const MAX_IMPORT_ROWS = 2000;

const HEADER_ALIASES = {
  name: ['姓名', '名字', '联系人', 'name', 'fullname', 'contact'],
  company: ['公司', '单位', '公司名称', 'company', 'organization', 'organisation'],
  title: ['职位', '职务', 'title', 'position', 'job'],
  birthday: ['生日', '出生日期', 'birthday', 'birth', 'dob'],
  tags: ['标签', '分组', 'tags', 'tag', 'group'],
  favorite: ['收藏', '星标', 'favorite', 'favourite', 'bookmark', 'starred'],
  phone1: ['手机1', '手机', '电话1', '电话号码', 'phone1', 'phone', 'mobile', 'mobile1', 'tel'],
  phone2: ['手机2', '电话2', 'phone2', 'mobile2', 'tel2'],
  phone3: ['手机3', '电话3', 'phone3', 'mobile3', 'tel3'],
  email1: ['邮箱1', '邮箱', '电子邮箱', 'email1', 'email', 'e-mail', 'mail'],
  email2: ['邮箱2', 'email2', 'e-mail2', 'mail2'],
  wechat: ['微信', '微信号', 'wechat', 'weixin'],
  qq: ['qq', 'qq号'],
  address: ['地址', '住址', 'address', 'location'],
  other: ['其他', '其它', 'other', 'misc', 'social'],
  note: ['备注', '说明', 'note', 'notes', 'remark'],
};

const ALIAS_TO_KEY = new Map();
Object.entries(HEADER_ALIASES).forEach(([key, aliases]) => {
  aliases.forEach((alias) => {
    ALIAS_TO_KEY.set(normalizeHeader(alias), key);
  });
});

const VALUE_SEPARATOR = /\s*[;；\n]\s*|\s+\/\s+/;

export function normalizeHeader(value) {
  return String(value ?? '')
    .trim()
    .toLowerCase()
    .replace(/[*＊]/g, '')
    .replace(/[（）()]/g, '')
    .replace(/[:：\s]/g, '');
}

function cleanCell(value) {
  if (value == null) return '';
  if (value instanceof Date) return formatDateValue(value);
  const text = String(value).trim();
  // Undo the formula-injection escape added by contactToRow.
  if (/^'[=+\-@]/.test(text)) return text.slice(1);
  return text;
}

export function formatDateValue(value) {
  if (value == null || value === '') return '';
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    const year = value.getUTCFullYear();
    const month = String(value.getUTCMonth() + 1).padStart(2, '0');
    const day = String(value.getUTCDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
  if (typeof value === 'number' && Number.isFinite(value)) {
    const parsed = XLSX.SSF.parse_date_code(value);
    if (parsed && parsed.y) {
      return `${parsed.y}-${String(parsed.m).padStart(2, '0')}-${String(parsed.d).padStart(2, '0')}`;
    }
  }
  const text = cleanCell(value);
  const match = text.match(/^(\d{4})[-/.年](\d{1,2})[-/.月](\d{1,2})日?$/);
  if (match) {
    return `${match[1]}-${String(match[2]).padStart(2, '0')}-${String(match[3]).padStart(2, '0')}`;
  }
  return text;
}

function parseFavorite(value) {
  const text = cleanCell(value).toLowerCase();
  if (!text) return null;
  if (/^(是|yes|y|true|1|收藏|★|⭐)$/.test(text)) return true;
  if (/^(否|no|n|false|0|不|—|-)$/.test(text)) return false;
  return null;
}

function splitValues(value) {
  return cleanCell(value)
    .split(VALUE_SEPARATOR)
    .map((part) => part.trim())
    .filter(Boolean);
}

function splitOther(value) {
  return cleanCell(value)
    .split(/\s*[;；\n]\s*/)
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => {
      const match = part.match(/^([^:：]{1,20})[:：]\s*(.+)$/);
      if (match) {
        return { label: match[1].trim(), value: match[2].trim() };
      }
      return { label: '其他', value: part };
    });
}

function makeMethod(type, value, label) {
  const method = newMethod(type);
  method.value = value;
  if (type === 'other' && label) method.label = label;
  return method;
}

/**
 * Parses an .xlsx/.xlsm buffer into rows of importable contacts.
 * Throws an Error with a human readable message for fatal workbook errors.
 */
export function parseImportBuffer(buffer) {
  if (!buffer || buffer.byteLength > MAX_IMPORT_BYTES) {
    throw new Error('文件不能超过 8 MB');
  }
  let workbook;
  try {
    workbook = XLSX.read(buffer, { type: 'array', cellDates: true });
  } catch {
    throw new Error('无法读取这个文件，请确认是 .xlsx 或 .xlsm 格式');
  }
  const sheetName = workbook.SheetNames[0];
  if (!sheetName) throw new Error('工作簿里没有工作表');
  const sheet = workbook.Sheets[sheetName];
  const matrix = XLSX.utils.sheet_to_json(sheet, {
    header: 1,
    raw: true,
    defval: '',
    blankrows: false,
  });

  if (!matrix.length) throw new Error('工作表是空的，找不到表头');

  // The header can sit under a title row; scan the first 10 rows for 姓名.
  let headerIndex = -1;
  let headerMap = null;
  for (let i = 0; i < Math.min(matrix.length, 10); i += 1) {
    const candidate = matrix[i] || [];
    const indexes = {};
    candidate.forEach((cell, columnIndex) => {
      const key = ALIAS_TO_KEY.get(normalizeHeader(cell));
      if (key && indexes[key] == null) indexes[key] = columnIndex;
    });
    if (indexes.name != null) {
      headerIndex = i;
      headerMap = indexes;
      break;
    }
  }

  if (headerIndex === -1 || !headerMap) {
    throw new Error('没有找到「姓名」列，请使用导入模板或检查表头');
  }

  const dataRows = matrix.slice(headerIndex + 1);
  if (dataRows.length > MAX_IMPORT_ROWS) {
    throw new Error(`单次最多导入 ${MAX_IMPORT_ROWS} 行`);
  }

  const contacts = [];
  const errors = [];
  let dataRowCount = 0;

  dataRows.forEach((row, index) => {
    if (!row || row.every((cell) => cleanCell(cell) === '')) return;
    dataRowCount += 1;
    const sheetRow = headerIndex + index + 2;
    const getCell = (key) => {
      const columnIndex = headerMap[key];
      return columnIndex == null ? '' : row[columnIndex];
    };

    const name = cleanCell(getCell('name'));
    if (!name) {
      errors.push({ row: sheetRow, message: '缺少姓名，整行已跳过' });
      return;
    }
    if (name.length > 80) {
      errors.push({ row: sheetRow, message: '姓名过长，整行已跳过' });
      return;
    }

    const methods = [];
    const seen = new Set();
    const push = (method) => {
      if (!method.value) return;
      const key = `${method.type}:${method.value.toLowerCase().replace(/\s+/g, '')}`;
      if (seen.has(key)) return;
      seen.add(key);
      methods.push(method);
    };

    ['phone1', 'phone2', 'phone3'].forEach((key) => {
      splitValues(getCell(key)).forEach((value) => {
        const digits = value.replace(/\D/g, '');
        if (digits.length >= 5) push(makeMethod('phone', value));
        else if (value) errors.push({ row: sheetRow, message: `电话号码「${value}」太短，已忽略` });
      });
    });

    ['email1', 'email2'].forEach((key) => {
      splitValues(getCell(key)).forEach((value) => {
        if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) push(makeMethod('email', value));
        else errors.push({ row: sheetRow, message: `邮箱「${value}」格式不正确，已忽略` });
      });
    });

    splitValues(getCell('wechat')).forEach((value) => push(makeMethod('wechat', value)));
    splitValues(getCell('qq')).forEach((value) => push(makeMethod('qq', value)));
    splitValues(getCell('address')).forEach((value) => push(makeMethod('address', value)));
    splitOther(getCell('other')).forEach(({ label, value }) => {
      push(makeMethod('other', value, label));
    });

    contacts.push({
      name,
      company: cleanCell(getCell('company')),
      title: cleanCell(getCell('title')),
      birthday: formatDateValue(getCell('birthday')),
      tags: splitTags(cleanCell(getCell('tags'))),
      favorite: parseFavorite(getCell('favorite')),
      note: cleanCell(getCell('note')),
      methods,
      sourceRow: sheetRow,
    });
  });

  return {
    contacts,
    errors,
    totalRows: dataRowCount,
    sheetName,
  };
}

function safeExcelString(value) {
  const text = String(value ?? '');
  // Prevent formula injection while still round-tripping the original string.
  if (/^[=+\-@]/.test(text)) return `'${text}`;
  return text;
}

function fold(values, slotCount) {
  const slots = values.slice(0, slotCount);
  if (values.length > slotCount) {
    slots[slotCount - 1] = values.slice(slotCount - 1).join(' / ');
  }
  return slots;
}

const DEFAULT_METHOD_LABELS = new Set(['其他', 'Other', 'other', '']);

export function contactToRow(contact) {
  const valuesOf = (type) =>
    (contact.methods || [])
      .filter((method) => method.type === type)
      .map((method) => method.value)
      .filter(Boolean);

  const phones = fold(valuesOf('phone'), 3);
  const emails = fold(valuesOf('email'), 2);
  const others = (contact.methods || [])
    .filter((method) => method.type === 'other')
    .map((method) =>
      DEFAULT_METHOD_LABELS.has(method.label)
        ? method.value
        : `${method.label}: ${method.value}`,
    );

  return {
    name: safeExcelString(contact.name),
    company: safeExcelString(contact.company),
    title: safeExcelString(contact.title),
    birthday: safeExcelString(contact.birthday),
    tags: safeExcelString((contact.tags || []).join('、')),
    favorite: contact.favorite ? '是' : '否',
    phone1: safeExcelString(phones[0] || ''),
    phone2: safeExcelString(phones[1] || ''),
    phone3: safeExcelString(phones[2] || ''),
    email1: safeExcelString(emails[0] || ''),
    email2: safeExcelString(emails[1] || ''),
    wechat: safeExcelString(valuesOf('wechat').join(' / ')),
    qq: safeExcelString(valuesOf('qq').join(' / ')),
    address: safeExcelString(valuesOf('address').join('\n')),
    other: safeExcelString(others.join('\n')),
    note: safeExcelString(contact.note),
  };
}

function borderStyle() {
  return {
    top: { style: 'thin', color: { rgb: 'E1D8C8' } },
    bottom: { style: 'thin', color: { rgb: 'E1D8C8' } },
    left: { style: 'thin', color: { rgb: 'E1D8C8' } },
    right: { style: 'thin', color: { rgb: 'E1D8C8' } },
  };
}

function applySheetLayout(worksheet, rowCount) {
  const lastRow = Math.max(rowCount + 1, 2);
  worksheet['!cols'] = EXCEL_COLUMNS.map((column) => ({ wch: column.width }));
  worksheet['!rows'] = [{ hpt: 30 }, ...Array.from({ length: rowCount }, () => ({ hpt: 25 }))];
  worksheet['!autofilter'] = {
    ref: `A1:${XLSX.utils.encode_col(EXCEL_COLUMNS.length - 1)}${lastRow}`,
  };
  worksheet['!freeze'] = { xSplit: 1, ySplit: 1 };

  EXCEL_COLUMNS.forEach((column, columnIndex) => {
    const headerCell = worksheet[XLSX.utils.encode_cell({ r: 0, c: columnIndex })];
    if (headerCell) {
      headerCell.s = {
        font: { name: 'Microsoft YaHei', sz: 11, bold: true, color: { rgb: 'FFFFFF' } },
        fill: { patternType: 'solid', fgColor: { rgb: '1F332E' } },
        alignment: { horizontal: 'center', vertical: 'center' },
        border: borderStyle(),
      };
    }
    for (let rowIndex = 1; rowIndex <= rowCount; rowIndex += 1) {
      const cell = worksheet[XLSX.utils.encode_cell({ r: rowIndex, c: columnIndex })];
      if (!cell) continue;
      cell.s = {
        font: { name: 'Microsoft YaHei', sz: 10.5, color: { rgb: '28352F' } },
        fill:
          rowIndex % 2 === 0
            ? { patternType: 'solid', fgColor: { rgb: 'FBF7EE' } }
            : { patternType: 'solid', fgColor: { rgb: 'FFFFFF' } },
        alignment: {
          vertical: 'center',
          horizontal: ['favorite', 'birthday', 'qq'].includes(column.key) ? 'center' : 'left',
          wrapText: ['address', 'note', 'other'].includes(column.key),
        },
        border: borderStyle(),
        ...(column.key === 'favorite'
          ? { font: { name: 'Microsoft YaHei', sz: 10.5, bold: true, color: { rgb: 'C15A3F' } } }
          : {}),
      };
    }
  });
}

export function buildWorkbook(contacts, { favoritesOnly = false } = {}) {
  const list = contacts.filter((contact) => (favoritesOnly ? contact.favorite : true));
  const rows = [EXCEL_COLUMNS.map((column) => column.header)];
  list.forEach((contact) => {
    const record = contactToRow(contact);
    rows.push(EXCEL_COLUMNS.map((column) => record[column.key] ?? ''));
  });
  const worksheet = XLSX.utils.aoa_to_sheet(rows);
  applySheetLayout(worksheet, list.length);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, '通讯录');
  workbook.Props = {
    Title: '联络簿通讯录',
    Subject: 'Contact Atlas export',
    Author: 'Liao Weibin (832402110)',
    CreatedDate: new Date(),
  };
  return { workbook, count: list.length, rows };
}

export function buildTemplateWorkbook() {
  const samples = [
    {
      name: '示例·林晚',
      company: '澄野设计',
      title: '产品设计师',
      birthday: '1996-04-18',
      tags: '设计、客户',
      favorite: '是',
      phone1: '13800138000',
      phone2: '021-62880312',
      phone3: '',
      email1: 'wan.lin@example.com',
      email2: '',
      wechat: 'linwan_design',
      qq: '',
      address: '上海市徐汇区安福路 288 号 502',
      other: '小红书: @林晚设计',
      note: '示例行，可以整行删除',
    },
    {
      name: '示例·陈屿',
      company: '南山实验室',
      title: '算法工程师',
      birthday: '1995-10-21',
      tags: '技术、同学',
      favorite: '否',
      phone1: '13911882046',
      phone2: '',
      phone3: '',
      email1: 'yu.chen@example.com',
      email2: 'chenyu.backup@example.com',
      wechat: 'chenyulab',
      qq: '1834220918',
      address: '深圳市南山区科技园 8 栋',
      other: 'GitHub: chenyulab',
      note: '',
    },
  ];
  const header = EXCEL_COLUMNS.map((column) => column.header);
  const rows = [header, ...samples.map((sample) => EXCEL_COLUMNS.map((column) => sample[column.key] ?? ''))];
  const worksheet = XLSX.utils.aoa_to_sheet(rows);
  applySheetLayout(worksheet, samples.length);

  const guideRows = [
    ['联络簿 · Contact Atlas 导入说明'],
    ['1. 只读取第一个工作表「通讯录」的表头，可保留示例行或替换为自己的联系人。'],
    ['2. 姓名必填；其余列都可以留空。'],
    ['3. 收藏列填写「是」或「否」，也支持 yes/no、true/false、1/0。'],
    ['4. 手机、邮箱有多个时，可用「 / 」、分号或换行分隔；超出列数的内容会自动折叠保存。'],
    ['5. 「其他」列可以写「平台: 账号」，例如「GitHub: octocat」，多个条目换行。'],
    ['6. 标签用「、」分隔；生日建议使用 yyyy-mm-dd 格式。'],
    ['7. 支持 .xlsx / .xlsm，文件最大 8 MB、单次最多 2000 行。'],
    ['8. 导入时可选择「合并更新」或「跳过重复」，重复判断依据是姓名 + 手机号或邮箱。'],
  ];
  const guide = XLSX.utils.aoa_to_sheet(guideRows);
  guide['!cols'] = [{ wch: 90 }];
  guide['!rows'] = guideRows.map((_, index) => ({ hpt: index === 0 ? 28 : 22 }));
  guide['A1'].s = {
    font: { name: 'Microsoft YaHei', sz: 14, bold: true, color: { rgb: '1F332E' } },
    alignment: { vertical: 'center' },
  };

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, '通讯录');
  XLSX.utils.book_append_sheet(workbook, guide, '填写说明');
  workbook.Props = {
    Title: '联络簿导入模板',
    Author: 'Liao Weibin (832402110)',
    CreatedDate: new Date(),
  };
  return workbook;
}

export function writeWorkbookFile(workbook, filename) {
  XLSX.writeFile(workbook, filename, { compression: true });
}

export function exportContactsFile(contacts, { favoritesOnly = false } = {}) {
  const { workbook, count } = buildWorkbook(contacts, { favoritesOnly });
  const filename = `联络簿_通讯录_${todayStamp()}.xlsx`;
  writeWorkbookFile(workbook, filename);
  return { filename, count };
}

export function downloadTemplateFile() {
  writeWorkbookFile(buildTemplateWorkbook(), TEMPLATE_FILENAME);
  return TEMPLATE_FILENAME;
}

export function columnSummary() {
  return EXCEL_COLUMNS.map(({ header, key, required }) => ({ header, key, required: Boolean(required) }));
}
