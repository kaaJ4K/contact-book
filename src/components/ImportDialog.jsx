import React, { useRef, useState } from 'react';
import Icon from './Icons.jsx';
import Avatar from './Avatar.jsx';
import { applyImport, methodLabel } from '../lib/contacts.js';
import { downloadTemplateFile, parseImportBuffer } from '../lib/excel.js';

const MAX_BYTES = 8 * 1024 * 1024;

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function firstMethodLabel(contact) {
  if (!contact.methods?.length) return '—';
  const method = contact.methods[0];
  return `${methodLabel(method)} · ${method.value}`;
}

export default function ImportDialog({ existingContacts, onApply, onClose, onNotify }) {
  const [step, setStep] = useState('pick');
  const [mode, setMode] = useState('merge');
  const [dragging, setDragging] = useState(false);
  const [busy, setBusy] = useState(false);
  const [fileName, setFileName] = useState('');
  const [fileError, setFileError] = useState('');
  const [parsed, setParsed] = useState(null);
  const [done, setDone] = useState(null);
  const inputRef = useRef(null);

  const reset = () => {
    setStep('pick');
    setParsed(null);
    setDone(null);
    setFileName('');
    setFileError('');
    setBusy(false);
    if (inputRef.current) inputRef.current.value = '';
  };

  const readFile = async (file) => {
    if (!file) return;
    setFileError('');
    const extension = file.name.toLowerCase().split('.').pop();
    if (!['xlsx', 'xlsm'].includes(extension)) {
      setFileError('只支持 .xlsx / .xlsm 文件，请先用 Excel 另存为 xlsx 后再试。');
      return;
    }
    if (file.size > MAX_BYTES) {
      setFileError(`文件有 ${formatBytes(file.size)}，超过了 8 MB 限制。`);
      return;
    }
    setBusy(true);
    setFileName(file.name);
    try {
      const buffer = await file.arrayBuffer();
      const result = parseImportBuffer(buffer);
      setParsed(result);
      setStep('preview');
    } catch (error) {
      setFileError(error.message || '文件读取失败，请检查格式。');
    } finally {
      setBusy(false);
    }
  };

  const confirmImport = () => {
    if (!parsed) return;
    const result = applyImport(existingContacts, parsed.contacts, mode);
    onApply(result.contacts, {
      created: result.created,
      updated: result.updated,
      skipped: result.skipped,
      errors: parsed.errors,
    });
    setDone({
      ...result,
      errors: parsed.errors,
      totalRows: parsed.totalRows,
      sheetName: parsed.sheetName,
      fileName,
    });
    setStep('done');
  };

  const downloadTemplate = () => {
    try {
      const name = downloadTemplateFile();
      onNotify?.(`模板已开始下载：${name}`);
    } catch {
      onNotify?.('模板下载失败，请稍后重试');
    }
  };

  return (
    <div
      className="modal-backdrop"
      onMouseDown={(event) => event.target === event.currentTarget && onClose()}
    >
      <section className="modal import-modal" role="dialog" aria-modal="true" aria-labelledby="import-title">
        <header className="modal__header">
          <div>
            <p className="modal__eyebrow">EXCEL IMPORT</p>
            <h2 id="import-title">导入通讯录</h2>
          </div>
          <button type="button" className="icon-button" onClick={onClose} aria-label="关闭导入窗口">
            <Icon name="close" size={20} />
          </button>
        </header>

        {step === 'pick' ? (
          <div className="import-body">
            <div
              className={`dropzone ${dragging ? 'is-dragging' : ''} ${busy ? 'is-busy' : ''}`}
              onDragEnter={(event) => {
                event.preventDefault();
                setDragging(true);
              }}
              onDragOver={(event) => event.preventDefault()}
              onDragLeave={(event) => {
                event.preventDefault();
                setDragging(false);
              }}
              onDrop={(event) => {
                event.preventDefault();
                setDragging(false);
                readFile(event.dataTransfer.files?.[0]);
              }}
              onClick={() => inputRef.current?.click()}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  inputRef.current?.click();
                }
              }}
              role="button"
              tabIndex={0}
              aria-label="选择或拖入 Excel 文件"
              data-testid="import-dropzone"
            >
              <span className="dropzone__icon">
                <Icon name={busy ? 'refresh' : 'upload'} size={28} className={busy ? 'spin' : ''} />
              </span>
              <strong>{busy ? '正在读取文件…' : '把 Excel 文件拖到这里'}</strong>
              <p>或点击选择文件，支持 .xlsx / .xlsm，最大 8 MB</p>
              <span className="dropzone__button">选择文件</span>
              <input
                ref={inputRef}
                type="file"
                accept=".xlsx,.xlsm,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                hidden
                data-testid="import-file-input"
                onChange={(event) => readFile(event.target.files?.[0])}
              />
            </div>

            {fileError ? (
              <p className="inline-error" role="alert">
                <Icon name="info" size={16} />
                {fileError}
              </p>
            ) : null}

            <div className="import-tips">
              <div className="import-tips__head">
                <h3>第一次导入？</h3>
                <button type="button" className="text-button" onClick={downloadTemplate}>
                  <Icon name="download" size={15} />
                  下载导入模板
                </button>
              </div>
              <ul>
                <li>一行一位联系人，列名与模板保持一致即可；姓名必填，其它列可以留空。</li>
                <li>多个手机号 / 邮箱可用「 / 」或分号分隔，超出列数的内容会折叠保存。</li>
                <li>导入时可选择「合并更新」或「跳过重复」，重复判断依据是姓名 + 手机号或邮箱。</li>
              </ul>
            </div>
          </div>
        ) : null}

        {step === 'preview' && parsed ? (
          <div className="import-body">
            <div className="import-filebar">
              <span className="import-filebar__icon">
                <Icon name="file" size={20} />
              </span>
              <div>
                <strong>{fileName}</strong>
                <p>
                  {parsed.sheetName} · 共 {parsed.totalRows} 行 · 识别出 {parsed.contacts.length} 位联系人
                </p>
              </div>
              <button type="button" className="text-button" onClick={reset}>
                重新选择
              </button>
            </div>

            <div className="import-summary" aria-label="导入统计">
              <div>
                <span className="import-summary__value">{parsed.contacts.length}</span>
                <span>可导入</span>
              </div>
              <div>
                <span className="import-summary__value">{parsed.errors.length}</span>
                <span>行提示</span>
              </div>
              <div>
                <span className="import-summary__value">{existingContacts.length}</span>
                <span>现有联系人</span>
              </div>
            </div>

            {parsed.errors.length ? (
              <div className="import-errors" role="note">
                <div className="import-errors__head">
                  <Icon name="info" size={15} />
                  <strong>部分内容需要注意（不会阻止导入）</strong>
                </div>
                <ul>
                  {parsed.errors.slice(0, 8).map((error, index) => (
                    <li key={`${error.row}-${index}`}>
                      <span>第 {error.row} 行</span>
                      {error.message}
                    </li>
                  ))}
                  {parsed.errors.length > 8 ? <li>还有 {parsed.errors.length - 8} 条提示…</li> : null}
                </ul>
              </div>
            ) : null}

            {parsed.contacts.length ? (
              <div className="preview-table-wrap">
                <table className="preview-table">
                  <thead>
                    <tr>
                      <th>联系人</th>
                      <th>公司 / 职位</th>
                      <th>联系方式</th>
                      <th>标签</th>
                      <th>收藏</th>
                    </tr>
                  </thead>
                  <tbody>
                    {parsed.contacts.slice(0, 6).map((contact) => (
                      <tr key={`${contact.sourceRow}-${contact.name}`}>
                        <td>
                          <span className="preview-person">
                            <Avatar name={contact.name} size={28} />
                            <strong>{contact.name}</strong>
                          </span>
                        </td>
                        <td>{[contact.company, contact.title].filter(Boolean).join(' · ') || '—'}</td>
                        <td>{firstMethodLabel(contact)}</td>
                        <td>{contact.tags.join('、') || '—'}</td>
                        <td>{contact.favorite ? '是' : '否'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {parsed.contacts.length > 6 ? (
                  <p className="preview-more">仅预览前 6 行，共有 {parsed.contacts.length} 位联系人。</p>
                ) : null}
              </div>
            ) : (
              <p className="inline-error">没有读取到可导入的联系人，请检查姓名列是否填写。</p>
            )}

            <div className="import-modes" role="radiogroup" aria-label="重复联系人处理方式">
              <label className={`mode-card ${mode === 'merge' ? 'is-selected' : ''}`}>
                <input
                  type="radio"
                  name="import-mode"
                  value="merge"
                  checked={mode === 'merge'}
                  onChange={() => setMode('merge')}
                  data-testid="import-mode-merge"
                />
                <span className="mode-card__radio" aria-hidden="true" />
                <span>
                  <strong>合并更新</strong>
                  <small>姓名 + 手机号/邮箱相同：更新联系方式，保留原收藏与创建时间。</small>
                </span>
              </label>
              <label className={`mode-card ${mode === 'skip' ? 'is-selected' : ''}`}>
                <input
                  type="radio"
                  name="import-mode"
                  value="skip"
                  checked={mode === 'skip'}
                  onChange={() => setMode('skip')}
                  data-testid="import-mode-skip"
                />
                <span className="mode-card__radio" aria-hidden="true" />
                <span>
                  <strong>跳过重复</strong>
                  <small>只导入全新的联系人，现有资料完全不动。</small>
                </span>
              </label>
            </div>

            <footer className="modal__footer">
              <span className="modal__hint">导入前可以随时返回重新选择文件</span>
              <div className="modal__actions">
                <button type="button" className="button button--quiet" onClick={onClose}>
                  取消
                </button>
                <button
                  type="button"
                  className="button button--primary"
                  onClick={confirmImport}
                  disabled={!parsed.contacts.length}
                  data-testid="confirm-import"
                >
                  <Icon name="check" size={17} />
                  确认导入 {parsed.contacts.length} 位联系人
                </button>
              </div>
            </footer>
          </div>
        ) : null}

        {step === 'done' && done ? (
          <div className="import-body import-done" data-testid="import-done">
            <div className="import-done__hero">
              <span className="import-done__icon">
                <Icon name="check" size={30} />
              </span>
              <h3>导入完成</h3>
              <p>
                共处理 {done.totalRows} 行，数据已经自动保存在本机。建议再导出一次 Excel 做备份。
              </p>
            </div>
            <div className="done-stats">
              <div>
                <strong>{done.created}</strong>
                <span>新增</span>
              </div>
              <div>
                <strong>{done.updated}</strong>
                <span>更新</span>
              </div>
              <div>
                <strong>{done.skipped}</strong>
                <span>跳过</span>
              </div>
              <div>
                <strong>{done.errors.length}</strong>
                <span>行提示</span>
              </div>
            </div>
            {done.skippedNames.length ? (
              <p className="done-note">跳过了重复联系人：{done.skippedNames.slice(0, 6).join('、')}{done.skippedNames.length > 6 ? '…' : ''}</p>
            ) : null}
            {done.errors.length ? (
              <div className="import-errors import-errors--done">
                <div className="import-errors__head">
                  <Icon name="info" size={15} />
                  <strong>以下行有提示</strong>
                </div>
                <ul>
                  {done.errors.slice(0, 6).map((error, index) => (
                    <li key={`${error.row}-${index}`}>
                      <span>第 {error.row} 行</span>
                      {error.message}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
            <footer className="modal__footer">
              <button type="button" className="button button--quiet" onClick={reset}>
                继续导入
              </button>
              <button type="button" className="button button--primary" onClick={onClose}>
                完成
              </button>
            </footer>
          </div>
        ) : null}
      </section>
    </div>
  );
}
