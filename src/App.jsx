import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Sidebar from './components/Sidebar.jsx';
import ContactCard from './components/ContactCard.jsx';
import ContactDetail from './components/ContactDetail.jsx';
import ContactEditor from './components/ContactEditor.jsx';
import ImportDialog from './components/ImportDialog.jsx';
import ExportDialog from './components/ExportDialog.jsx';
import ConfirmDialog from './components/ConfirmDialog.jsx';
import EmptyState from './components/EmptyState.jsx';
import ToastStack from './components/ToastStack.jsx';
import Icon from './components/Icons.jsx';
import {
  bookStats,
  createContact,
  createEmptyDraft,
  filterAndSort,
  toDraft,
} from './lib/contacts.js';
import { downloadTemplateFile } from './lib/excel.js';
import { loadBook, resetBook, saveBook } from './lib/storage.js';
import { isEditableTarget, uid } from './lib/utils.js';

const initialBook = loadBook();

export default function App() {
  const [contacts, setContacts] = useState(initialBook.contacts);
  const [scope, setScope] = useState('all');
  const [activeTag, setActiveTag] = useState('');
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState('recent');
  const [selectedId, setSelectedId] = useState(null);
  const [editor, setEditor] = useState(null);
  const [importOpen, setImportOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [confirm, setConfirm] = useState(null);
  const [toasts, setToasts] = useState([]);
  const [mobileSidebar, setMobileSidebar] = useState(false);
  const [storageOk, setStorageOk] = useState(true);

  const searchRef = useRef(null);
  const toastTimers = useRef(new Map());

  useEffect(() => {
    const ok = saveBook(contacts);
    setStorageOk(ok);
  }, [contacts]);

  const dismissToast = useCallback((id) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
    const timer = toastTimers.current.get(id);
    if (timer) {
      window.clearTimeout(timer);
      toastTimers.current.delete(id);
    }
  }, []);

  const pushToast = useCallback(
    (message, { type = 'success', action = null, duration = 4200 } = {}) => {
      const id = uid('t');
      setToasts((current) => [...current.slice(-2), { id, message, type, action }]);
      const timer = window.setTimeout(() => dismissToast(id), duration);
      toastTimers.current.set(id, timer);
    },
    [dismissToast],
  );

  useEffect(
    () => () => {
      toastTimers.current.forEach((timer) => window.clearTimeout(timer));
      toastTimers.current.clear();
    },
    [],
  );

  const stats = useMemo(() => bookStats(contacts), [contacts]);
  const visible = useMemo(
    () => filterAndSort(contacts, { query, scope, tag: activeTag, sort }),
    [contacts, query, scope, activeTag, sort],
  );
  const selected = selectedId ? contacts.find((contact) => contact.id === selectedId) : null;

  const scopeTitle = activeTag
    ? `标签 · ${activeTag}`
    : scope === 'favorites'
      ? '我的收藏'
      : '全部联系人';
  const subtitle = query
    ? `找到 ${visible.length} 位与「${query}」相关的联系人`
    : activeTag
      ? `${visible.length} 位联系人使用了这个标签`
      : scope === 'favorites'
        ? `${visible.length} 位常用联系人，随时都能找到`
        : `${visible.length} 位联系人，按收藏优先排列`;

  const openNew = useCallback(() => {
    setMobileSidebar(false);
    setSelectedId(null);
    setEditor({ isNew: true, draft: createEmptyDraft() });
  }, []);

  const openEdit = useCallback((contact) => {
    setSelectedId(null);
    setEditor({ isNew: false, draft: toDraft(contact) });
  }, []);

  useEffect(() => {
    const hasOverlay = Boolean(confirm || editor || importOpen || exportOpen || selectedId || mobileSidebar);
    document.body.style.overflow = hasOverlay ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [confirm, editor, importOpen, exportOpen, selectedId, mobileSidebar]);

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        if (confirm) setConfirm(null);
        else if (editor) setEditor(null);
        else if (importOpen) setImportOpen(false);
        else if (exportOpen) setExportOpen(false);
        else if (selectedId) setSelectedId(null);
        else if (mobileSidebar) setMobileSidebar(false);
        return;
      }

      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        searchRef.current?.focus();
        return;
      }

      if (isEditableTarget(event.target)) return;
      if (editor || importOpen || exportOpen || confirm) return;

      if (event.key === 'n' || event.key === 'N') {
        event.preventDefault();
        openNew();
      } else if (event.key === '/') {
        event.preventDefault();
        searchRef.current?.focus();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [confirm, editor, importOpen, exportOpen, selectedId, mobileSidebar, openNew]);

  const changeScope = (nextScope) => {
    setScope(nextScope);
    setActiveTag('');
    setMobileSidebar(false);
  };

  const changeTag = (tag) => {
    setActiveTag((current) => (current === tag ? '' : tag));
    setScope('all');
    setMobileSidebar(false);
  };

  const toggleFavorite = useCallback(
    (id) => {
      const target = contacts.find((contact) => contact.id === id);
      setContacts((current) =>
        current.map((contact) =>
          contact.id === id
            ? {
                ...contact,
                favorite: !contact.favorite,
                updatedAt: new Date().toISOString(),
              }
            : contact,
        ),
      );
      if (target) {
        pushToast(target.favorite ? `已取消收藏 ${target.name}` : `已收藏 ${target.name}`, {
          type: target.favorite ? 'default' : 'success',
        });
      }
    },
    [contacts, pushToast],
  );

  const handleSaveContact = (draft) => {
    const existing = draft.id ? contacts.find((contact) => contact.id === draft.id) : null;
    const saved = existing
      ? createContact({ ...draft, id: existing.id, createdAt: existing.createdAt })
      : createContact(draft);
    setContacts((current) =>
      existing
        ? current.map((contact) => (contact.id === saved.id ? saved : contact))
        : [saved, ...current],
    );
    setEditor(null);
    setSelectedId(saved.id);
    pushToast(existing ? `已保存 ${saved.name} 的资料` : `已添加联系人 ${saved.name}`);
  };

  const handleDelete = (contact) => {
    setConfirm({
      title: `删除「${contact.name}」？`,
      description: '这位联系人会从当前浏览器中移除。删除后仍可在提示里撤销；提前导出 Excel 可以做长期备份。',
      confirmLabel: '删除联系人',
      cancelLabel: '再想想',
      tone: 'danger',
      onConfirm: () => {
        setContacts((current) => current.filter((item) => item.id !== contact.id));
        if (selectedId === contact.id) setSelectedId(null);
        pushToast(`已删除 ${contact.name}`, {
          type: 'undo',
          duration: 8000,
          action: {
            label: '撤销',
            onClick: () => {
              setContacts((current) => [...current, contact]);
              pushToast(`已恢复 ${contact.name}`);
            },
          },
        });
      },
    });
  };

  const handleReset = () => {
    setConfirm({
      title: '重置为示例数据？',
      description: '当前浏览器里的联系人会被 12 位示例联系人替换。建议先导出 Excel 备份。',
      confirmLabel: '重置并载入示例',
      cancelLabel: '取消',
      tone: 'danger',
      onConfirm: () => {
        setContacts(resetBook());
        setSelectedId(null);
        setScope('all');
        setActiveTag('');
        setQuery('');
        pushToast('已恢复示例数据，可以重新体验导入导出');
      },
    });
  };

  const handleTemplate = () => {
    try {
      const name = downloadTemplateFile();
      pushToast(`导入模板已下载：${name}`);
    } catch {
      pushToast('模板下载失败，请稍后重试', { type: 'error' });
    }
  };

  const handleImportApply = (nextContacts, summary) => {
    setContacts(nextContacts);
    setSelectedId(null);
    pushToast(
      `导入完成：新增 ${summary.created} 位，更新 ${summary.updated} 位，跳过 ${summary.skipped} 位`,
    );
  };

  const hasActiveFilter = Boolean(activeTag || query);
  const isSaving = storageOk
    ? '自动保存在本机'
    : '浏览器存储不可用，请及时导出 Excel';

  return (
    <div className="app-shell">
      <Sidebar
        stats={stats}
        scope={scope}
        activeTag={activeTag}
        onScopeChange={changeScope}
        onTagChange={changeTag}
        onNew={openNew}
        onImport={() => {
          setImportOpen(true);
          setMobileSidebar(false);
        }}
        onExport={() => {
          setExportOpen(true);
          setMobileSidebar(false);
        }}
        onTemplate={handleTemplate}
        onReset={handleReset}
        onClose={() => setMobileSidebar(false)}
        mobileOpen={mobileSidebar}
      />
      {mobileSidebar ? (
        <button
          type="button"
          className="sidebar-scrim"
          aria-label="收起侧栏"
          onClick={() => setMobileSidebar(false)}
        />
      ) : null}

      <main className="main-panel">
        <header className="topbar">
          <button
            type="button"
            className="icon-button mobile-menu-button"
            onClick={() => setMobileSidebar(true)}
            aria-label="打开侧栏"
          >
            <Icon name="menu" size={21} />
          </button>
          <div className="search-box">
            <Icon name="search" size={18} className="search-box__icon" />
            <input
              ref={searchRef}
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="搜索姓名、公司、标签或联系方式…"
              aria-label="搜索联系人"
              data-testid="search-input"
            />
            {query ? (
              <button
                type="button"
                className="search-box__clear"
                onClick={() => setQuery('')}
                aria-label="清除搜索"
              >
                <Icon name="close" size={15} />
              </button>
            ) : (
              <kbd className="search-box__kbd">/</kbd>
            )}
          </div>

          <div className="topbar__actions">
            <label className="sort-control">
              <Icon name="sort" size={16} />
              <span className="sort-control__label">排序</span>
              <select value={sort} onChange={(event) => setSort(event.target.value)} aria-label="联系人排序方式">
                <option value="recent">最近更新</option>
                <option value="name">姓名 A–Z</option>
                <option value="company">公司名称</option>
              </select>
            </label>
            <button type="button" className="button button--quiet topbar__import" onClick={() => setImportOpen(true)}>
              <Icon name="upload" size={16} />
              导入
            </button>
            <button
              type="button"
              className="button button--primary topbar__export"
              onClick={() => setExportOpen(true)}
              data-testid="export-button"
            >
              <Icon name="download" size={16} />
              导出 Excel
            </button>
          </div>
        </header>

        <div className="content">
          <header className="page-heading">
            <div className="page-heading__text">
              <p className="page-eyebrow">ADDRESS BOOK · 2026</p>
              <h1 data-testid="page-title">{scopeTitle}</h1>
              <p className="page-subtitle">{subtitle}</p>
            </div>
            <div className="heading-stats" aria-label="通讯录统计">
              <span>
                <strong>{stats.total}</strong>
                联系人
              </span>
              <span>
                <strong>{stats.favorites}</strong>
                收藏
              </span>
              <span>
                <strong>{stats.methods}</strong>
                联系方式
              </span>
            </div>
          </header>

          <div className="filter-strip">
            <div className="filter-strip__left">
              <button
                type="button"
                className={`filter-pill ${scope === 'all' && !activeTag ? 'is-active' : ''}`}
                onClick={() => changeScope('all')}
              >
                全部
              </button>
              <button
                type="button"
                className={`filter-pill ${scope === 'favorites' && !activeTag ? 'is-active' : ''}`}
                onClick={() => changeScope('favorites')}
                data-testid="toolbar-favorites"
              >
                <Icon name="star-filled" size={14} />
                收藏
                <span>{stats.favorites}</span>
              </button>
              {stats.tags.slice(0, 5).map((tag) => (
                <button
                  key={tag.name}
                  type="button"
                  className={`filter-pill ${activeTag === tag.name ? 'is-active' : ''}`}
                  onClick={() => changeTag(tag.name)}
                >
                  {tag.name}
                </button>
              ))}
            </div>
            <span className="filter-strip__note">
              <Icon name="star-filled" size={13} />
              收藏优先显示
            </span>
          </div>

          {hasActiveFilter ? (
            <div className="active-filters" aria-label="当前筛选">
              {query ? (
                <span className="active-filter">
                  搜索：{query}
                  <button type="button" onClick={() => setQuery('')} aria-label="移除搜索筛选">
                    <Icon name="close" size={13} />
                  </button>
                </span>
              ) : null}
              {activeTag ? (
                <span className="active-filter">
                  标签：{activeTag}
                  <button type="button" onClick={() => setActiveTag('')} aria-label="移除标签筛选">
                    <Icon name="close" size={13} />
                  </button>
                </span>
              ) : null}
              <button
                type="button"
                className="active-filter__clear"
                onClick={() => {
                  setQuery('');
                  setActiveTag('');
                  setScope('all');
                }}
              >
                清除全部
              </button>
            </div>
          ) : null}

          {visible.length ? (
            <section className="contact-grid" aria-label="联系人列表">
              {visible.map((contact, index) => (
                <ContactCard
                  key={contact.id}
                  contact={contact}
                  onOpen={setSelectedId}
                  onToggleFavorite={toggleFavorite}
                  style={{ '--card-index': Math.min(index, 12) }}
                />
              ))}
            </section>
          ) : (
            <EmptyState
              scope={scope}
              query={query}
              tag={activeTag}
              onNew={openNew}
              onClear={() => {
                setQuery('');
                setActiveTag('');
                setScope('all');
              }}
            />
          )}

          <footer className="content-footer">
            <span className={`storage-status ${storageOk ? '' : 'is-warning'}`}>
              <span className="storage-status__dot" aria-hidden="true" />
              {isSaving}
            </span>
            <span>按 <kbd>N</kbd> 新建 · 按 <kbd>/</kbd> 搜索 · 所有数据仅保存在当前浏览器</span>
          </footer>
        </div>
      </main>

      <button type="button" className="mobile-fab" onClick={openNew} aria-label="新建联系人">
        <Icon name="plus" size={22} />
      </button>

      {selected ? (
        <ContactDetail
          contact={selected}
          onClose={() => setSelectedId(null)}
          onEdit={openEdit}
          onDelete={handleDelete}
          onToggleFavorite={toggleFavorite}
          onCopied={pushToast}
        />
      ) : null}

      {editor ? (
        <ContactEditor
          key={editor.draft.id || 'new'}
          draft={editor.draft}
          isNew={editor.isNew}
          onSave={handleSaveContact}
          onClose={() => setEditor(null)}
        />
      ) : null}

      {importOpen ? (
        <ImportDialog
          existingContacts={contacts}
          onApply={handleImportApply}
          onClose={() => setImportOpen(false)}
          onNotify={pushToast}
        />
      ) : null}

      {exportOpen ? (
        <ExportDialog
          contacts={contacts}
          onClose={() => setExportOpen(false)}
          onNotify={pushToast}
        />
      ) : null}

      {confirm ? (
        <ConfirmDialog
          title={confirm.title}
          description={confirm.description}
          confirmLabel={confirm.confirmLabel}
          cancelLabel={confirm.cancelLabel}
          tone={confirm.tone}
          onConfirm={confirm.onConfirm}
          onClose={() => setConfirm(null)}
        />
      ) : null}

      <ToastStack toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
