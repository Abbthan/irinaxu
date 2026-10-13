import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { test } from "node:test";
import assert from "node:assert/strict";
import ts from "typescript";

async function load(path) {
  const source = readFileSync(resolve(path), "utf8");
  const output = ts.transpileModule(source, {
    compilerOptions: {
      target: ts.ScriptTarget.ES2022,
      module: ts.ModuleKind.ES2022,
    },
  }).outputText;
  return import(
    `data:text/javascript;base64,${Buffer.from(output).toString("base64")}`
  );
}
const { GitHubEditor, toBase64, fromBase64, editablePath } = await load(
  "src/lib/admin/github.ts",
);
const { parseSiteContent, renderWebsiteText } = await load(
  "src/lib/site-content.ts",
);

test("English and Chinese round-trip without corrupting Unicode", () => {
  const text = "追光 — Irina 🌙\nA story in five parts.";
  assert.equal(fromBase64(toBase64(text)), text);
});
test("editor excludes secrets, hidden files, workflows and traversal", () => {
  for (const path of [
    ".env",
    ".github/workflows/deploy.yml",
    "src/../.env",
    "src/.secret.ts",
    "src//app.ts",
    "https://evil.test/key",
    "package-lock.json",
  ])
    assert.equal(editablePath(path), false, path);
  for (const path of [
    "src/app/page.tsx",
    "src/content/site-content.json",
    "src/app/globals.css",
    "public/images/village-lamp.png",
    "ADMIN.md",
  ])
    assert.equal(editablePath(path), true, path);
});
test("original content stays unchanged until an override is published", () => {
  const config = parseSiteContent({ version: 1, text: {} });
  assert.equal(
    renderWebsiteText("  What is light?\n", "en", config, {
      "What is light?": "什么是光？",
    }),
    "  What is light?\n",
  );
  assert.equal(
    renderWebsiteText("  What is light?\n", "zh", config, {
      "What is light?": "什么是光？",
    }),
    "  什么是光？\n",
  );
  assert.equal(renderWebsiteText("   ", "zh", config, {}), "   ");
  assert.equal(
    renderWebsiteText("constructor", "zh", config, {}),
    "constructor",
  );
});
test("published overrides support both languages and intentional blank text", () => {
  const config = parseSiteContent({
    version: 1,
    text: {
      "What is light?": { en: "Light connects us", zh: "光连接我们" },
      hide: { en: "", zh: "" },
    },
  });
  assert.equal(
    renderWebsiteText("What is light?", "en", config, {}),
    "Light connects us",
  );
  assert.equal(
    renderWebsiteText("What is light?", "zh", config, {}),
    "光连接我们",
  );
  assert.equal(renderWebsiteText("hide", "en", config, {}), "");
});
test("invalid content is rejected", () => {
  for (const config of [
    null,
    { version: 2, text: {} },
    { version: 1, text: [] },
    { version: 1, text: { x: { en: 123, zh: "ok" } } },
  ])
    assert.throws(() => parseSiteContent(config));
});
test("GitHub authenticates the repository and never sends keys to another host", async () => {
  const calls = [];
  const client = new GitHubEditor("test-key", async function (url, options) {
    assert.equal(this, globalThis, "browser fetch must retain its global receiver");
    calls.push({ url, options });
    return Response.json(
      url.endsWith("/user")
        ? { login: "editor" }
        : { full_name: "Abbthan/irinaxu", permissions: { push: true } },
    );
  });
  assert.equal(await client.connect(), "editor");
  assert.equal(calls.length, 2);
  for (const { url, options } of calls) {
    assert.equal(new URL(url).origin, "https://api.github.com");
    assert.equal(options.headers.Authorization, "Bearer test-key");
    assert.equal(options.credentials, "omit");
    assert.equal(options.redirect, "error");
    assert.equal(options.cache, "no-store");
  }
  client.clear();
  await assert.rejects(client.connect(), /connect your GitHub/);
});
test("read-only GitHub users are rejected", async () => {
  const client = new GitHubEditor("test-key", async (url) =>
    Response.json(
      url.endsWith("/user")
        ? { login: "viewer" }
        : { full_name: "Abbthan/irinaxu", permissions: { push: false } },
    ),
  );
  await assert.rejects(client.connect(), /does not have write access/);
});
test("publish creates a main-branch commit with the loaded SHA", async () => {
  const client = new GitHubEditor("test-key", async (url, options) => {
    assert.equal(
      url,
      "https://api.github.com/repos/Abbthan/irinaxu/contents/src/app/page.tsx",
    );
    assert.equal(options.method, "PUT");
    assert.deepEqual(JSON.parse(options.body), {
      content: toBase64("draft"),
      sha: "original-sha",
      branch: "main",
      message: "Update story",
    });
    return Response.json({
      commit: {
        sha: "new-commit",
        html_url: "https://github.com/Abbthan/irinaxu/commit/new-commit",
      },
    });
  });
  assert.equal(
    (
      await client.publish(
        "src/app/page.tsx",
        toBase64("draft"),
        "original-sha",
        "Update story",
      )
    ).sha,
    "new-commit",
  );
});
test("stale edits and invalid credentials are rejected, not silently published", async () => {
  for (const status of [401, 403, 404, 409, 422, 500]) {
    const client = new GitHubEditor(
      "test-key",
      async () => new Response("", { status }),
    );
    await assert.rejects(
      client.publish(
        "src/app/page.tsx",
        toBase64("draft"),
        "stale-sha",
        "Update story",
      ),
    );
  }
});
test("malformed tree and oversized text are rejected", async () => {
  const truncated = new GitHubEditor("test-key", async () =>
    Response.json({ tree: [], truncated: true }),
  );
  await assert.rejects(truncated.listFiles(), /complete file list/);
  const large = new GitHubEditor("test-key", async () =>
    Response.json({
      type: "file",
      size: 900000,
      content: "",
      sha: "test",
      encoding: "base64",
    }),
  );
  await assert.rejects(large.loadText("src/app/page.tsx"), /too large/);
});
