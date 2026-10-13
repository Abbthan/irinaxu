"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import { DEFAULT_TRANSLATIONS } from "@/lib/i18n/dictionary";
import { parseSiteContent, type SiteContent } from "@/lib/site-content";
import {
  CONTENT_PATH,
  GitHubEditor,
  toBase64,
  type RepositoryFile,
  type TextFile,
  type PublishResult,
} from "@/lib/admin/github";
import styles from "./admin-editor.module.css";

type View = "text" | "images" | "code";
const CATALOG: Readonly<Record<string, string>> = {
  ...DEFAULT_TRANSLATIONS,
  "So I didn’t stop sending lamps — I started teaching the kids to make videos instead. A way to be seen, on their own terms, again and again.":
    "So I didn’t stop sending lamps — I started teaching the kids to make videos instead. A way to be seen, on their own terms, again and again.",
  "I started the Youth Venture Alliance — no family name behind me, just enough stubbornness to connect a thousand high school founders who wanted to build something that mattered.":
    "I started the Youth Venture Alliance — no family name behind me, just enough stubbornness to connect a thousand high school founders who wanted to build something that mattered.",
  "I stopped being a single point of light. I became a wire, carrying whatever I had toward whoever had an idea worth it.":
    "I stopped being a single point of light. I became a wire, carrying whatever I had toward whoever had an idea worth it.",
  "I wrote about animal rights for the John Locke Institute, researched green business through IPQ, and renamed the interview show I ran — once just 17 Interviews — to Light Talks.":
    "I wrote about animal rights for the John Locke Institute, researched green business through IPQ, and renamed the interview show I ran — once just 17 Interviews — to Light Talks.",
  "Interviews at Light Talks": "Interviews at Light Talks",
  "IRINA XU": "IRINA XU",
};

const obsolete = new Set([
  "I had thought I was giving light. What they needed was to be seen.",
  "So I didn’t stop sending lamps — I started teaching the kids to make videos instead. Not another tool for them to use once. A way to be seen, on their own terms, again and again.",
  "I started the Youth Venture Alliance. No family name behind me, no head start — just enough stubbornness to connect a thousand high school founders who wanted to build something that mattered.",
  "I stopped being a single point of light. I became a wire — carrying whatever I had toward whoever had an idea worth it.",
  "I wrote about animal rights for the John Locke Institute. I researched green business through IPQ. And I renamed the interview show I ran — once just called 17 Interviews — to Light Talks, because I realized what I actually wanted was for two people’s thinking to strike against each other and catch.",
]);
const SOURCES = Object.keys(CATALOG).filter((source) => !obsolete.has(source));
const LABELS = { text: "文字内容", images: "图片素材", code: "代码编辑" };

function errorMessage(error: unknown) {
  return error instanceof Error
    ? error.message
    : "Something went wrong. Please try again.";
}
async function fileBase64(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () =>
      typeof reader.result === "string"
        ? resolve(reader.result.split(",")[1])
        : reject(new Error("Could not read this file."));
    reader.onerror = () => reject(new Error("Could not read this file."));
    reader.readAsDataURL(file);
  });
}

