# 把全英文博客发到 CSDN（操作指南）

> 适用文件：`docs/blog-csdn.md`（全英文、图片/视频使用 GitHub Pages 绝对地址，可直接粘进 CSDN Markdown 编辑器）
> 英文原稿：`docs/blog.md`；在线英文博客：<https://kaaj4k.github.io/contact-book/blog/>
> 素材目录：`docs/images/`、`docs/demo.mp4`

## 一、发布前确认

- 待发布文章必须是全英文：`docs/blog-csdn.md` 已检查，正文不含中文字符。
- 应用截图中的界面文案仍是中文，但博客标题、正文、表格、图注全部为英文。
- 文章开头「Assignment Description」表格中，`Assignment` 一行请补上课程作业帖的真实链接。

## 二、推荐发布方式：复制 Markdown

1. 登录 CSDN，打开创作中心 → **写博客**：
   <https://mp.csdn.net/mp_blog/creation/editor>
2. 在编辑器工具栏切换到 **Markdown** 模式（如果默认是富文本）。
3. 打开 `docs/blog-csdn.md`，全选复制，粘贴到 CSDN Markdown 编辑区。
4. 填写英文发布信息：
   - **Title**：`Software Engineering Individual Assignment: Contact Atlas (Bookmarks, Multiple Contact Methods, Excel Import/Export)`
   - **Tags**：`Software Engineering`, `React`, `Frontend`, `Excel`, `GitHub Pages`
   - **Summary**：`A local-first address book web app with bookmarks, unlimited contact methods, Excel import/export, and a public GitHub Pages deployment.`
   - **Category**：Software Engineering / Frontend（没有就新建）
   - **Original / Visibility**：Original、Public
5. 点击 Preview，重点检查：
   - 开头 Assignment Description 表格完整，`Assignment` 链接已替换。
   - 目录、标题层级、代码块、表格正常。
   - 15 张图片能显示（图片地址为 `https://kaaj4k.github.io/contact-book/blog/images/...`）。
   - Demo video 链接能打开。
6. 发布文章 → 等待审核 → 复制 CSDN 链接。
7. 把 CSDN 链接提交到课程平台；建议在文章开头的 `Live blog` 一行补上 CSDN 地址。

## 三、如果 CSDN 不显示外链图片

CSDN 对外链图片可能有缓存或限制。若预览显示破图，使用离线素材手动上传：

1. 在 CSDN 编辑器中，把光标放到原图片位置，点击工具栏 **Image** 按钮上传对应文件。
2. 上传后 CSDN 会插入自己的图片地址，用它替换 Markdown 中的 GitHub Pages 地址。
3. 图片顺序：

| Order | File | Section |
| ---: | --- | --- |
| 1 | `images/01-home.png` | 5. Application Screenshots – Main view |
| 2 | `images/02-favorites.png` | 5. Application Screenshots – Favorites |
| 3 | `images/03-contact-detail.png` | 5. Application Screenshots – Contact detail |
| 4 | `images/04-editor.png` | 5. Application Screenshots – Editor |
| 5 | `images/05-import-preview.png` | 5. Application Screenshots – Import preview |
| 6 | `images/06-import-result.png` | 5. Application Screenshots – Import result |
| 7 | `images/07-export.png` | 5. Application Screenshots – Export |
| 8 | `images/08-search.png` | 5. Application Screenshots – Search |
| 9 | `images/09-mobile.png` | 5. Application Screenshots – Mobile |
| 10 | `images/10-mobile-menu.png` | 5. Application Screenshots – Mobile menu |
| 11 | `images/video-poster.jpg` | 6. Demo Video – poster |
| 12 | `images/github-commits.png` | 3. Git Workflow – commit history |
| 13 | `images/github-contributors.png` | 3. Git Workflow – contributors |
| 14 | `images/github-pr.png` | 3. Git Workflow – pull request |
| 15 | `images/live-site.png` | 7. Cloud Deployment |

> 离线素材包 `contact-book-csdn-blog.zip` 中包含 `blog-csdn.md`、`images/` 和 `demo.mp4`。

## 四、视频说明

CSDN 一般不支持直接粘贴本地 `<video>` 标签。英文版文章中使用的是外链：

- Online video: <https://kaaj4k.github.io/contact-book/blog/demo.mp4>

如果课程要求视频内嵌，可以：
1. 把 `docs/demo.mp4` 上传到 Bilibili，再把 B 站链接插入 CSDN；或
2. 使用 CSDN 账号的视频发布功能上传后插入。

## 五、发布后检查

- [ ] 文章为英文，标题、摘要、标签、分类已填写。
- [ ] Assignment 表格中的课程作业帖链接已补充。
- [ ] 15 张图片全部显示，无破图。
- [ ] 视频外链可打开。
- [ ] 文章设置为原创、公开。
- [ ] CSDN 链接已提交到课程平台。
- [ ] 已预留审核时间，提前发布。

## 六、可直接复制的发布信息

```text
Title:
Software Engineering Individual Assignment: Contact Atlas (Bookmarks, Multiple Contact Methods, Excel Import/Export)

Tags:
Software Engineering, React, Frontend, Excel, GitHub Pages

Category:
Software Engineering / Frontend

Summary:
A local-first address book web app with bookmarks, unlimited contact methods, Excel import/export, and a public GitHub Pages deployment.
```
