# Tech Stack
LifePlants uses React 19, TypeScript, Vite 7, React Router v7, Firebase, Radix UI, Lucide React, Sonner, Zod, React Hook Form, and Recharts.
## Working rules
- Treat `app/` as the source of truth for UI and routing.
- Prefer existing components and shared utilities before creating new ones.
- Keep route changes in `app/routes.ts` aligned with the file tree.
- Use Firebase client APIs from `app/lib/firebase.ts`.
- Keep the docs consistent with `npm run dev`, `npm run build`, `npm run start`, and `firebase deploy`.
## Style rules
- Reuse existing CSS tokens and theme variables.
- Keep files small and focused.
- Prefer typed props and explicit data shapes.
## Safety
- Do not invent scripts or dependencies that are not present in `package.json`.
- Treat historical HTML assets as legacy unless the task explicitly asks for them.
# Tech Stack

React 19, TypeScript, npm, Node.js, CSS Modules, **React Router v7 only** (do not use any other versions), OpenProps, React Hook Form, Radix-UI, lucide-react, Recharts.

## CSS Modules

- Any time you add or modify a CSS-Module or global style file, you **must** import it in the associated component (or in your root entry) so it actually takes effect.

## Lucide React Icons

- Before importing an icon, verify it's a named export of `lucide-react`. If it isn't, fallback to the 'square' icon.

## React Router

Use React-Router v7 in a "framework" mode.

## Forbidden & Read-Only Files

1. READ-ONLY (Context Only)
   The content of certain files may be provided for informational purposes. You must not edit them directly.
   Example of such file might be `package.json`. If this file is provided you can see which packages and scripts are available. To add a dependency, you must use the appropriate tool.

2. STRICTLY FORBIDDEN (NO ACCESS)
   You must never read or modify the following files and directories under any circumstances:
   - `.gitignore`
   - `package-lock.json`
   - `tsconfig.json`
   - `react-router.config.ts`
   - `.github/`

# Forbidden Technologies

Avoid using the following in your responses:

## Tailwind CSS

- Do not use Tailwind CSS for styling.
- Do not mention Tailwind CSS in any context.
- Do not use utility classes from Tailwind CSS.
