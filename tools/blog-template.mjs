/**
 * Blog page template. The assignment Markdown is rendered at build time with
 * marked and wrapped in this editorial layout, so the blog is available at
 * /blog/ alongside the app on GitHub Pages.
 */
export function renderBlogPage({ title, body, markdownHref, appHref, repoHref }) {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${title}</title>
<meta name="description" content="Contact Atlas assignment blog: bookmarks, multiple contact methods, Excel import/export, and cloud deployment.">
<link rel="icon" type="image/svg+xml" href="../favicon.svg">
<style>
:root {
  --ink: #1f332e;
  --ink-soft: #42564e;
  --paper: #f5efe4;
  --surface: #fffdf8;
  --line: #e4dac9;
  --line-strong: #d5c6b0;
  --coral: #cf6749;
  --coral-deep: #b8553a;
  --gold: #e5a84f;
  --sage: #6f8878;
  --muted: #7c7469;
  --display: "Iowan Old Style", "Palatino Linotype", "Songti SC", Georgia, serif;
  --body: "Segoe UI", "PingFang SC", "Microsoft YaHei", sans-serif;
  --mono: "Cascadia Mono", Consolas, monospace;
}
* { box-sizing: border-box; }
body {
  margin: 0; color: var(--ink);
  background:
    radial-gradient(circle at 92% 4%, rgba(207,103,73,.08), transparent 30rem),
    radial-gradient(circle at 3% 96%, rgba(111,136,120,.1), transparent 28rem),
    var(--paper);
  font-family: var(--body); font-size: 15px; line-height: 1.85;
}
a { color: var(--coral-deep); text-decoration-thickness: 1px; text-underline-offset: 3px; }
a:hover { color: var(--ink); }
.site-header {
  position: sticky; top: 0; z-index: 10; display: flex; align-items: center; gap: 18px;
  padding: 14px 28px; border-bottom: 1px solid rgba(213,198,176,.6);
  background: rgba(245,239,228,.88); backdrop-filter: blur(16px);
}
.site-brand { display: flex; flex-direction: column; line-height: 1.2; margin-right: auto; }
.site-brand strong { font-family: var(--display); font-size: 21px; font-weight: 600; letter-spacing: .05em; }
.site-brand small { margin-top: 2px; font-family: var(--mono); font-size: 8.5px; letter-spacing: .18em; color: var(--muted); }
.site-nav { display: flex; align-items: center; gap: 7px; }
.site-nav a {
  padding: 6px 11px; border: 1px solid transparent; border-radius: 8px;
  color: var(--ink-soft); font-size: 11.5px; text-decoration: none;
}
.site-nav a:hover { border-color: var(--line-strong); background: var(--surface); color: var(--ink); }
.site-nav a.primary { border-color: var(--ink); background: var(--ink); color: #f8f2e6; }
main { width: min(920px, calc(100% - 38px)); margin: 0 auto; padding: 52px 0 70px; }
.article {
  padding: clamp(24px, 5vw, 58px); border: 1px solid var(--line); border-radius: 26px;
  background: var(--surface); box-shadow: 0 30px 70px -54px rgba(31,51,46,.4);
}
.article > h1:first-child {
  margin-top: 0; font-family: var(--display); font-size: clamp(30px, 4.4vw, 46px);
  font-weight: 500; letter-spacing: -.015em; line-height: 1.28;
}
h1, h2, h3, h4 { font-family: var(--display); font-weight: 600; line-height: 1.35; letter-spacing: -.005em; }
h1 { margin: 1.2em 0 .6em; font-size: 34px; }
h2 {
  margin: 2.1em 0 .7em; padding-top: .7em; border-top: 1px solid var(--line);
  font-size: 27px; font-weight: 500;
}
h3 { margin: 1.7em 0 .5em; font-size: 20px; }
h4 { margin: 1.4em 0 .3em; font-size: 16px; }
p { margin: .7em 0; }
ul, ol { padding-left: 1.4em; margin: .7em 0; }
li { margin: .25em 0; }
li::marker { color: var(--coral); }
hr { margin: 2.4em 0; border: 0; border-top: 1px solid var(--line); }
blockquote {
  margin: 1.2em 0; padding: 12px 18px; border-left: 3px solid rgba(207,103,73,.45);
  border-radius: 0 10px 10px 0; background: rgba(247,228,219,.25); color: var(--ink-soft);
}
blockquote p { margin: .2em 0; }
code {
  padding: 2px 5px; border: 1px solid var(--line); border-radius: 5px;
  background: #f9f4e9; color: #7a4a36; font-family: var(--mono); font-size: .84em;
}
pre {
  overflow-x: auto; margin: 1.3em 0; padding: 17px 19px; border: 1px solid #263c34;
  border-radius: 12px; background: #1b2d27; color: #f2ebdd; line-height: 1.65;
}
pre code { padding: 0; border: 0; background: transparent; color: inherit; font-size: 12px; }
table {
  width: 100%; margin: 1.4em 0; border-collapse: collapse; font-size: 12.5px; line-height: 1.6;
  background: var(--surface); border: 1px solid var(--line); border-radius: 10px; overflow: hidden;
}
thead { background: #f1e9db; }
th { padding: 9px 10px; border-bottom: 1px solid var(--line-strong); color: var(--ink-soft); font-weight: 600; text-align: left; }
td { padding: 8px 10px; border-bottom: 1px solid rgba(228,218,201,.66); vertical-align: top; }
tbody tr:nth-child(even) { background: rgba(251,247,238,.5); }
tbody tr:last-child td { border-bottom: 0; }
img { max-width: 100%; height: auto; border-radius: 10px; box-shadow: 0 14px 30px -24px rgba(31,51,46,.42); }
img[src$="video-poster.jpg"] { border: 1px solid var(--line); }
video { width: 100%; margin: 1.2em 0; border-radius: 12px; background: #14251f; }
.article > h1 + p, .article > p:first-of-type { color: var(--muted); }
footer { width: min(920px, calc(100% - 38px)); margin: 0 auto 40px; color: var(--muted); font-size: 11px; text-align: center; }
footer a { margin: 0 6px; }
@media (max-width: 720px) {
  body { font-size: 14px; }
  .site-header { padding: 11px 15px; flex-wrap: wrap; gap: 8px; }
  .site-nav a { padding: 5px 8px; font-size: 10.5px; }
  main { padding-top: 22px; }
  .article { padding: 19px 16px; border-radius: 16px; }
  h1 { font-size: 27px; }
  h2 { font-size: 23px; }
  h3 { font-size: 18px; }
  table { display: block; overflow-x: auto; white-space: nowrap; }
  pre { font-size: 11px; }
}
@media (prefers-reduced-motion: reduce) {
  * { scroll-behavior: auto !important; transition-duration: .01ms !important; }
}
</style>
</head>
<body>
<header class="site-header">
  <div class="site-brand">
    <strong>Contact Atlas</strong>
    <small>ASSIGNMENT BLOG · 2026</small>
  </div>
  <nav class="site-nav" aria-label="Page navigation">
    <a href="${appHref}">Open app</a>
    <a href="${repoHref}">GitHub repository</a>
    <a href="${markdownHref}">Markdown source</a>
  </nav>
</header>
<main>
  <article class="article">
${body}
  </article>
</main>
<footer>
  <span>Software Engineering Individual Assignment · Liao Weibin 832402110</span><br>
  <a href="${appHref}">Live app</a> · <a href="${repoHref}">Repository</a> · <a href="${markdownHref}">blog.md</a>
</footer>
</body>
</html>
`;
}
