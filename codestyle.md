# 联络簿 · Code Standard

本规范用于约束本项目的命名、结构、样式与提交流程。规则参考 Google HTML/CSS Style Guide、Google JavaScript Style Guide 与 Airbnb JavaScript Style Guide；可读性与规则冲突时，以可读性优先，但同一文件内必须保持一致。

- Google HTML/CSS Style Guide — <https://google.github.io/styleguide/htmlcssguide.html>
- Google JavaScript Style Guide — <https://google.github.io/styleguide/jsguide.html>
- Airbnb JavaScript Style Guide — <https://github.com/airbnb/javascript>

## 1. 目录与模块

1. `src/components/` 只放展示与交互组件；数据计算放在 `src/lib/`，页面级状态集中在 `src/App.jsx`。
2. `src/lib/excel.js` 是唯一直接依赖 `xlsx-js-style` 的模块；UI 不直接操作工作簿。
3. `src/lib/storage.js` 是唯一读写 `localStorage` 的模块，便于测试和替换存储实现。
4. 示例数据仅存在于 `src/data/seed.js`，不在组件中散落演示数据。
5. 构建脚本、截图脚本与静态服务器放在 `tools/`，不混入运行时源码。

## 2. HTML / JSX

1. 使用语义化标签：`header`、`nav`、`main`、`section`、`article`、`footer`。
2. 每个纯图标按钮必须有 `aria-label`；所有输入必须有标签或 `aria-label`。
3. 不使用内联事件处理属性（如 `onclick="..."`）；事件统一在 JSX 中绑定。
4. 交互元素支持键盘：卡片可聚焦，`Enter` / `Space` 打开，`Escape` 关闭最上层弹窗。
5. 为自动化测试关键入口添加 `data-testid`，测试选择器不要依赖样式类名。

## 3. CSS

1. 类名使用小写 kebab-case；页面级块使用 BEM 风格的 `block__element--modifier`。
2. 颜色、阴影、字号、圆角、动画时长统一声明在 `:root` 设计令牌中，组件内不出现散落的十六进制颜色（透明叠加除外）。
3. 布局使用 Flexbox / CSS Grid；页面流不依赖绝对定位。绝对定位只用于装饰元素或轻量角标。
4. 每个组件样式前用注释横幅分组。
5. 所有非必要动画必须在 `@media (prefers-reduced-motion: reduce)` 中关闭。
6. 断点固定为 1240 / 1080 / 980 / 760 / 430 px，新增断点需说明原因。
7. 交互状态必须覆盖 `:hover`、`:focus-visible`、`:disabled`，不能只依赖颜色变化。

## 4. JavaScript / React

1. 仅使用 ES Modules；不使用全局变量或 `window` 挂载业务对象。
2. 两空格缩进、单引号、分号、多行字面量尾逗号。
3. 变量和函数使用 `camelCase`，组件使用 `PascalCase`，模块级常量使用 `SCREAMING_SNAKE_CASE`。
4. 优先 `const`；只有需要重新赋值时才使用 `let`。
5. 不修改传入对象：状态更新使用展开运算符或 `map` / `filter` 生成新对象。
6. 所有面向用户的异步失败（导入、导出、复制、下载）必须转成可读提示，不能静默 `catch`。
7. 派生数据使用 `useMemo` 或纯函数计算，不额外存一份可能不同步的 state。
8. 禁止 `eval`、`new Function` 或字符串拼接 HTML；用户输入通过 React 自动转义。
9. 导入文件必须校验扩展名、大小和行数，再交给解析器；解析在内存中完成。

## 5. Excel 与数据边界

1. Excel 的列名、别名与列宽集中定义在 `EXCEL_COLUMNS` / `HEADER_ALIASES`。
2. 导入导出必须可往返：多手机号、邮箱、自定义平台标签、标签和收藏状态都要保留。
3. 导入先完成整份文件的解析与预览，再允许用户确认写入；写入时一次更新状态，避免多次渲染。
4. 错误行给出 Excel 行号与可操作原因；单行错误不得中断整次导入。
5. 以 `=`, `+`, `-`, `@` 开头的字符串在导出时加 `'` 前缀，防止公式注入；再次导入时还原。

## 6. Git

1. 提交信息采用 `type(scope): summary`，例如 `feat(editor): support multiple contact methods`。
2. 一次提交只做一件逻辑变更；不提交 `node_modules/`、`dist/`、本地数据库或截图录制中间产物。
3. 推送前必须运行 `npm test`，全部通过后再提交。
4. 主要功能在 feature 分支开发，通过 Pull Request 合并到 `main`；发布时打 `vX.Y.Z` tag 并创建 Release。
