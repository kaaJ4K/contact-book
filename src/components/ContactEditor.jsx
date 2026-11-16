import React, { useEffect, useMemo, useRef, useState } from 'react';
import Icon from './Icons.jsx';
import Avatar from './Avatar.jsx';
import { METHOD_TYPES, methodMeta, newMethod, validateContact } from '../lib/contacts.js';
import { splitTags } from '../lib/utils.js';

export default function ContactEditor({ draft, isNew, onSave, onClose }) {
  const [form, setForm] = useState(draft);
  const [tagInput, setTagInput] = useState((draft.tags || []).join('、'));
  const [errors, setErrors] = useState({});
  const [attempted, setAttempted] = useState(false);
  const nameRef = useRef(null);

  useEffect(() => {
    setForm(draft);
    setTagInput((draft.tags || []).join('、'));
    setErrors({});
    setAttempted(false);
    const timer = window.setTimeout(() => nameRef.current?.focus(), 80);
    return () => window.clearTimeout(timer);
  }, [draft]);

  const tagsPreview = useMemo(() => splitTags(tagInput), [tagInput]);

  const update = (patch) => setForm((current) => ({ ...current, ...patch }));

  const updateMethod = (id, patch) => {
    setForm((current) => ({
      ...current,
      methods: current.methods.map((method) => (method.id === id ? { ...method, ...patch } : method)),
    }));
  };

  const addMethod = () => {
    setForm((current) => ({ ...current, methods: [...current.methods, newMethod('phone')] }));
  };

  const removeMethod = (id) => {
    setForm((current) => ({
      ...current,
      methods: current.methods.filter((method) => method.id !== id),
    }));
    setErrors((current) => {
      const next = { ...current };
      delete next[id];
      return next;
    });
  };

  const handleMethodType = (id, type) => {
    updateMethod(id, { type, label: type === 'other' ? '' : methodMeta(type).label });
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setAttempted(true);
    const cleaned = {
      ...form,
      name: String(form.name || '').trim(),
      company: String(form.company || '').trim(),
      title: String(form.title || '').trim(),
      birthday: String(form.birthday || '').trim(),
      note: String(form.note || '').trim(),
      tags: tagsPreview,
      methods: (form.methods || [])
        .map((method) => ({ ...method, value: String(method.value || '').trim() }))
        .filter((method) => method.value),
    };
    const nextErrors = validateContact(cleaned);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) {
      const nameInvalid = Boolean(nextErrors.name);
      const firstMethodId = cleaned.methods.find((method) => nextErrors[method.id])?.id;
      if (nameInvalid) nameRef.current?.focus();
      else if (firstMethodId) document.getElementById(`method-${firstMethodId}`)?.focus();
      return;
    }
    onSave(cleaned);
  };

  return (
    <div className="modal-backdrop" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section
        className="modal editor-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="editor-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <header className="modal__header">
          <div>
            <p className="modal__eyebrow">{isNew ? 'NEW CONTACT' : 'EDIT CONTACT'}</p>
            <h2 id="editor-title">{isNew ? '新建联系人' : `编辑 ${form.name || '联系人'}`}</h2>
          </div>
          <button type="button" className="icon-button" onClick={onClose} aria-label="关闭编辑器">
            <Icon name="close" size={20} />
          </button>
        </header>

        <form className="editor-form" onSubmit={handleSubmit} noValidate>
          <div className="editor-form__preview">
            <Avatar name={form.name || '?'} size={56} />
            <div>
              <strong>{form.name || '新联系人'}</strong>
              <p>
                {form.title || '职位'}
                {form.company ? ` · ${form.company}` : ''}
              </p>
            </div>
            <button
              type="button"
              className={`favorite-toggle ${form.favorite ? 'is-on' : ''}`}
              onClick={() => update({ favorite: !form.favorite })}
              aria-pressed={form.favorite}
              data-testid="editor-favorite"
            >
              <Icon name={form.favorite ? 'star-filled' : 'star'} size={17} />
              {form.favorite ? '已收藏' : '加入收藏'}
            </button>
          </div>

          <div className="form-grid">
            <label className={`field ${errors.name ? 'has-error' : ''}`}>
              <span className="field__label">
                姓名 <em>必填</em>
              </span>
              <input
                ref={nameRef}
                type="text"
                value={form.name}
                onChange={(event) => update({ name: event.target.value })}
                placeholder="例如：林晚"
                maxLength={80}
                data-testid="contact-name-input"
                required
              />
              {errors.name ? <small className="field__error">{errors.name}</small> : null}
            </label>

            <label className="field">
              <span className="field__label">公司 / 组织</span>
              <input
                type="text"
                value={form.company}
                onChange={(event) => update({ company: event.target.value })}
                placeholder="例如：澄野设计"
                maxLength={80}
              />
            </label>

            <label className="field">
              <span className="field__label">职位</span>
              <input
                type="text"
                value={form.title}
                onChange={(event) => update({ title: event.target.value })}
                placeholder="例如：产品设计师"
                maxLength={80}
              />
            </label>

            <label className="field">
              <span className="field__label">生日</span>
              <input
                type="date"
                value={form.birthday}
                onChange={(event) => update({ birthday: event.target.value })}
              />
            </label>
          </div>

          <div className="editor-section">
            <div className="editor-section__head">
              <div>
                <h3>联系方式</h3>
                <p>电话、邮箱、微信、地址……同一个人可以添加任意多条。</p>
              </div>
              <span className="method-count">{(form.methods || []).length} 条</span>
            </div>

            <div className="method-editor">
              {(form.methods || []).length ? (
                (form.methods || []).map((method) => {
                  const meta = methodMeta(method.type);
                  return (
                    <div
                      key={method.id}
                      className={`method-row ${method.type === 'other' ? 'method-row--other' : ''} ${
                        errors[method.id] ? 'has-error' : ''
                      }`}
                    >
                      <span className="method-row__icon">
                        <Icon name={meta.icon} size={17} />
                      </span>
                      <select
                        value={method.type}
                        onChange={(event) => handleMethodType(method.id, event.target.value)}
                        aria-label="联系方式类型"
                      >
                        {METHOD_TYPES.map((type) => (
                          <option key={type.type} value={type.type}>
                            {type.label}
                          </option>
                        ))}
                      </select>
                      {method.type === 'other' ? (
                        <input
                          type="text"
                          className="method-row__label"
                          value={method.label || ''}
                          onChange={(event) => updateMethod(method.id, { label: event.target.value })}
                          placeholder="平台（选填）"
                          maxLength={20}
                          aria-label="平台名称"
                        />
                      ) : null}
                      <input
                        id={`method-${method.id}`}
                        type="text"
                        className="method-row__value"
                        value={method.value}
                        onChange={(event) => updateMethod(method.id, { value: event.target.value })}
                        inputMode={meta.inputMode}
                        placeholder={meta.placeholder}
                        aria-label={`${meta.label}内容`}
                        data-testid="method-value-input"
                      />
                      <button
                        type="button"
                        className="icon-button icon-button--danger method-row__remove"
                        onClick={() => removeMethod(method.id)}
                        aria-label="删除这条联系方式"
                      >
                        <Icon name="close" size={17} />
                      </button>
                      {errors[method.id] ? <small className="method-row__error">{errors[method.id]}</small> : null}
                    </div>
                  );
                })
              ) : (
                <p className="method-editor__empty">还没有联系方式，可以只保存姓名，也可以现在添加。</p>
              )}
              <button type="button" className="add-method-button" onClick={addMethod} data-testid="add-method">
                <Icon name="plus" size={16} />
                添加一条联系方式
              </button>
            </div>
          </div>

          <div className="form-grid form-grid--bottom">
            <label className="field field--tags">
              <span className="field__label">标签</span>
              <input
                type="text"
                value={tagInput}
                onChange={(event) => setTagInput(event.target.value)}
                placeholder="用顿号分隔，例如：设计、客户"
                data-testid="tags-input"
              />
              {tagsPreview.length ? (
                <span className="tag-row tag-row--preview">
                  {tagsPreview.map((tag) => (
                    <span key={tag} className="tag-chip">
                      {tag}
                    </span>
                  ))}
                </span>
              ) : null}
            </label>
            <label className="field field--wide">
              <span className="field__label">备注</span>
              <textarea
                rows={3}
                value={form.note}
                onChange={(event) => update({ note: event.target.value })}
                placeholder="记录一次对话、一个约定，或者下次见面想聊的事。"
                maxLength={500}
                data-testid="note-input"
              />
            </label>
          </div>

          {attempted && errors.name ? (
            <p className="form-error-note" role="alert">
              <Icon name="info" size={16} /> 还有必填项没有完成，请检查姓名和联系方式。
            </p>
          ) : null}

          <footer className="modal__footer">
            <span className="modal__hint">按 Esc 可以随时关闭</span>
            <div className="modal__actions">
              <button type="button" className="button button--quiet" onClick={onClose}>
                取消
              </button>
              <button type="submit" className="button button--primary" data-testid="save-contact">
                <Icon name="check" size={17} />
                {isNew ? '保存联系人' : '保存修改'}
              </button>
            </div>
          </footer>
        </form>
      </section>
    </div>
  );
}
