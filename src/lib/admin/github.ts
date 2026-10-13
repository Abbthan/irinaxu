const REPOSITORY = "/repos/Abbthan/irinaxu";
export const CONTENT_PATH = "src/content/site-content.json";
export type RepositoryFile = { path: string; sha: string; size: number };
export type TextFile = { sha: string; text: string };
export type PublishResult = { sha: string; url: string };

function record(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === "object" && !Array.isArray(value);
}

export function editablePath(path: string) {
  return (
    !path.split("/").some((segment) => !segment || segment.startsWith(".")) &&
    (/^src\/.*\.(tsx?|css|json)$/.test(path) ||
      /^public\/images\/[\w-]+\.png$/.test(path) ||
      /^(README|COLLABORATION|ADMIN)\.md$/.test(path))
  );
}

export function toBase64(text: string) {
  const bytes = new TextEncoder().encode(text);
  let binary = "";
  for (let start = 0; start < bytes.length; start += 8192)
    binary += String.fromCharCode(...bytes.subarray(start, start + 8192));
  return btoa(binary);
}

export function fromBase64(encoded: string) {
  return new TextDecoder().decode(
    Uint8Array.from(atob(encoded.replace(/\s/g, "")), (char) =>
      char.charCodeAt(0),
    ),
  );
}

// The credential exists only in this instance's memory. Nothing is written
// to localStorage, cookies, URLs, logs, the repository, or Cloudflare.
export class GitHubEditor {
  #token: string;
  #fetch: typeof fetch;
  constructor(token: string, fetcher: typeof fetch = fetch) {
    this.#token = token.trim();
    // Native browser fetch requires its global receiver, not this editor.
    this.#fetch = fetcher.bind(globalThis);
  }
  clear() {
    this.#token = "";
  }

  private async request(
    endpoint: string,
    method = "GET",
    body?: object,
  ): Promise<unknown> {
    if (!this.#token) throw new Error("Please connect your GitHub access key.");
    const response = await this.#fetch(`https://api.github.com${endpoint}`, {
      method,
      credentials: "omit",
      redirect: "error",
      cache: "no-store",
      signal: AbortSignal.timeout(20000),
      headers: {
        Accept: "application/vnd.github.object+json",
        Authorization: `Bearer ${this.#token}`,
        "X-GitHub-Api-Version": "2026-03-10",
        ...(body ? { "Content-Type": "application/json" } : {}),
      },
      ...(body ? { body: JSON.stringify(body) } : {}),
    });
    if (!response.ok) {
      if (response.status === 409 || response.status === 422)
        throw new Error(
          "This file changed or the branch is protected. Keep your draft, reload the latest file, and try again.",
        );
      if (response.status === 401)
        throw new Error(
          "The GitHub key is invalid or expired. Connect again with a valid key.",
        );
      if (response.status === 403 || response.status === 404)
        throw new Error(
          "Access denied. The key needs access to Abbthan/irinaxu and Contents: Read and write. Your GitHub account must also have repository write access.",
        );
      throw new Error(
        `GitHub returned ${response.status}. No update was published.`,
      );
    }
    return response.json();
  }

  async connect() {
    const [repo, user] = await Promise.all([
      this.request(REPOSITORY),
      this.request("/user"),
    ]);
    if (
      !record(repo) ||
      repo.full_name !== "Abbthan/irinaxu" ||
      !record(repo.permissions) ||
      repo.permissions.push !== true ||
      !record(user) ||
      typeof user.login !== "string"
    )
      throw new Error(
        "Your GitHub account does not have write access to this repository.",
      );
    return user.login;
  }

  async listFiles(): Promise<RepositoryFile[]> {
    const result = await this.request(
      `${REPOSITORY}/git/trees/main?recursive=1`,
    );
    if (!record(result) || !Array.isArray(result.tree) || result.truncated)
      throw new Error("Could not load the complete file list.");
    return result.tree.flatMap((item) =>
      record(item) &&
      item.type === "blob" &&
      typeof item.path === "string" &&
      typeof item.sha === "string" &&
      typeof item.size === "number" &&
      editablePath(item.path)
        ? [{ path: item.path, sha: item.sha, size: item.size }]
        : [],
    );
  }

  async loadText(path: string): Promise<TextFile> {
    if (!editablePath(path) || path.endsWith(".png"))
      throw new Error("This file is not editable as text.");
    const result = await this.request(
      `${REPOSITORY}/contents/${path.split("/").map(encodeURIComponent).join("/")}?ref=main`,
    );
    if (
      !record(result) ||
      result.type !== "file" ||
      result.encoding !== "base64" ||
      typeof result.content !== "string" ||
      typeof result.sha !== "string" ||
      typeof result.size !== "number" ||
      result.size > 800000
    )
      throw new Error("This file is too large or is not a text file.");
    return { sha: result.sha, text: fromBase64(result.content) };
  }

  async publish(
    path: string,
    base64: string,
    sha: string,
    message: string,
  ): Promise<PublishResult> {
    if (
      !editablePath(path) ||
      !sha ||
      !message.trim() ||
      base64.length > 14000000
    )
      throw new Error("Invalid file, commit message, or upload size.");
    const result = await this.request(
      `${REPOSITORY}/contents/${path.split("/").map(encodeURIComponent).join("/")}`,
      "PUT",
      { content: base64, sha, branch: "main", message: message.trim() },
    );
    if (
      !record(result) ||
      !record(result.commit) ||
      typeof result.commit.sha !== "string" ||
      typeof result.commit.html_url !== "string" ||
      !result.commit.html_url.startsWith(
        "https://github.com/Abbthan/irinaxu/commit/",
      )
    )
      throw new Error(
        "GitHub did not confirm the commit. Check the repository before publishing again.",
      );
    return { sha: result.commit.sha, url: result.commit.html_url };
  }
}
