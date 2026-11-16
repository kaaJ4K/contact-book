import { initials, splitTags, uid } from './utils.js';

export const METHOD_TYPES = [
  {
    type: 'phone',
    label: '手机',
    icon: 'phone',
    placeholder: '138 0000 0000',
    inputMode: 'tel',
  },
  {
    type: 'email',
    label: '邮箱',
    icon: 'mail',
    placeholder: 'name@example.com',
    inputMode: 'email',
  },
  {
    type: 'wechat',
    label: '微信',
    icon: 'chat',
    placeholder: '微信号',
  },
  {
    type: 'qq',
    label: 'QQ',
    icon: 'qq',
    placeholder: 'QQ 号',
    inputMode: 'numeric',
  },
  {
    type: 'address',
    label: '地址',
    icon: 'pin',
    placeholder: '城市 · 街道 · 门牌号',
  },
  {
    type: 'other',
    label: '其他',
    icon: 'link',
    placeholder: '主页、社交账号或其它线索',
  },
];

const METHOD_TYPE_MAP = new Map(METHOD_TYPES.map((item) => [item.type, item]));

export function methodMeta(type) {
  return METHOD_TYPE_MAP.get(type) || METHOD_TYPE_MAP.get('other');
}

export function methodLabel(method) {
  if (!method) return '';
  if (method.type === 'other' && method.label) return method.label;
  return methodMeta(method.type).label;
}

export function newMethod(type = 'phone') {
  return {
    id: uid('m'),
    type,
    label: type === 'other' ? '' : methodMeta(type).label,
    value: '',
  };
}

export function methodValue(contact, type) {
  return (contact.methods || [])
    .filter((method) => method.type === type)
    .map((method) => method.value);
}

export function normalizeContact(input = {}) {
  const now = new Date().toISOString();
  const methods = Array.isArray(input.methods) ? input.methods : [];
  return {
    id: input.id || uid('c'),
    name: String(input.name || '').trim(),
    company: String(input.company || '').trim(),
    title: String(input.title || '').trim(),
    birthday: String(input.birthday || '').trim(),
    tags: Array.isArray(input.tags) ? splitTags(input.tags.join(' ')) : splitTags(input.tags),
    favorite: Boolean(input.favorite),
    note: String(input.note || '').trim(),
    methods: methods
      .filter((method) => method && String(method.value || '').trim())
      .map((method) => {
        const type = METHOD_TYPE_MAP.has(method.type) ? method.type : 'other';
        return {
          id: method.id || uid('m'),
          type,
          label:
            type === 'other'
              ? String(method.label || '其他').trim()
              : methodMeta(type).label,
          value: String(method.value || '').trim(),
        };
      }),
    createdAt: input.createdAt || now,
    updatedAt: input.updatedAt || now,
  };
}

export function createContact(draft) {
  const now = new Date().toISOString();
  return normalizeContact({
    ...draft,
    id: draft?.id || uid('c'),
    createdAt: draft?.createdAt || now,
    updatedAt: now,
  });
}

export function createEmptyDraft() {
  return {
    id: null,
    name: '',
    company: '',
    title: '',
    birthday: '',
    tags: [],
    favorite: false,
    note: '',
    methods: [newMethod('phone')],
  };
}

export function toDraft(contact) {
  return {
    ...contact,
    tags: [...(contact.tags || [])],
    methods: (contact.methods || []).map((method) => ({ ...method })),
  };
}

/**
 * Returns a map keyed by field id / method id. An empty object means valid.
 */
export function validateContact(draft) {
  const errors = {};
  if (!String(draft.name || '').trim()) {
    errors.name = '请填写姓名';
  }
  const seen = new Set();
  (draft.methods || []).forEach((method) => {
    const value = String(method.value || '').trim();
    if (!value) {
      errors[method.id] = '请填写内容，或删除这一行';
      return;
    }
    if (method.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      errors[method.id] = '邮箱格式看起来不对';
      return;
    }
    if (method.type === 'phone' && value.replace(/\D/g, '').length < 5) {
      errors[method.id] = '电话号码太短了';
      return;
    }
    const normalized = `${method.type}:${value.toLowerCase().replace(/\s+/g, '')}`;
    if (seen.has(normalized)) {
      errors[method.id] = '这个联系方式重复了';
      return;
    }
    seen.add(normalized);
  });
  return errors;
}

export function validateDraftHasNoEmptyMethods(draft) {
  return (draft.methods || []).every((method) => String(method.value || '').trim());
}

