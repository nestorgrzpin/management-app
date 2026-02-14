## Error Type
Build Error

## Error Message
Module not found: Can't resolve '@azure/msal-browser'

## Build Output
./lib/microsoft-auth.ts:1:1
Module not found: Can't resolve '@azure/msal-browser'
> 1 | import { PublicClientApplication } from '@azure/msal-browser'
    | ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  2 |
  3 | const getSiteUrl = () => {
  4 |   if (typeof window !== 'undefined') {

Import traces:
  Client Component Browser:
    ./lib/microsoft-auth.ts [Client Component Browser]
    ./components/microsoft-provider.tsx [Client Component Browser]
    ./components/microsoft-provider.tsx [Server Component]
    ./app/layout.tsx [Server Component]

  Client Component SSR:
    ./lib/microsoft-auth.ts [Client Component SSR]
    ./components/microsoft-provider.tsx [Client Component SSR]
    ./components/microsoft-provider.tsx [Server Component]
    ./app/layout.tsx [Server Component]

https://nextjs.org/docs/messages/module-not-found

Next.js version: 16.0.10 (Turbopack)
