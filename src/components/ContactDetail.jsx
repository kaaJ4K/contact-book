import React from 'react';
import Avatar from './Avatar.jsx';
import Icon from './Icons.jsx';
import { methodLabel, methodMeta } from '../lib/contacts.js';
import { copyText, formatBirthday, formatDateCN, formatRelative } from '../lib/utils.js';

export default function ContactDetail({ contact, onClose, onEdit, onDelete, onToggleFavorite, onCopied }) {
  const handleCopy = async (method) => {
    const ok = await copyText(method.value);
    onCopied(ok ? `已复制${methodLabel(method)}：${method.value}` : '复制失败，请手动选择文本');
  };

  return (
    <div
      className="drawer-backdrop"
      onMouseDown={(event) => event.target === event.currentTarget && onClose()}
    >
      <aside
        className="contact-drawer"
        role="dialog"
        aria-modal="true"
        aria-labelledby="detail-title"
        data-testid="contact-detail"
      >
        <header className="contact-drawer__hero">
          <div className="contact-drawer__top">
            <span className="drawer-eyebrow">CONTACT FILE</span>
            <button type="button" className="icon-button" onClick={onClose} aria-label="关闭联系人详情">
              <Icon name="close" size={20} />
            </button>
          </div>
          <div className="contact-drawer__identity">
            <Avatar name={contact.name} size={76} />
            <div>
              <h2 id="detail-title">{contact.name}</h2>
              <p>
                {contact.title || '联系人'}
                {contact.company ? <span> · {contact.company}</span> : null}
              </p>
            </div>
          </div>
          <div className="contact-drawer__meta-row">
            <button
              type="button"
              className={`favorite-toggle ${contact.favorite ? 'is-on' : ''}`}
              onClick={() => onToggleFavorite(contact.id)}
              aria-pressed={contact.favorite}
              data-testid="detail-favorite"
            >
              <Icon name={contact.favorite ? 'star-filled' : 'star'} size={17} />
              {contact.favorite ? '已收藏' : '收藏联系人'}
            </button>
            <span className="updated-note">更新于 {formatRelative(contact.updatedAt)}</span>
          </div>
          {contact.tags?.length ? (
            <div className="tag-row">
              {contact.tags.map((tag) => (
                <span key={tag} className="tag-chip">
                  {tag}
                </span>
              ))}
            </div>
          ) : null}
        </header>

        <div className="contact-drawer__body">
          <section className="drawer-section">
            <div className="drawer-section__head">
              <h3>联系方式</h3>
              <span>{contact.methods?.length || 0} 条</span>
            </div>
            {contact.methods?.length ? (
              <ul className="method-list">
                {contact.methods.map((method) => {
                  const meta = methodMeta(method.type);
                  return (
                    <li key={method.id} className="method-list__item">
                      <span className={`method-list__icon method-list__icon--${method.type}`}>
                        <Icon name={meta.icon} size={18} />
                      </span>
                      <div className="method-list__text">
                        <small>{methodLabel(method)}</small>
                        <p>{method.value}</p>
                      </div>
                      <button
                        type="button"
                        className="icon-button method-list__copy"
                        onClick={() => handleCopy(method)}
                        aria-label={`复制 ${methodLabel(method)} ${method.value}`}
                        title="复制"
                      >
                        <Icon name="copy" size={16} />
                      </button>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="drawer-hint">还没有添加联系方式，点击「编辑资料」补充。</p>
            )}
          </section>

          {contact.birthday ? (
            <section className="drawer-section drawer-section--inline">
              <div>
                <span className="drawer-label">生日</span>
                <p>{formatBirthday(contact.birthday)}</p>
              </div>
              <span className="drawer-inline-icon" aria-hidden="true">
                <Icon name="calendar" size={20} />
              </span>
            </section>
          ) : null}

          {contact.note ? (
            <section className="drawer-section">
              <div className="drawer-section__head">
                <h3>备注</h3>
              </div>
              <blockquote className="contact-note">{contact.note}</blockquote>
            </section>
          ) : null}

          <section className="drawer-section drawer-section--timeline">
            <div>
              <span className="drawer-label">创建时间</span>
              <p>{formatDateCN(contact.createdAt)}</p>
            </div>
            <span className="timeline-dot" aria-hidden="true" />
            <div>
              <span className="drawer-label">最近更新</span>
              <p>{formatDateCN(contact.updatedAt)}</p>
            </div>
          </section>
        </div>

        <footer className="contact-drawer__footer">
          <button
            type="button"
            className="button button--danger-quiet"
            onClick={() => onDelete(contact)}
            data-testid="delete-contact"
          >
            <Icon name="trash" size={16} />
            删除
          </button>
          <button
            type="button"
            className="button button--primary"
            onClick={() => onEdit(contact)}
            data-testid="edit-contact"
          >
            <Icon name="edit" size={16} />
            编辑资料
          </button>
        </footer>
      </aside>
    </div>
  );
}
