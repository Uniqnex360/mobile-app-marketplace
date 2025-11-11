#!/bin/bash
set -e

echo "Running post-install script..."
echo "Syncing Capacitor..."
npx cap sync android

echo "Listing capacitor-cordova-android-plugins..."
ls -la android/capacitor-cordova-android-plugins/ || echo "Directory not found"

echo "Content of cordova.variables.gradle:"
cat android/capacitor-cordova-android-plugins/cordova.variables.gradle || echo "File not found"
