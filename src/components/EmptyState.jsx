import React from 'react';
import Icon from './Icons.jsx';

export default function EmptyState({ scope, query, tag, onNew, onClear }) {
  const isFiltering = Boolean(query || tag);
  let title = '这里还没有联系人';
  let copy = '新建第一位联系人，或把已有的 Excel 通讯录导入进来。';
  if (isFiltering) {
    title = '没有找到匹配的联系人';
    copy = query ? `没有与「${query}」匹配的结果，换个关键词试试。` : `标签「${tag}」下还没有联系人。`;
  } else if (scope === 'favorites') {
    title = '收藏夹还是空的';
    copy = '在联系人卡片右上角点亮星标，常用的人就会出现在这里。';
  }

  return (
    <div className="empty-state">
      <div className="empty-state__art" aria-hidden="true">
        <span className="empty-state__ring empty-state__ring--one" />
        <span className="empty-state__ring empty-state__ring--two" />
        <span className="empty-state__card empty-state__card--back" />
        <span className="empty-state__card empty-state__card--front">
          <span />
          <span />
          <span />
        </span>
        <span className="empty-state__star">
          <Icon name="star-filled" size={22} />
        </span>
      </div>
      <h3>{title}</h3>
      <p>{copy}</p>
      <div className="empty-state__actions">
        {isFiltering ? (
          <button type="button" className="button button--quiet" onClick={onClear}>
            清除筛选
          </button>
        ) : null}
        <button type="button" className="button button--primary" onClick={onNew}>
          <Icon name="plus" size={17} />
          新建联系人
        </button>
      </div>
    </div>
  );
}
