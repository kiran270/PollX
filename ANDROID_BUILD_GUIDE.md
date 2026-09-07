# PollX Android APK Build Guide

## Prerequisites
- Node.js installed
- Android Studio installed
- Java JDK 11 or higher

## Method 1: Using Capacitor (Recommended for Next.js)

### Step 1: Install Capacitor
```bash
cd poll-app
npm install @capacitor/core @capacitor/cli
npm install @capacitor/android
```

### Step 2: Initialize Capacitor
```bash
npx cap init
# App name: PollX
# App ID: com.pollx.app (or your domain)
```

### Step 3: Configure Next.js for Static Export
Edit `next.config.js`:
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
}

module.exports = nextConfig
```

### Step 4: Build Your App
```bash
npm run build
```

### Step 5: Add Android Platform
```bash
npx cap add android
```

### Step 6: Copy Web Assets
```bash
npx cap copy android
```

### Step 7: Configure capacitor.config.json
```json
{
  "appId": "com.pollx.app",
  "appName": "PollX",
  "webDir": "out",
  "server": {
    "androidScheme": "https"
  }
}
```

### Step 8: Open in Android Studio
```bash
npx cap open android
```

### Step 9: Build APK in Android Studio
1. In Android Studio: Build → Build Bundle(s) / APK(s) → Build APK(s)
2. Wait for build to complete
3. APK will be in: `android/app/build/outputs/apk/debug/app-debug.apk`

---

## Method 2: Using PWA Builder (Easiest - No Coding)

### Step 1: Deploy Your Site
Deploy your PollX site to a public URL (Vercel, Netlify, etc.)

### Step 2: Visit PWA Builder
Go to: https://www.pwabuilder.com/

### Step 3: Enter Your URL
Enter your deployed site URL and click "Start"

### Step 4: Generate APK
1. Click "Package for Stores"
2. Select "Android"
3. Click "Generate"
4. Download your APK

---

## Method 3: Using Cordova

### Step 1: Install Cordova
```bash
npm install -g cordova
```

### Step 2: Create Cordova Project
```bash
cordova create pollx-mobile com.pollx.app PollX
cd pollx-mobile
```

### Step 3: Add Android Platform
```bash
cordova platform add android
```

### Step 4: Copy Your Built App
```bash
# Build your Next.js app first
cd ../poll-app
npm run build

# Copy to Cordova www folder
cp -r out/* ../pollx-mobile/www/
```

### Step 5: Build APK
```bash
cd ../pollx-mobile
cordova build android
```

APK location: `platforms/android/app/build/outputs/apk/debug/app-debug.apk`

---

## Method 4: Using React Native (Most Complex)

If you want a true native app, you'd need to rebuild using React Native or Expo.

---

## Quick Start Script

Create a file `build-android.sh`:

```bash
#!/bin/bash

echo "Building PollX Android APK..."

# Install dependencies
npm install @capacitor/core @capacitor/cli @capacitor/android

# Initialize Capacitor
npx cap init PollX com.pollx.app --web-dir=out

# Build Next.js app
npm run build

# Add Android platform
npx cap add android

# Copy assets
npx cap copy android

# Open in Android Studio
npx cap open android

echo "Done! Build APK in Android Studio: Build → Build APK"
```

Run with:
```bash
chmod +x build-android.sh
./build-android.sh
```

---

## Important Notes

### For Production APK:
1. Generate a signing key:
```bash
keytool -genkey -v -keystore pollx-release-key.keystore -alias pollx -keyalg RSA -keysize 2048 -validity 10000
```

2. Configure signing in Android Studio or `build.gradle`

3. Build release APK:
```bash
npx cap copy android
cd android
./gradlew assembleRelease
```

### App Permissions
Add to `android/app/src/main/AndroidManifest.xml`:
```xml
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
```

### App Icon
Replace icons in:
- `android/app/src/main/res/mipmap-*/ic_launcher.png`

### Splash Screen
Configure in `capacitor.config.json`:
```json
{
  "plugins": {
    "SplashScreen": {
      "launchShowDuration": 2000,
      "backgroundColor": "#E31E24",
      "showSpinner": false
    }
  }
}
```

---

## Recommended Approach

**For fastest results:** Use PWA Builder (Method 2)
**For best control:** Use Capacitor (Method 1)

---

## Testing Your APK

1. Enable "Install from Unknown Sources" on your Android device
2. Transfer APK to your phone
3. Install and test
4. Or use Android Studio emulator

---

## Publishing to Google Play Store

1. Create a Google Play Developer account ($25 one-time fee)
2. Build a signed release APK
3. Create app listing with screenshots, description
4. Upload APK
5. Submit for review

---

## Troubleshooting

### "Next.js dynamic features not working"
- Use static export (`output: 'export'`)
- Avoid server-side features (API routes need separate backend)

### "Authentication not working"
- Configure OAuth redirect URLs for mobile
- Use Capacitor plugins for native auth

### "Images not loading"
- Set `images.unoptimized: true` in next.config.js
- Use absolute URLs for images

---

## Need Help?

Check these resources:
- Capacitor Docs: https://capacitorjs.com/docs
- PWA Builder: https://www.pwabuilder.com/
- Cordova Docs: https://cordova.apache.org/docs/en/latest/

