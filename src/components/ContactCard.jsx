import React from 'react';
import Icon from './Icons.jsx';
import Avatar from './Avatar.jsx';
import { methodMeta } from '../lib/contacts.js';

function preferredMethods(contact) {
  const order = ['phone', 'email', 'wechat', 'address', 'qq', 'other'];
  return [...(contact.methods || [])]
    .sort((a, b) => order.indexOf(a.type) - order.indexOf(b.type))
    .slice(0, 3);
}

export default function ContactCard({ contact, onOpen, onToggleFavorite, style }) {
  const methods = preferredMethods(contact);
  const tags = contact.tags || [];

  const handleKeyDown = (event) => {
    if (event.target !== event.currentTarget) return;
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onOpen(contact.id);
    }
  };

  return (
    <article
      className={`contact-card ${contact.favorite ? 'is-favorite' : ''}`}
      style={style}
      onClick={() => onOpen(contact.id)}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      aria-label={`查看 ${contact.name} 的联系人卡片`}
      data-testid="contact-card"
    >
      <div className="contact-card__top">
        <Avatar name={contact.name} size={52} />
        <button
          type="button"
          className={`star-button ${contact.favorite ? 'is-on' : ''}`}
          aria-label={contact.favorite ? `取消收藏 ${contact.name}` : `收藏 ${contact.name}`}
          aria-pressed={contact.favorite}
          title={contact.favorite ? '取消收藏' : '收藏联系人'}
          data-testid="favorite-toggle"
          onClick={(event) => {
            event.stopPropagation();
            onToggleFavorite(contact.id);
          }}
        >
          <Icon name={contact.favorite ? 'star-filled' : 'star'} size={20} />
        </button>
      </div>

      <div className="contact-card__identity">
        <h3>{contact.name}</h3>
        <p>
          {contact.title || '联系人'}
          {contact.company ? <span> · {contact.company}</span> : null}
        </p>
      </div>

      {tags.length ? (
        <div className="tag-row">
          {tags.slice(0, 3).map((tag) => (
            <span key={tag} className="tag-chip">
              {tag}
            </span>
          ))}
          {tags.length > 3 ? <span className="tag-chip tag-chip--more">+{tags.length - 3}</span> : null}
        </div>
      ) : (
        <div className="tag-row tag-row--placeholder" aria-hidden="true" />
      )}

      <ul className="contact-card__methods">
        {methods.length ? (
          methods.map((method) => (
            <li key={method.id}>
              <Icon name={methodMeta(method.type).icon} size={15} />
              <span className="method-value">{method.value}</span>
            </li>
          ))
        ) : (
          <li className="contact-card__empty">还没有填写联系方式</li>
        )}
      </ul>

      {contact.favorite ? (
        <span className="favorite-ribbon" aria-hidden="true">
          常用
        </span>
      ) : null}
    </article>
  );
}
