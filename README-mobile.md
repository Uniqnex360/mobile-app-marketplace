Marketlynxe Android Studio Project (Ready)
=========================================

This project includes a full Android Studio project inside the `android/` folder.
Open the `android/` folder in Android Studio to build and run.

Recommended steps (locally):
1. Install Node.js and Android Studio (with SDK).
2. In project root:
   npm install
   REACT_APP_API_BASE_URL=https://marketplace-frontend-development.vercel.app npm run build:web
   npx cap copy android
3. Open Android Studio -> Open an existing project -> select `android/`.
4. Let Gradle sync, then Run or Build APK.

Notes:
- This project includes placeholder Gradle wrapper files; Android Studio will generate proper wrappers if missing.
- The app shows a splash screen (gradient + "M" icon) before loading the web app.

---
### Updated Configuration (Oct 2025)
- Backend API: https://prod-marketplace.duckdns.org/omnisight/
- The app (Electron and Android) will automatically use this backend.
- No need to set REACT_APP_API_BASE_URL manually anymore.