export function searchableText(contact) {
  return [
    contact.name,
    contact.company,
    contact.title,
    contact.birthday,
    contact.note,
    ...(contact.tags || []),
    ...(contact.methods || []).map((method) => `${methodLabel(method)} ${method.value}`),
  ]
    .join(' ')
    .toLowerCase();
}

const nameCollator = new Intl.Collator('zh-Hans-CN', { sensitivity: 'base' });

export function filterAndSort(contacts, { query = '', scope = 'all', tag = '', sort = 'recent' } = {}) {
  const tokens = String(query || '')
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean);

  let result = contacts.filter((contact) => {
    if (scope === 'favorites' && !contact.favorite) return false;
    if (tag && !(contact.tags || []).includes(tag)) return false;
    if (!tokens.length) return true;
    const haystack = searchableText(contact);
    return tokens.every((token) => haystack.includes(token));
  });

  result = [...result].sort((a, b) => {
    if (sort === 'name') return nameCollator.compare(a.name, b.name);
    if (sort === 'company') {
      return (
        nameCollator.compare(a.company || '\uffff', b.company || '\uffff') ||
        nameCollator.compare(a.name, b.name)
      );
    }
    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
  });

  // Bookmarks are always one glance away, even inside the "all" view.
  result.sort((a, b) => Number(b.favorite) - Number(a.favorite));
  return result;
}

export function bookStats(contacts) {
  const tagCounts = new Map();
  let favoriteCount = 0;
  let methodCount = 0;
  contacts.forEach((contact) => {
    if (contact.favorite) favoriteCount += 1;
    methodCount += (contact.methods || []).length;
    (contact.tags || []).forEach((tag) => {
      tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
    });
  });
  const tags = [...tagCounts.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count || nameCollator.compare(a.name, b.name));
  return {
    total: contacts.length,
    favorites: favoriteCount,
    methods: methodCount,
    tags,
  };
}

export function contactInitials(contact) {
  return initials(contact.name);
}

function normalizedName(contact) {
  return String(contact.name || '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '');
}

function phonesOf(contact) {
  return (contact.methods || [])
    .filter((method) => method.type === 'phone')
    .map((method) => method.value.replace(/\D/g, ''))
    .filter(Boolean);
}

function emailsOf(contact) {
  return (contact.methods || [])
    .filter((method) => method.type === 'email')
    .map((method) => method.value.trim().toLowerCase())
    .filter(Boolean);
}

/**
 * Two rows describe the same person when the names match and at least one
 * phone/email matches. Name-only contacts also match each other.
 */
export function isSamePerson(a, b) {
  if (!a || !b) return false;
  if (!normalizedName(a) || normalizedName(a) !== normalizedName(b)) return false;
  const aPhones = phonesOf(a);
  const bPhones = phonesOf(b);
  const aEmails = emailsOf(a);
  const bEmails = emailsOf(b);
  if (aPhones.length && bPhones.length && aPhones.some((phone) => bPhones.includes(phone))) {
    return true;
  }
  if (aEmails.length && bEmails.length && aEmails.some((email) => bEmails.includes(email))) {
    return true;
  }
  return !aPhones.length && !bPhones.length && !aEmails.length && !bEmails.length;
}

function mergeContact(existing, imported) {
  const now = new Date().toISOString();
  const tags = [...new Set([...(existing.tags || []), ...(imported.tags || [])])];
  const importedMethods = (imported.methods || []).map((method) => ({
    ...newMethod(method.type),
    label: method.label || methodMeta(method.type).label,
    value: method.value,
  }));
  return {
    ...existing,
    name: imported.name || existing.name,
    company: imported.company || existing.company,
    title: imported.title || existing.title,
    birthday: imported.birthday || existing.birthday,
    tags,
    favorite: imported.favorite == null ? existing.favorite : Boolean(imported.favorite),
    note: imported.note || existing.note,
    methods: importedMethods.length ? importedMethods : existing.methods,
    updatedAt: now,
  };
}

/**
 * Applies parsed Excel rows to the existing book.
 * mode = "merge" updates duplicates, mode = "skip" leaves them untouched.
 */
export function applyImport(existing, importedRows, mode = 'merge') {
  const working = existing.map((contact) => normalizeContact(contact));
  let created = 0;
  let updated = 0;
  let skipped = 0;
  const skippedNames = [];

  importedRows.forEach((row) => {
    const index = working.findIndex((contact) => isSamePerson(contact, row));
    if (index === -1) {
      working.push(createContact(row));
      created += 1;
      return;
    }
    if (mode === 'skip') {
      skipped += 1;
      skippedNames.push(row.name);
      return;
    }
    working[index] = mergeContact(working[index], row);
    updated += 1;
  });

  return { contacts: working, created, updated, skipped, skippedNames };
}
