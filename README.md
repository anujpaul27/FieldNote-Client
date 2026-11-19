# Fieldnote

Fieldnote is a responsive, interactive frontend for the note-taking application in the project brief. The original design pairs a forest-green workspace, editorial typography, and a botanical illustration with a compact notes library.

## Run locally

Use Node.js 20.9 or newer.

```bash
npm ci
npm run dev
```

Open `http://localhost:3000`. To check a production build, run `npm run typecheck`, then `npm run build` and `npm start`.

## Explore the prototype

The workspace opens as **Maya Chen**, the demo administrator. Open her account menu at the bottom of the sidebar and choose **Try the member view** to explore as **Samira Rahman**. On mobile, open the sidebar from the top-left menu. The two demo accounts can’t be removed or assigned different roles.

| Screen | What you can try |
| --- | --- |
| **My notes** (`/`) | Create, edit, pin, and delete your own notes. Filter by category, sort, switch between grid and list, and paginate. |
| **Public posts** (`/posts`) | Publish from a demo account, browse by author, or read the feed while signed out. |
| **People** (`/people`) | As an administrator, add users, edit profiles and roles, remove users, and view an author’s public posts. |
| **All user notes** (`/all-notes`) | As an administrator, filter notes by owner or category and open them in a read-only view. |
| **Interest groups** (`/interests`) | As an administrator, browse groups generated from the interests in user profiles. |
| **My profile / Sign in** (`/profile`, `/sign-in`) | Edit your name, email, and interests; switch between roles; or sign out. |
| **Login & registration** (`/login`, `/register`) | Log in with an email and password — seeded demo accounts share the password `fieldnote` — or register a new member account, which is stored in this browser like everything else. |

**Quick search:** Use the search button or press **Ctrl+K** / **⌘K**. Use **↑/↓** to navigate, **Enter** to open a result, and **Esc** to close. Motion respects the device’s reduced-motion preference.

## Implementation

- **Next.js App Router** and TypeScript for the application and its routes.
- **Tailwind CSS / daisyUI** for themed buttons, badges, inputs, menus, and tables.
- **Framer Motion** for the note cards, detail sheets, dialogs, and feedback.
- Self-hosted DM Sans and Newsreader fonts and a local WebP illustration.

## Demo boundaries

All content is fictional. Edits and demo session preferences are stored in this browser using `localStorage`; clearing site data resets the demo. The prototype does **not** implement JWT authentication, password hashing, server-side authorization, a REST API, or MongoDB/Mongoose. Do not enter sensitive information. In a production implementation, note ownership and admin access must be checked by the backend, and the list and interest/post views must consume the paginated REST and aggregation endpoints described in the brief.
