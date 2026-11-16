import React from 'react';
import Icon from './Icons.jsx';

export default function ConfirmDialog({
  title,
  description,
  confirmLabel = '确认',
  cancelLabel = '取消',
  tone = 'danger',
  onConfirm,
  onClose,
}) {
  return (
    <div className="modal-backdrop modal-backdrop--top" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section className="modal confirm-modal" role="alertdialog" aria-modal="true" aria-labelledby="confirm-title">
        <div className={`confirm-modal__icon confirm-modal__icon--${tone}`}>
          <Icon name={tone === 'danger' ? 'trash' : 'refresh'} size={22} />
        </div>
        <h2 id="confirm-title">{title}</h2>
        <p>{description}</p>
        <div className="confirm-modal__actions">
          <button type="button" className="button button--quiet" onClick={onClose}>
            {cancelLabel}
          </button>
          <button
            type="button"
            className={`button ${tone === 'danger' ? 'button--danger' : 'button--primary'}`}
            onClick={() => {
              onConfirm();
              onClose();
            }}
            data-testid="confirm-dialog-ok"
          >
            {confirmLabel}
          </button>
        </div>
      </section>
    </div>
  );
}
