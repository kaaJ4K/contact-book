/**
 * Small, dependency-free helpers shared by the UI and the data layer.
 */

export function cx(...values) {
  return values.filter(Boolean).join(' ');
}

export function uid(prefix = 'c') {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return `${prefix}-${crypto.randomUUID()}`;
  }
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export function initials(name) {
  const trimmed = String(name || '').trim();
  if (!trimmed) return '?';
  const parts = trimmed.split(/\s+/);
  if (parts.length > 1 && /^[A-Za-z]/.test(parts[0])) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  // Chinese names look best with the last one or two characters.
  if (trimmed.length <= 2) return trimmed;
  return trimmed.slice(-2);
}

const AVATAR_PALETTE = [
  ['#f3d9b1', '#7a4a16'],
  ['#d9e5d6', '#33533f'],
  ['#f0d3cc', '#7d3a2c'],
  ['#d7e2ee', '#2f4d6b'],
  ['#e8d9ef', '#5b3a6b'],
  ['#f2e2c8', '#6d5325'],
  ['#d5e8e4', '#275a53'],
  ['#ebd7d9', '#6c3742'],
];

export function avatarColors(seed) {
  const text = String(seed || '?');
  let hash = 0;
  for (let i = 0; i < text.length; i += 1) {
    hash = (hash * 31 + text.charCodeAt(i)) % 9973;
  }
  const [bg, fg] = AVATAR_PALETTE[hash % AVATAR_PALETTE.length];
  return { bg, fg };
}

export function formatDateCN(iso) {
  if (!iso) return '';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return String(iso);
  return `${date.getFullYear()} 年 ${date.getMonth() + 1} 月 ${date.getDate()} 日`;
}

const MONTHS = ['1 月', '2 月', '3 月', '4 月', '5 月', '6 月', '7 月', '8 月', '9 月', '10 月', '11 月', '12 月'];

export function formatBirthday(value) {
  if (!value) return '';
  const match = String(value).match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (!match) return String(value);
  return `${match[1]} 年 ${MONTHS[Number(match[2]) - 1] || `${match[2]} 月`} ${Number(match[3])} 日`;
}

export function formatRelative(iso) {
  if (!iso) return '';
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return '';
  const diff = Date.now() - then;
  if (diff < 60 * 1000) return '刚刚';
  if (diff < 60 * 60 * 1000) return `${Math.floor(diff / 60000)} 分钟前`;
  if (diff < 24 * 60 * 60 * 1000) return `${Math.floor(diff / 3600000)} 小时前`;
  if (diff < 7 * 24 * 60 * 60 * 1000) return `${Math.floor(diff / 86400000)} 天前`;
  const date = new Date(iso);
  return `${date.getMonth() + 1} 月 ${date.getDate()} 日`;
}

export function todayStamp() {
  const now = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}-${pad(now.getHours())}${pad(now.getMinutes())}`;
}

export function splitTags(value) {
  return String(value || '')
    .split(/[,，、;；\s]+/)
    .map((tag) => tag.trim())
    .filter(Boolean)
    .filter((tag, index, list) => list.indexOf(tag) === index);
}

export async function copyText(value) {
  const text = String(value ?? '');
  if (!text) return false;
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // Fall through to the older path below.
  }
  try {
    const area = document.createElement('textarea');
    area.value = text;
    area.setAttribute('readonly', '');
    area.style.position = 'fixed';
    area.style.opacity = '0';
    document.body.appendChild(area);
    area.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(area);
    return ok;
  } catch {
    return false;
  }
}

export function isEditableTarget(target) {
  if (!target) return false;
  const tag = target.tagName;
  return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || target.isContentEditable;
}
