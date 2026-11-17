# 把这篇博客发到 CSDN（操作指南）

> 适用文件：`docs/blog-csdn.md`（已把图片、视频改成 GitHub Pages 绝对地址，可直接粘进 CSDN Markdown 编辑器）
> 素材目录：`docs/images/`、`docs/demo.mp4`
> 在线预览：<https://kaaj4k.github.io/contact-book/blog/>

## 一、推荐的发布方式：复制 Markdown

1. 登录 CSDN，打开创作中心 → **写博客**：
   <https://mp.csdn.net/mp_blog/creation/editor>
2. 编辑器默认可能是富文本。在标题下方或编辑器工具栏找到 **Markdown** 按钮，切换为 Markdown 模式。
   - 如果编辑器提供「导入」/「导入文档」入口，也可以直接导入 `docs/blog-csdn.md`；导入后仍然要按第 5 步检查图片。
3. 用 VS Code / 记事本打开 `docs/blog-csdn.md`，**全选 → 复制 → 粘贴**到 CSDN 的 Markdown 编辑区。
4. 填写发布信息：
   - **标题**：`软件工程个人作业：联络簿 Contact Atlas（收藏 / 多联系方式 / Excel 导入导出）`
   - **标签**：`软件工程`、`React`、`前端`、`Excel`、`GitHub Pages`
   - **摘要**：一个本地优先的通讯录 Web 应用，支持收藏联系人、多条联系方式、Excel 导入导出，并已部署到 GitHub Pages。
   - **分类专栏**：软件工程 / 前端（没有就新建）
   - **原创类型**：原创；**可见范围**：公开
5. 点击「预览」，重点检查：
   - 开头「作业说明」表格是否完整；把「作业布置位置」补成课程作业帖的实际链接。
   - 目录、一级/二级标题、代码块、表格是否正常。
   - 15 张图片是否都能显示（图片地址是 `https://kaaj4k.github.io/contact-book/blog/images/...`）。
   - 视频链接是否能打开；CSDN 一般不支持直接播放仓库里的 MP4，保留链接即可。
6. 点击「发布文章」→ 等待审核通过 → 复制 CSDN 文章链接。
7. 把 CSDN 链接提交到课程平台，并建议在博客开头「在线博客」一行补充 CSDN 地址。

## 二、如果 CSDN 显示不了外链图片

CSDN 对外链图片有过限制或缓存失败的情况。若预览中图片是破图，使用下面的方式 B：

1. 在 CSDN 编辑器中，把光标放到原本图片的位置，点击工具栏的 **图片** 按钮，上传对应文件。
2. 上传完成后，CSDN 会插入它自己的图片地址，用该地址替换 Markdown 中的 GitHub Pages 地址。
3. 图片与文章位置对应关系：

| 顺序 | 文件 | 出现位置 |
| --- | --- | --- |
| 1 | `images/01-home.png` | 五、程序截图 · 主界面 |
| 2 | `images/02-favorites.png` | 五、程序截图 · 我的收藏 |
| 3 | `images/03-contact-detail.png` | 五、程序截图 · 联系人详情 |
| 4 | `images/04-editor.png` | 五、程序截图 · 编辑器 |
| 5 | `images/05-import-preview.png` | 五、程序截图 · 导入预览 |
| 6 | `images/06-import-result.png` | 五、程序截图 · 导入结果 |
| 7 | `images/07-export.png` | 五、程序截图 · 导出 |
| 8 | `images/08-search.png` | 五、程序截图 · 搜索 |
| 9 | `images/09-mobile.png` | 五、程序截图 · 移动端首页 |
| 10 | `images/10-mobile-menu.png` | 五、程序截图 · 移动端侧栏 |
| 11 | `images/video-poster.jpg` | 六、运行视频 · 视频封面 |
| 12 | `images/github-commits.png` | 三、Git 协作 · 提交历史 |
| 13 | `images/github-contributors.png` | 三、Git 协作 · 贡献者 |
| 14 | `images/github-pr.png` | 三、Git 协作 · PR |
| 15 | `images/live-site.png` | 七、云端部署 · 公网访问 |

> 也可以直接使用打包好的 `contact-book-csdn-blog.zip`（与本文同目录提供），里面包含：
> `blog-csdn.md`、`images/`、`demo.mp4`。

## 三、视频怎么放

CSDN 博客不支持直接粘贴本地 `<video>` 标签。三种做法：

1. **最简单**：保留文章中的外链「点击在线观看」，指向 GitHub Pages 的 `demo.mp4`。
2. **上传 B 站**：把 `docs/demo.mp4` 上传到 B 站，然后在 CSDN 编辑器用「视频」按钮插入 B 站视频链接。
3. **上传 CSDN 视频**：如果账号有视频发布权限，先发布视频，再在文章中插入。

## 四、发布后检查

- [ ] 文章标题、摘要、标签、分类已填写。
- [ ] 开头「作业说明」表格中的「作业布置位置」已换成本课程作业帖的真实链接。
- [ ] 15 张图片全部可见，无破图。
- [ ] 视频外链可打开。
- [ ] 已设置为公开、原创。
- [ ] 已把 CSDN 文章链接提交到课程平台。
- [ ] 博客需要审核，建议现在就发布，不要等到截止前。

## 五、发布信息速填

```text
标题：软件工程个人作业：联络簿 Contact Atlas（收藏 / 多联系方式 / Excel 导入导出）
标签：软件工程、React、前端、Excel、GitHub Pages
分类：软件工程 / 前端
摘要：一个本地优先的通讯录 Web 应用，支持收藏联系人、多条联系方式、Excel 导入导出，并已部署到 GitHub Pages。
```

发布完成后，如果课程平台要求“博客地址”，提交：

```text
https://blog.csdn.net/你的用户名/article/details/文章ID
```
