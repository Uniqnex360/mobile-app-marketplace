#!/usr/bin/env bash

set -euo pipefail

echo "🔧 EAS post-install hook running..."
echo "Current directory: $(pwd)"

echo "📦 Installing dependencies if needed..."
npm install

echo "🔄 Syncing Capacitor..."
npx cap sync android

echo "✅ Checking if capacitor-cordova-android-plugins was created..."
if [ -f "android/capacitor-cordova-android-plugins/cordova.variables.gradle" ]; then
    echo "✅ cordova.variables.gradle exists!"
    cat android/capacitor-cordova-android-plugins/cordova.variables.gradle
else
    echo "❌ cordova.variables.gradle NOT found!"
    ls -la android/ || true
fi
