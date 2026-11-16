# 联络簿 · Contact Atlas

一个为「软件工程 · 通讯录」个人编程作业实现的地址簿 Web 应用：收藏常用联系人、为同一个人维护任意多条联系方式，并支持 Excel 导入导出与云端访问。

> **在线体验**：<https://kaaj4k.github.io/contact-book/>  
> **在线博客**：<https://kaaj4k.github.io/contact-book/blog/>  
> **项目地址**：<https://github.com/kaaJ4K/contact-book>  
> **作业博客**：[docs/blog.md](docs/blog.md) · **演示视频**：[docs/demo.mp4](docs/demo.mp4)

![主界面](docs/images/01-home.png)

## 功能一览

| 作业要求 | 实现情况 |
| --- | --- |
| 收藏联系人 | 卡片右上角星标一键收藏/取消；侧栏「我的收藏」筛选；所有视图中收藏联系人优先排列；状态立即写入本机存储 |
| 多个联系方式 | 每位联系人可添加任意多条手机、邮箱、微信、QQ、地址或自定义平台；每条独立删除；详情页可单独复制 |
| Excel 导出 | 一位联系人一行，一种信息一列（16 列）；表头样式、列宽、隔行底色、自动筛选；可选「仅导出收藏」 |
| Excel 导入 | 支持 `.xlsx` / `.xlsm`；下载导入模板；文件拖拽；表头别名识别；逐行校验与错误提示；导入前预览；合并更新 / 跳过重复两种策略 |
| 页面样式 | 暖纸色 + 深森林绿的编辑风视觉；响应式侧栏、移动端单列、动效与减弱动效偏好适配 |
| 云端部署 | 构建为纯静态站点，部署在 GitHub Pages（公共云托管），可直接通过公网访问 |
| 其他加分能力 | 全局搜索、标签筛选、三种排序、自动保存、删除撤销、演示数据重置、键盘快捷键（`N` / `/` / `Ctrl+K`）、移动端悬浮新建按钮 |

## 技术栈

- **前端**：React 18 + 原生 ES Modules，无 UI 框架依赖
- **构建**：esbuild（`tools/build.mjs`，约 0.2 秒完成打包）
- **Excel**：`xlsx-js-style`，同时负责 `.xlsx` 的读取、生成与样式
- **存储**：浏览器 `localStorage`，无需登录、无后端、隐私数据不离开本机
- **样式**：手写 CSS（CSS 变量设计令牌），无第三方 UI 库
- **测试**：Node.js 内置 `node:test`，16 个单元测试覆盖数据模型、搜索、收藏排序、导入合并与 Excel 往返
- **部署**：esbuild 产物 → GitHub Pages

选择「本地优先 + 静态部署」的原因：通讯录属于高隐私数据，不必上传服务器；静态站点没有数据库和运维成本，打开即用，同时仍可完整演示收藏、多联系方式、Excel 导入导出三项核心作业要求。数据可以随时通过 Excel 导出迁移或备份。

## 快速开始

要求 Node.js **20.19+**（建议 22 LTS 或 24）。

```bash
git clone https://github.com/kaaJ4K/contact-book.git
cd contact-book
npm install
npm run build      # 生成 dist/
npm run preview    # 打开 http://127.0.0.1:4173
```

测试：

```bash
npm test
```

> `npm run dev` 会先构建再启动本地预览（本项目没有热更新开发服务器，保持依赖和构建链简单）。

首次打开会自动载入 12 位示例联系人，方便直接体验；可在侧栏底部点击「重置为示例数据」。所有修改只保存在当前浏览器，清除浏览器数据前请先导出 Excel。

## Excel 格式

点击应用内「导入 Excel → 下载导入模板」可获得带填写说明的 `.xlsx` 模板。导出文件为同样的 16 列表头：

| 姓名* | 公司 | 职位 | 生日 | 标签 | 收藏 | 手机1 | 手机2 | 手机3 | 邮箱1 | 邮箱2 | 微信 | QQ | 地址 | 其他 | 备注 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |

- **姓名**必填，其余列均可留空；也支持英文表头（`name`、`company`、`phone`、`email` 等）。
- 同类型联系方式多于预留列时，会折叠进最后一列并用 ` / ` 分隔（例如第 4 个手机号进入「手机3」）；再次导入时会还原为多条联系方式，不丢数据。
- 「其他」列使用 `平台: 账号` 格式，例如 `GitHub: octocat`；多个条目换行。
- 标签使用 `、` 分隔；生日使用 `yyyy-mm-dd`。
- 导入时可选择：
  - **合并更新**：姓名相同且手机号或邮箱匹配时，更新联系方式，保留原收藏、创建时间并合并标签；
  - **跳过重复**：只导入全新联系人。
- 错误行会标出行号：缺少姓名、无效邮箱、过短电话等会提示；单行错误不会阻断其他行。文件限制 8 MB、2000 行。

示例文件：[`docs/samples/import-demo.xlsx`](docs/samples/import-demo.xlsx)（演示 4 新增 / 2 更新 / 2 行提示）  
导出示例：[`docs/samples/export-demo.xlsx`](docs/samples/export-demo.xlsx)

## 项目结构

```text
contact-book/
├── src/
│   ├── App.jsx                 # 页面状态、筛选、导入导出入口
│   ├── components/             # 侧栏、卡片、详情抽屉、编辑器、导入/导出/确认弹窗
│   ├── data/seed.js            # 12 位示例联系人
│   ├── lib/contacts.js         # 数据模型、搜索排序、导入合并
│   ├── lib/excel.js            # Excel 头部映射、解析、校验、生成
│   ├── lib/storage.js          # localStorage 读写与重置
│   └── styles.css              # 设计令牌与全部样式
├── test/                       # node:test 单元测试
├── tools/                      # esbuild 构建、静态服务器、截图/录屏、示例生成
├── docs/
│   ├── blog.md                 # 作业博客（含 ToC、截图、PSP）
│   ├── images/                 # 程序截图
│   ├── samples/                # 导入/导出示例
│   └── demo.mp4                # 完整功能演示视频
├── codestyle.md                # 代码规范
└── index.html
```

## 测试与质量

```bash
npm test
```

16 个测试全部通过，覆盖：

- 数据规范化、必填校验、重复联系方式校验
- 姓名 / 公司 / 标签 / 联系方式全文搜索、标签筛选、收藏优先排序
- 重复联系人判断（姓名 + 手机号或邮箱）与合并/跳过两种导入模式
- Excel 导出列结构、多电话/多邮箱折叠与还原、自定义平台标签往返
- 模板解析、英文表头别名、标题行之前的表头扫描
- 缺少姓名/非法邮箱的错误行提示、无姓名列时的友好报错
- 公式注入防护

## 部署

构建产物是纯静态文件，可直接放到任意静态托管。当前使用的 GitHub Pages 发布流程：

```bash
npm run build
# 将 dist/ 推送为 gh-pages 分支（或由 CI 构建），在仓库 Settings → Pages
# 选择 Deploy from a branch: gh-pages / (root)
```

访问地址：<https://kaaj4k.github.io/contact-book/>

## 隐私说明

本项目没有服务端，联系人数据保存在浏览器 `localStorage`，不会上传到任何服务器。换设备或清理浏览器前，请使用「导出 Excel」做备份。

## 代码规范

见 [codestyle.md](codestyle.md)。

## License

MIT © 2026 Liao Weibin (832402110)
