# plainnotes

A weekend-sized notes API. Every entry is a plain `.md` file inside
`vault/`, so the "database" is a folder you can read, grep, and sync
with anything.

## Run

```bash
npm install
npm start        # listens on :3000, override with PORT
```

## Endpoints

| method | path | notes |
| --- | --- | --- |
| POST | `/entries` | `{title, body}` → creates `vault/<slug>.md`, 409 if taken |
| GET | `/entries` | list, newest first, with `modified` time |
| GET | `/entries/:slug` | raw markdown |
| PUT | `/entries/:slug` | `{body, title?}` → rewrite in place |
| DELETE | `/entries/:slug` | remove the file |

Slugs are derived from the title; titles with no latin characters
fall back to a timestamp slug instead of colliding.

## Why files and not sqlite

I wanted the notes usable from the editor too. Markdown files under
a folder give me git diffs, grep, and no schema migrations, at the
cost of no querying — fine for the size I keep this at.

## License

MIT