export function AdminEditor() {
  const editor = useRef<GitHubEditor | null>(null);
  const requestId = useRef(0);
  const [key, setKey] = useState("");
  const [user, setUser] = useState("");
  const [view, setView] = useState<View>("text");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const [files, setFiles] = useState<RepositoryFile[]>([]);
  const [content, setContent] = useState<SiteContent>({ version: 1, text: {} });
  const [contentFile, setContentFile] = useState<TextFile | null>(null);
  const [source, setSource] = useState("What is light?");
  const [search, setSearch] = useState("");
  const [codePath, setCodePath] = useState("src/app/page.tsx");
  const [codeFile, setCodeFile] = useState<TextFile | null>(null);
  const [codeDraft, setCodeDraft] = useState("");
  const [imagePath, setImagePath] = useState("public/images/village-lamp.png");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState("");
  const [imageSha, setImageSha] = useState("");
  const [message, setMessage] = useState("");
  const [review, setReview] = useState(false);
  const [lastCommit, setLastCommit] = useState<PublishResult | null>(null);

  const textDraft = JSON.stringify(content);
  const textDirty =
    !!contentFile &&
    textDraft !==
      JSON.stringify(parseSiteContent(JSON.parse(contentFile.text)));
  const codeDirty = !!codeFile && codeDraft !== codeFile.text;
  const dirty = textDirty || codeDirty || !!imageFile;
  const currentDirty =
    view === "text" ? textDirty : view === "code" ? codeDirty : !!imageFile;
  const sources = [...new Set([...SOURCES, ...Object.keys(content.text)])];
  const values = content.text[source] ?? {
    en: source,
    zh: CATALOG[source] ?? source,
  };

  useEffect(() => {
    const warn = (event: BeforeUnloadEvent) => {
      if (dirty) {
        event.preventDefault();
        event.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);
  useEffect(() => {
    return () => {
      editor.current?.clear();
    };
  }, []);
  useEffect(
    () => () => {
      if (imagePreview) URL.revokeObjectURL(imagePreview);
    },
    [imagePreview],
  );

  async function connect(event: FormEvent) {
    event.preventDefault();
    setError("");
    setBusy(true);
    const next = new GitHubEditor(key);
    try {
      const login = await next.connect();
      const [tree, loaded] = await Promise.all([
        next.listFiles(),
        next.loadText(CONTENT_PATH),
      ]);
      const parsed = parseSiteContent(JSON.parse(loaded.text));
      editor.current?.clear();
      editor.current = next;
      setFiles(tree);
      setContent(parsed);
      setContentFile(loaded);
      setUser(login);
      setKey("");
      setStatus("已连接。修改仍是草稿，点击发布才会更新网站。");
    } catch (caught) {
      next.clear();
      setError(errorMessage(caught));
    } finally {
      setBusy(false);
    }
  }

  async function loadCode(path: string) {
    const id = ++requestId.current;
    if (!editor.current) return;
    setBusy(true);
    setError("");
    setCodeFile(null);
    try {
      const loaded = await editor.current.loadText(path);
      if (id === requestId.current) {
        setCodePath(path);
        setCodeFile(loaded);
        setCodeDraft(loaded.text);
      }
    } catch (caught) {
      if (id === requestId.current) setError(errorMessage(caught));
    } finally {
      if (id === requestId.current) setBusy(false);
    }
  }

  function switchView(next: View) {
    setView(next);
    setReview(false);
    setError("");
    if (next === "code" && !codeFile) void loadCode(codePath);
  }
  function changeText(locale: "en" | "zh", value: string) {
    setContent((current) => ({
      ...current,
      text: { ...current.text, [source]: { ...values, [locale]: value } },
    }));
  }

  async function chooseImage(file: File | undefined) {
    if (!file || busy) return;
    setError("");
    setBusy(true);
    try {
      if (file.type !== "image/png" || file.size > 10 * 1024 * 1024)
        throw new Error(
          "Please choose a PNG image smaller than 10 MB. Keep transparent backgrounds on scene layers.",
        );
      const header = await file.slice(0, 24).arrayBuffer();
      const signature = new Uint8Array(header.slice(0, 8));
      if (signature.join(",") !== "137,80,78,71,13,10,26,10")
        throw new Error("This is not a valid PNG file.");
      if (header.byteLength < 24) throw new Error("This PNG file is incomplete.");
      const dimensions = new DataView(header);
      const width = dimensions.getUint32(16);
      const height = dimensions.getUint32(20);
      if (!width || !height || width > 8192 || height > 8192 || width * height > 32000000) throw new Error("The PNG canvas is too large. Use the original canvas dimensions.");
      const bitmap = await createImageBitmap(file);
      const original = new Image();
      original.src = `/${imagePath.slice(7)}`;
      let timeout = 0;
      try {
        await Promise.race([original.decode(), new Promise<never>((_, reject) => {
          timeout = window.setTimeout(() => reject(new Error("Image comparison timed out. Check your connection and try again.")), 15000);
        })]);
      } finally { window.clearTimeout(timeout); bitmap.close(); }
      const matches =
        width === original.naturalWidth &&
        height === original.naturalHeight;
      if (!matches)
        throw new Error(
          `Keep the original canvas size (${original.naturalWidth} × ${original.naturalHeight}) so the layered scene does not get cropped or misaligned.`,
        );
      const tree = await editor.current!.listFiles();
      const current = tree.find((item) => item.path === imagePath);
      if (!current)
        throw new Error("The original image was not found. Reload the page.");
      setImageSha(current.sha);
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    } catch (caught) {
      setError(errorMessage(caught));
    } finally {
      setBusy(false);
    }
  }

  async function publish() {
    if (!editor.current || !message.trim() || busy) return;
    setBusy(true);
    setError("");
    try {
      const path =
        view === "text" ? CONTENT_PATH : view === "code" ? codePath : imagePath;
      const sha =
        view === "text"
          ? contentFile!.sha
          : view === "code"
            ? codeFile!.sha
            : imageSha;
      if (view === "code" && path === CONTENT_PATH && textDirty) throw new Error("Publish or reset your text drafts before editing their JSON source, so no draft is lost.");
      if (view === "code" && path === CONTENT_PATH)
        parseSiteContent(JSON.parse(codeDraft));
      const encoded =
        view === "images"
          ? await fileBase64(imageFile!)
          : toBase64(
              view === "text"
                ? JSON.stringify(parseSiteContent(content), null, 2) + "\n"
                : codeDraft,
            );
      const result = await editor.current.publish(path, encoded, sha, message);
      setLastCommit(result);
      setReview(false);
      setMessage("");
      setStatus(
        "提交成功。Cloudflare 正在自动构建；构建成功后才会更新线上网站，通常需要约 1 分钟。",
      );
      // Refresh the published SHA; any other unsaved editor stays untouched.
      if (view === "text" || path === CONTENT_PATH) {
        const loaded = await editor.current.loadText(CONTENT_PATH);
        setContentFile(loaded);
        setContent(parseSiteContent(JSON.parse(loaded.text)));
      }
      if (view === "code") {
        const loaded = await editor.current.loadText(codePath);
        setCodeFile(loaded);
        setCodeDraft(loaded.text);
      }
      if (view === "images") {
        setImageFile(null);
        setImagePreview("");
        setFiles(await editor.current.listFiles());
      }
    } catch (caught) {
      setError(errorMessage(caught));
    } finally {
      setBusy(false);
    }
  }

  function disconnect() {
    if (dirty && !window.confirm("有未发布的草稿。退出会丢弃草稿，确定退出？"))
      return;
    ++requestId.current;
    editor.current?.clear();
    editor.current = null;
    setUser("");
    setKey("");
    setContentFile(null);
    setContent({ version: 1, text: {} });
    setCodeFile(null);
    setCodeDraft("");
    setImageFile(null);
    setImagePreview("");
    setFiles([]);
    setLastCommit(null);
    setError("");
    setStatus("");
    setReview(false);
  }

  return (
    <main className={styles.studio} data-no-translate>
      <header className={styles.header}>
        <Link className={styles.brand} href="/">
          IRINA XU<span>WEBSITE STUDIO / 网站后台</span>
        </Link>
        <a href="/" target="_blank" rel="noreferrer">
          查看网站 ↗
        </a>
      </header>
      {!user ? (
        <div className={styles.login}>
          <div className={styles.introduction}>
            <span className={styles.eyebrow}>
              A QUIET PLACE TO MAKE CHANGES
            </span>
            <h1>
              Keep the story
              <br />
              <em>in your hands.</em>
            </h1>
            <p>
              在这里修改文字、替换图片，或编辑网站代码。每次发布都有 GitHub
              记录，Cloudflare 自动更新到域名。
            </p>
            <div className={styles.rule} />
            <span className={styles.note}>
              私人编辑权限 · 版本记录 · 自动部署
            </span>
          </div>
          <form className={styles.loginCard} onSubmit={connect}>
            <span className={styles.eyebrow}>EDITOR ACCESS / 编辑者入口</span>
            <h2>连接你的 GitHub</h2>
            <p>
              使用有此仓库编辑权限的账号和专用访问密钥。不要填写 GitHub 或
              Cloudflare 密码。
            </p>
            <label htmlFor="editor-key">GitHub 访问密钥 / Access key</label>
            <input
              id="editor-key"
              type="password"
              value={key}
              onChange={(event) => setKey(event.target.value)}
              autoComplete="off"
              spellCheck={false}
              required
              placeholder="github_pat_…"
            />
            <button className={styles.primary} disabled={busy || !key.trim()}>
              {busy ? "正在验证…" : "进入网站后台 →"}
            </button>
            {error && (
              <p className={styles.error} role="alert">
                {error}
              </p>
            )}
            <details>
              <summary>首次使用？如何获取编辑权限</summary>
              <ol>
                <li>由仓库主人在 GitHub 添加你的账号为协作者；接受邀请。</li>
                <li>
                  在 GitHub 创建专用 token。仅选择{" "}
                  <strong>Abbthan/irinaxu</strong>，权限设为{" "}
                  <strong>Contents: Read and write</strong>。
                </li>
                <li>
                  粘贴密钥并连接。若协作者账号无法选择此私人仓库，请向主人申请专用密钥，或使用可访问此仓库的
                  classic token（repo 权限）。
                </li>
              </ol>
              <a
                href="https://github.com/settings/personal-access-tokens"
                target="_blank"
                rel="noreferrer"
              >
                打开 GitHub 访问密钥设置 ↗
              </a>
            </details>
            <p className={styles.security}>
              密钥只保留在当前页面内存中。刷新、关闭页面或退出后需要重新连接；不会写入网站文件或浏览器存储。
            </p>
          </form>
        </div>
      ) : (
        <div className={styles.workspace}>
          <aside className={styles.sidebar}>
            <span className={styles.eyebrow}>EDIT & PUBLISH</span>
            <nav aria-label="编辑工具">
              {(["text", "images", "code"] as View[]).map((item, index) => (
                <button
                  key={item}
                  aria-pressed={view === item}
                  onClick={() => switchView(item)}
                  disabled={busy}
                >
                  <span>0{index + 1}</span>
                  {LABELS[item]}
                </button>
              ))}
            </nav>
            <div className={styles.account}>
              <span className={styles.dot} />
              {user}
              <small>Abbthan/irinaxu · main</small>
              <button onClick={disconnect} disabled={busy}>
                退出连接
              </button>
            </div>
          </aside>
          <section className={styles.editor}>
            <div className={styles.toolbar}>
              <div>
                <span className={styles.eyebrow}>YOUR WEBSITE, YOUR WORDS</span>
                <h1>{LABELS[view]}</h1>
              </div>
              <button
                className={styles.primary}
                onClick={() => {
                  setReview(true);
                  setMessage(
                    `Update ${view === "text" ? "website text" : view === "images" ? imagePath : codePath} from website studio`,
                  );
                }}
                disabled={!currentDirty || busy}
              >
                检查并发布 →
              </button>
            </div>
            {status && (
              <div className={styles.status} role="status">
                {status}
                {lastCommit && (
                  <a href={lastCommit.url} target="_blank" rel="noreferrer">
                    查看提交 {lastCommit.sha.slice(0, 7)} ↗
                  </a>
                )}
              </div>
            )}
            {error && (
              <div className={styles.error} role="alert">
                {error}
              </div>
            )}
            {view === "text" && (
              <div className={styles.textEditor}>
                <div className={styles.textList}>
                  <label htmlFor="text-search">搜索文字</label>
                  <input
                    id="text-search"
                    type="search"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="标题、段落、按钮…"
                  />
                  <div>
                    {sources
                      .filter((item) =>
                        `${item} ${CATALOG[item] ?? ""} ${content.text[item]?.en ?? ""} ${content.text[item]?.zh ?? ""}`
                          .toLowerCase()
                          .includes(search.toLowerCase()),
                      )
                      .map((item) => (
                        <button
                          key={item}
                          aria-pressed={source === item}
                          onClick={() => setSource(item)}
                          title={item}
                        >
                          {item}
                        </button>
                      ))}
                  </div>
                </div>
                <div className={styles.textFields}>
                  <span className={styles.eyebrow}>
                    BILINGUAL COPY / 双语文案
                  </span>
                  <h2>{source.length > 90 ? "故事段落" : source}</h2>
                  <p className={styles.note}>
                    修改英文与中文版本。留空可以隐藏此文字，图片说明也在这里。
                  </p>
                  <label htmlFor="text-en">English / 英文</label>
                  <textarea
                    id="text-en"
                    value={values.en}
                    onChange={(event) => changeText("en", event.target.value)}
                    rows={7}
                  />
                  <label htmlFor="text-zh">中文 / Chinese</label>
                  <textarea
                    id="text-zh"
                    value={values.zh}
                    onChange={(event) => changeText("zh", event.target.value)}
                    rows={7}
                  />
                  <button
                    className={styles.quiet}
                    onClick={() =>
                      setContent((current) => {
                        const text = { ...current.text };
                        delete text[source];
                        return { ...current, text };
                      })
                    }
                    disabled={!Object.hasOwn(content.text, source)}
                  >
                    还原此条原始文字
                  </button>
                </div>
              </div>
            )}
            {view === "images" && (
              <div className={styles.imageEditor}>
                <label htmlFor="image-select">选择要替换的图片</label>
                <select
                  id="image-select"
                  value={imagePath}
                  disabled={busy}
                  onChange={(event) => {
                    if (imageFile && !window.confirm("丢弃当前图片草稿？"))
                      return;
                    setImagePath(event.target.value);
                    setImageFile(null);
                    setError("");
                  }}
                >
                  {files
                    .filter((item) => item.path.endsWith(".png"))
                    .map((item) => (
                      <option key={item.path} value={item.path}>
                        {item.path.split("/").pop()}
                      </option>
                    ))}
                </select>
                <div className={styles.imageCompare}>
                  <figure>
                    <div>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={`/${imagePath.slice(7)}`} alt="当前线上图片" />
                    </div>
                    <figcaption>当前线上图片</figcaption>
                  </figure>
                  <figure>
                    <div>
                      {imageFile ? (
                        <>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={imagePreview} alt="待发布图片预览" />
                        </>
                      ) : (
                        <span>选择新 PNG，预览会显示在这里</span>
                      )}
                    </div>
                    <figcaption>发布前预览</figcaption>
                  </figure>
                </div>
                <label htmlFor="image-upload">上传替换图片 / PNG</label>
                <input
                  id="image-upload"
                  key={imagePath}
                  type="file"
                  accept="image/png"
                  disabled={busy}
                  onChange={(event) =>
                    void chooseImage(event.target.files?.[0])
                  }
                />
                <p className={styles.note}>
                  保持原始画布尺寸和透明背景，避免房屋轮廓再次被裁切。支持 10 MB
                  以内的 PNG。发布会替换同名素材，不改变动画层级。
                </p>
              </div>
            )}
            {view === "code" && (
              <div className={styles.codeEditor}>
                <div className={styles.codeControls}>
                  <label htmlFor="code-select">网站源文件</label>
                  <select
                    id="code-select"
                    value={codePath}
                    disabled={busy}
                    onChange={(event) => {
                      if (
                        codeDirty &&
                        !window.confirm("丢弃当前代码草稿并打开另一个文件？")
                      )
                        return;
                      void loadCode(event.target.value);
                    }}
                  >
                    {files
                      .filter(
                        (item) =>
                          !item.path.endsWith(".png") && item.size <= 800000,
                      )
                      .map((item) => (
                        <option key={item.path} value={item.path}>
                          {item.path}
                        </option>
                      ))}
                  </select>
                  <button
                    onClick={() => {
                      if (
                        codeDirty &&
                        !window.confirm(
                          "保留草稿副本后再重新加载；重新加载会丢弃编辑。继续？",
                        )
                      )
                        return;
                      void loadCode(codePath);
                    }}
                    disabled={busy}
                  >
                    重新加载最新版本
                  </button>
                </div>
                <p className={styles.note}>
                  可编辑页面、组件、样式和翻译。修改代码需要了解 React /
                  Next.js；构建失败时 Cloudflare 会保留上一版网站。
                </p>
                <textarea
                  aria-label="源代码编辑器"
                  className={styles.code}
                  value={codeDraft}
                  onChange={(event) => setCodeDraft(event.target.value)}
                  disabled={!codeFile || busy}
                  spellCheck={false}
                  autoComplete="off"
                  autoCapitalize="off"
                  rows={25}
                />
                <small className={styles.note}>
                  {codeFile
                    ? `基于版本 ${codeFile.sha.slice(0, 7)} · 防止覆盖他人刚刚提交的修改`
                    : "正在加载文件…"}
                </small>
              </div>
            )}
            {review && (
              <section className={styles.review} aria-label="发布确认">
                <span className={styles.eyebrow}>READY TO GO LIVE?</span>
                <h2>发布到 irinaxu.com</h2>
                <p>
                  将本栏草稿提交到 main 分支。Cloudflare
                  构建成功后自动上线。其他栏的草稿不会一起发布。
                </p>
                <label htmlFor="commit-message">
                  更新说明 / Commit message
                </label>
                <input
                  id="commit-message"
                  value={message}
                  maxLength={200}
                  onChange={(event) => setMessage(event.target.value)}
                />
                <div className={styles.reviewActions}>
                  <button onClick={() => setReview(false)} disabled={busy}>
                    继续编辑
                  </button>
                  <button
                    className={styles.primary}
                    disabled={busy || !message.trim() || !currentDirty}
                    onClick={() => void publish()}
                  >
                    {busy ? "正在提交…" : "确认发布 →"}
                  </button>
                </div>
              </section>
            )}
          </section>
        </div>
      )}
      <footer className={styles.footer}>
        Made for the story. Built to keep it yours.
        <span>GitHub → Cloudflare → irinaxu.com</span>
      </footer>
    </main>
  );
}
