import React, { useMemo, useState } from 'react';
import Icon from './Icons.jsx';
import { columnSummary, exportContactsFile } from '../lib/excel.js';

export default function ExportDialog({ contacts, onClose, onNotify }) {
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [busy, setBusy] = useState(false);
  const columns = useMemo(() => columnSummary(), []);
  const favoriteCount = contacts.filter((contact) => contact.favorite).length;
  const count = favoritesOnly ? favoriteCount : contacts.length;

  const handleExport = () => {
    setBusy(true);
    try {
      const { filename, count: exported } = exportContactsFile(contacts, { favoritesOnly });
      onNotify?.(`已导出 ${exported} 位联系人的 Excel：${filename}`);
      onClose();
    } catch {
      onNotify?.('导出失败，请稍后重试');
      setBusy(false);
    }
  };

  return (
    <div className="modal-backdrop" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section className="modal export-modal" role="dialog" aria-modal="true" aria-labelledby="export-title">
        <header className="modal__header">
          <div>
            <p className="modal__eyebrow">EXCEL EXPORT</p>
            <h2 id="export-title">导出通讯录</h2>
          </div>
          <button type="button" className="icon-button" onClick={onClose} aria-label="关闭导出窗口">
            <Icon name="close" size={20} />
          </button>
        </header>

        <div className="export-body">
          <div className="export-hero">
            <span className="export-hero__icon">
              <Icon name="file" size={28} />
            </span>
            <div>
              <strong>一行一位联系人，一种信息一列</strong>
              <p>导出的文件可以直接用 Excel / WPS 打开，也可以再次导入联络簿。</p>
            </div>
          </div>

          <div className="export-scope" role="radiogroup" aria-label="导出范围">
            <label className={`scope-card ${!favoritesOnly ? 'is-selected' : ''}`}>
              <input
                type="radio"
                name="export-scope"
                checked={!favoritesOnly}
                onChange={() => setFavoritesOnly(false)}
              />
              <span className="scope-card__icon">
                <Icon name="users" size={19} />
              </span>
              <span>
                <strong>全部联系人</strong>
                <small>{contacts.length} 位 · 包含所有收藏状态和联系方式</small>
              </span>
              <span className="scope-card__count">{contacts.length}</span>
            </label>
            <label className={`scope-card ${favoritesOnly ? 'is-selected' : ''}`}>
              <input
                type="radio"
                name="export-scope"
                checked={favoritesOnly}
                onChange={() => setFavoritesOnly(true)}
                disabled={!favoriteCount}
              />
              <span className="scope-card__icon scope-card__icon--star">
                <Icon name="star-filled" size={18} />
              </span>
              <span>
                <strong>仅导出收藏</strong>
                <small>{favoriteCount ? `${favoriteCount} 位常用联系人，适合做精简备份` : '还没有收藏联系人'}</small>
              </span>
              <span className="scope-card__count">{favoriteCount}</span>
            </label>
          </div>

          <div className="export-columns">
            <div className="export-columns__head">
              <h3>导出列</h3>
              <span>{columns.length} 列</span>
            </div>
            <div className="column-chips">
              {columns.map((column) => (
                <span
                  key={column.key}
                  className={`column-chip ${column.required ? 'column-chip--required' : ''}`}
                >
                  {column.header}
                  {column.required ? <em>*</em> : null}
                </span>
              ))}
            </div>
            <p className="export-hint">
              多个手机号/邮箱会自动折叠进最后一列并用「 / 」分隔；再次导入时会被还原成多条联系方式。
            </p>
          </div>

          <footer className="modal__footer">
            <span className="modal__hint">将导出 {count} 位联系人</span>
            <div className="modal__actions">
              <button type="button" className="button button--quiet" onClick={onClose}>
                取消
              </button>
              <button
                type="button"
                className="button button--primary"
                onClick={handleExport}
                disabled={busy || !count}
                data-testid="confirm-export"
              >
                <Icon name="download" size={17} />
                {busy ? '正在生成…' : `导出 ${count} 位联系人`}
              </button>
            </div>
          </footer>
        </div>
      </section>
    </div>
  );
}
