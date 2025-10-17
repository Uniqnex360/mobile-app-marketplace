# Mobile / Desktop build helper (auto-generated)

This repo is a React web app (Material-UI). Below are step-by-step instructions and helper scripts to:

1. Create a desktop **.exe** using **Electron**
2. Wrap the web build into native mobile apps using **Capacitor** (Android / iOS)

## Quick notes after cloning
- Node.js >= 18 recommended
- For Android/iOS builds you need Android SDK / Xcode respectively.
- Capacitor wraps the **web build**. You do NOT need to rewrite components to React Native.

---

## Electron (.exe) — quick start (Windows)
1. Install dev deps:
   ```
   npm install --save-dev electron electron-builder
   ```
2. Build web assets:
   ```
   npm run build:web
   ```
3. Run locally with Electron for testing:
   ```
   npm run electron:serve
   ```
4. Build a Windows installer (requires electron-builder):
   ```
   npm run electron:build
   ```
The script added uses `electron-builder.json` which packages the `build/` folder.

---

## Capacitor (Android / iOS) — wrap the web app as native
1. Install Capacitor CLI (if not installed):
   ```
   npm i @capacitor/cli @capacitor/core --save
   ```
2. Build the web app:
   ```
   npm run build:web
   ```
3. Initialize Capacitor (only first time):
   ```
   npm run cap:add
   ```
   This will create `android/` and `ios/` folders (if SDKs are present).
4. Copy web assets into native projects:
   ```
   npm run cap:copy
   ```
5. Open Android Studio or Xcode:
   ```
   npm run cap:open:android
   npm run cap:open:ios
   ```
6. Build & run from the native IDE (Android Studio / Xcode).

### Notes about native plugins & APIs
- If your web app uses browser-only features, they will work inside the webview.
- For native features (camera, push), install Capacitor plugins and follow their docs.

---

## Making the web app responsive for mobile
- Since the UI uses MUI, ensure breakpoints and responsive layout are used.
- Test in mobile view (browser devtools) and adapt CSS where necessary.
- If parts of the UI are desktop-only, consider hiding or providing mobile-friendly alternatives.

---

## What I added to this repo (files)
- /electron/main.js
- /electron/preload.js
- electron-builder.json
- updated scripts in package.json for helpful commands

---

If you want, I can:
- Patch the codebase to improve mobile responsiveness (auto-detect MUI breakpoints and tweak layouts).
- Create an Electron-ready build and produce a downloadable .exe or installer here.
- Initialize Capacitor and produce Android APK (requires Android SDK on this environment — not available here).
Tell me which of the above you'd like me to do now; I can immediately prepare builds for Electron (.exe) and a zipped packaged web build for you to wrap with Capacitor.


### Overriding the API base URL for packaged apps

If your hosted API is at a different domain than where the web app is hosted, set the base URL:

- For Electron (during testing/run)
  ```
  ELECTRON_API_BASE_URL=https://api.yourdomain.com npm run electron:serve
  ```
  For packaged builds, set environment variables in your packaging pipeline or modify `electron-builder.json` to include extra metadata.

- For production web build (React)
  ```
  REACT_APP_API_BASE_URL=https://api.yourdomain.com npm run build:web
  ```

- For Capacitor (mobile)
  Before building, ensure `src/config.js` picks up `REACT_APP_API_BASE_URL` or inject config into the native project.


## Building the Marketlynxe Windows Executable (.exe)

To generate a standalone Windows app:

```bash
npm install
npm install --save-dev electron electron-builder
npm run build:web
npm run electron:build
```

This will produce a portable file in the `dist/` folder, e.g.:
```
dist/Marketlynxe.exe
```

You can run it directly — no installation needed.
