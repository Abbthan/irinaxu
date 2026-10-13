# Collaboration and deployment

Repository: https://github.com/Abbthan/irinaxu

Live website: https://irinaxu.com (also https://www.irinaxu.com)

## Shared source

Use this GitHub repository for shared changes. The original Desktop folder is
an archived backup; edits there are not automatically synchronized to GitHub.
The owner's separate collaboration checkout is `/Users/ethanma/Projects/irinaxu`.

The initial commit imports the current 54 source, configuration, documentation,
and asset files from the Desktop project. Build output, installed dependencies,
environment files, and local credentials are excluded. The previous local Git
history remains in the Desktop backup.

## Local development

Use a current supported Node.js release (Node.js 22 or later).

```sh
git clone https://github.com/Abbthan/irinaxu.git
cd irinaxu
npm ci
npm run dev
```

Run `git pull --ff-only` before starting work. For shared work, create a branch,
commit changes, and open a pull request. Changes reach production when pushed
or merged into `main`. Saving files or creating a local commit alone does not
publish them.

## Cloudflare automatic deployment

Existing Worker: `irina-xu-portfolio`.

Workers Builds configuration:

- GitHub repository: `Abbthan/irinaxu`
- Production branch: `main`
- Root directory: `/`
- Build command: `npm run build`
- Deploy command: `npx wrangler deploy`

The Next.js project exports static assets into `out/`, as configured by
`next.config.ts`. Wrangler uploads them using `wrangler.jsonc`. Successful
production builds update the existing Worker and its existing custom domains.
Check the Worker's Deployments and Settings > Builds pages for build results.

Avoid manually deploying the archived Desktop copy: it could overwrite newer
changes made by a collaborator. Keep API keys and account passwords out of
source files and commits. Code collaborators can use GitHub access without
sharing the owner's Cloudflare password.
