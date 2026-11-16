import React from 'react';
import Icon, { BrandMark } from './Icons.jsx';
import Avatar from './Avatar.jsx';

const DATA_ACTIONS = [
  { key: 'import', label: '导入 Excel', icon: 'upload' },
  { key: 'export', label: '导出 Excel', icon: 'download' },
  { key: 'template', label: '下载导入模板', icon: 'file' },
];

export default function Sidebar({
  stats,
  scope,
  activeTag,
  onScopeChange,
  onTagChange,
  onNew,
  onImport,
  onExport,
  onTemplate,
  onReset,
  onClose,
  mobileOpen,
}) {
  const actions = {
    import: onImport,
    export: onExport,
    template: onTemplate,
  };

  return (
    <aside className={`sidebar ${mobileOpen ? 'is-open' : ''}`} aria-label="主侧栏">
      <div className="sidebar__brand-row">
        <div className="brand">
          <span className="brand__mark">
            <BrandMark size={42} />
          </span>
          <span className="brand__text">
            <strong>联络簿</strong>
            <small>Contact Atlas</small>
          </span>
        </div>
        <button type="button" className="icon-button sidebar__close" onClick={onClose} aria-label="收起侧栏">
          <Icon name="close" size={20} />
        </button>
      </div>

      <p className="sidebar__tagline">把重要的人，整理成一张清晰的地图。</p>

      <button type="button" className="new-contact-button" onClick={onNew} data-testid="new-contact">
        <Icon name="plus" size={19} />
        <span>新建联系人</span>
        <kbd>N</kbd>
      </button>

      <nav className="sidebar__nav" aria-label="联系人视图">
        <p className="sidebar__eyebrow">视图</p>
        <button
          type="button"
          className={`nav-item ${scope === 'all' && !activeTag ? 'is-active' : ''}`}
          onClick={() => onScopeChange('all')}
        >
          <span className="nav-item__icon">
            <Icon name="users" size={18} />
          </span>
          <span>全部联系人</span>
          <span className="nav-count">{stats.total}</span>
        </button>
        <button
          type="button"
          className={`nav-item ${scope === 'favorites' && !activeTag ? 'is-active' : ''}`}
          onClick={() => onScopeChange('favorites')}
          data-testid="favorites-filter"
        >
          <span className="nav-item__icon nav-item__icon--star">
            <Icon name="star-filled" size={17} />
          </span>
          <span>我的收藏</span>
          <span className="nav-count nav-count--accent">{stats.favorites}</span>
        </button>
      </nav>

      <div className="sidebar__tags">
        <div className="sidebar__section-head">
          <p className="sidebar__eyebrow">标签</p>
          <span>{stats.tags.length}</span>
        </div>
        {stats.tags.length ? (
          <div className="tag-list">
            {stats.tags.slice(0, 9).map((tag) => (
              <button
                key={tag.name}
                type="button"
                className={`tag-filter ${activeTag === tag.name ? 'is-active' : ''}`}
                onClick={() => onTagChange(tag.name)}
              >
                <span>{tag.name}</span>
                <small>{tag.count}</small>
              </button>
            ))}
          </div>
        ) : (
          <p className="sidebar__hint">给联系人加上标签，就能在这里快速分组。</p>
        )}
      </div>

      <div className="sidebar__data">
        <p className="sidebar__eyebrow">数据</p>
        {DATA_ACTIONS.map((action) => (
          <button
            key={action.key}
            type="button"
            className="data-link"
            onClick={actions[action.key]}
            data-testid={`sidebar-${action.key}`}
          >
            <Icon name={action.icon} size={17} />
            <span>{action.label}</span>
            <Icon name="chevron-right" size={14} className="data-link__chevron" />
          </button>
        ))}
      </div>

      <div className="sidebar__footer">
        <div className="local-badge">
          <span className="local-badge__dot" aria-hidden="true" />
          <div>
            <strong>自动保存在本机</strong>
            <small>清除浏览器数据前，记得先导出 Excel</small>
          </div>
        </div>
        <button type="button" className="reset-link" onClick={onReset}>
          <Icon name="refresh" size={14} />
          重置为示例数据
        </button>
        <div className="sidebar__profile">
          <Avatar name="廖伟镔" size={34} />
          <div>
            <strong>廖伟镔</strong>
            <small>832402110 · 个人项目</small>
          </div>
          <span className="profile-mark" title="当前使用者">
            我
          </span>
        </div>
      </div>
    </aside>
  );
}
