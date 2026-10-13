# Website studio / 网站后台

Open https://irinaxu.com/admin/ to edit English/Chinese text, replace existing PNG artwork, or edit website source files.

## Access

The editor uses GitHub repository authorization directly. It is not a shared-password CMS and there is no public write API. The login page is public; private files and every publish operation are protected by GitHub. A GitHub account with write access to `Abbthan/irinaxu` and a valid access token are required.

The owner can create a fine-grained token limited to `irinaxu` with **Contents: Read and write** (Metadata read is automatic). Give it an expiration date. Collaborators must accept a repository invitation first. GitHub may restrict fine-grained tokens for outside collaborators; if the repository is unavailable in their selector, use an owner-issued repository-only token or a classic token with `repo` scope. Prefer repository-only tokens whenever available. Never share the owner's GitHub or Cloudflare password.

Paste the access token on the admin page. It is sent only to `https://api.github.com` using HTTPS. It stays in page memory, never localStorage, cookies, source code, or Cloudflare. Refreshing, logging out, or closing the tab requires reconnecting. On a shared computer, sign out and close the tab. Revoke a collaborator's dedicated token when access should end.

## Publishing

1. Edit a section; changes remain unsaved in this tab.
2. Select **检查并发布**, describe the change, then **确认发布**.
3. GitHub receives one commit to `main`. Cloudflare Workers Builds automatically builds and deploys it to the existing domain.
4. Wait for the Cloudflare GitHub commit check to succeed, then refresh the public website. A commit is not proof that deployment succeeded; build failures leave the previous site live.

Text edits are stored in `src/content/site-content.json`. Original English strings remain stable lookup keys, so editing a translated value does not break future edits. Images replace their existing paths, require PNG format and the original canvas dimensions, and have a 10 MB upload limit. Source edits support existing `src` TypeScript, TSX, CSS, JSON and selected documentation files. The studio deliberately cannot edit hidden files, credentials, or deployment workflows.

Each publish includes the file SHA that was loaded. If someone changed that file meanwhile, GitHub rejects the stale update instead of overwriting their work. Copy your draft before reloading the latest file and reconcile both edits.

The Desktop project remains an untouched backup. Use `/Users/ethanma/Projects/irinaxu` or a fresh GitHub clone for further development. Access keys do not belong in either source tree.
