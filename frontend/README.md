# sv

Everything you need to build a Svelte project, powered by [`sv`](https://github.com/sveltejs/cli).

## Creating a project

If you're seeing this, you've probably already done this step. Congrats!

```sh
# create a new project
npx sv create my-app
```

To recreate this project with the same configuration:

```sh
# recreate this project
npx sv create --template minimal --types ts --no-install frontend
```

## Developing

Once you've created a project and installed dependencies with `npm install` (or `pnpm install` or `yarn`), start a development server:

```sh
npm run dev

# or start the server and open the app in a new browser tab
npm run dev -- --open
```

## Building

To create a production version of your app:

```sh
npm run build
```

You can preview the production build with `npm run preview`.

> To deploy your app, you may need to install an [adapter](https://svelte.dev/docs/kit/adapters) for your target environment.

## iOS

The iOS app uses Capacitor to load the deployed GitHub Pages app. It checks the
network for the page on launch and needs an internet connection to start. Web
updates are available without rebuilding the iOS app; changes to native code or
Capacitor configuration still require a rebuild and reinstall. The first launch
after switching from the bundled app may require signing in again because the
website uses a different storage origin. Subsequent sessions remain stored.

Capacitor documents `server.url` as intended for live reload, not production;
this remote-hosted setup is therefore not a supported production deployment
mechanism. Only content from the configured site should be trusted with the
native bridge.

Install Xcode and the iOS platform, configure 1Password CLI access for
`frontend/.env`, and run:

```sh
npm install
npm run ios:sync
npm run ios:open
```

In Xcode, select your development team under Signing & Capabilities and run
the `App` scheme on your iPhone. Run `npm run ios:sync` before rebuilding in
Xcode. Generated web assets in `ios/App/App/public` are local build output and
must not be committed.
