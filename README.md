# Thiên Thư Shopify App

Sample Shopify app built with the React Router template for learning Shopify app development, Admin GraphQL API, OAuth/scopes, tunnels, and theme app extensions.

## Features

### Product management in Shopify Admin

- Lists the first 10 products using the Admin GraphQL API.
- Updates a product title with the `productUpdate` mutation.
- Deletes a product with the `productDelete` mutation.
- Displays Shopify GraphQL `userErrors` when an operation fails.

The app UI is embedded inside Shopify Admin and is implemented in `app/routes/app._index.tsx` and `app/components/products`.

### Storefront banner

The `extensions/thi-n-th` theme app extension provides an app embed banner for the storefront. Merchants can configure it from the theme editor:

- Message and optional link.
- Background color, text color, and font size.
- Position in one of the four screen corners.
- Optional close button.

The Liquid block renders the banner, CSS controls its appearance and position, and JavaScript handles dismissing it.

## Requirements

- Node.js 22.12 or newer.
- Shopify CLI.
- A Shopify Partner/Dev account.
- A development store containing sample products.

## Run locally

Install dependencies and prepare the Prisma session database:

```bash
npm install
npm run setup
```

Start the app:

```bash
shopify app dev
```

When prompted, select a development store. Shopify CLI will connect the project to the app, create an HTTPS tunnel, update the development URLs, and provide a link for installing or opening the app.

After installation:

1. Open the app from Shopify Admin to list and edit products.
2. Go to **Online Store → Themes → Customize → App embeds**.
3. Enable **Thiên Thư banner**, configure it, and save the theme.
4. Open the storefront to view and dismiss the banner.

## App configuration

The Shopify app configuration is stored in `shopify.app.toml`.

- `client_id` identifies the app on Shopify.
- `application_url` is the app's entry URL.
- `redirect_urls` contains allowed authentication callback URLs.
- `embedded = true` opens the admin UI inside Shopify Admin.
- `access_scopes` declares the Shopify API permissions requested by the app.

During local development, `automatically_update_urls_on_dev = true` allows Shopify CLI to replace the example URLs with the current tunnel URL.

The app currently requests these scopes:

```text
write_products,write_metaobjects,write_metaobject_definitions
```

`write_products` includes the product access needed by the list, update, and delete features.

## Useful commands

```bash
npm run dev          # Run shopify app dev
npm run format       # Format app source with Biome
npm run format:check # Check app source formatting
npm run lint         # Run ESLint
npm run typecheck    # Generate route types and run TypeScript checks
npm run build        # Build the React Router app
npm run deploy       # Create and deploy a Shopify app version/config/extensions
```

`shopify app deploy` deploys Shopify app configuration and extensions. It does not host the React Router backend; a production backend still needs a stable HTTPS hosting URL and persistent database.

## Demo checklist

- Install the app on a development store.
- Open the embedded app and confirm products are listed.
- Change a product title and confirm it in Shopify Admin.
- Enable the theme app embed in the theme editor.
- Confirm the configured banner is visible on the storefront and its close button works.

## Project structure

```text
app/
  components/products/   Product list, actions, and dialogs
  routes/app._index.tsx  Product loader and GraphQL actions
extensions/thi-n-th/
  blocks/app-embed.liquid
  assets/banner.css
  assets/banner.js
prisma/                  Session storage schema and migrations
shopify.app.toml         Shopify app configuration
```

Do not commit `.env` or other files containing secrets and access tokens.
