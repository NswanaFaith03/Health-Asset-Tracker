# 🚀 DigiHealth APK Build - Quick Reference

## Build APK in 3 Steps

### Step 1: Install EAS CLI (One-time)
```bash
npm install -g eas-cli
```

### Step 2: Navigate & Login
```bash
cd /home/dalitso/Desktop/projects/Health-Asset-Tracker/artifacts/digihealth
eas login
# Enter your Expo credentials (create free account at https://expo.dev if needed)
```

### Step 3: Build
```bash
eas build --platform android --profile preview
```

**Done!** ✅ Your APK will be ready in 10-15 minutes. Download link will appear in terminal.

---

## Installation on Android

### On Device
1. Transfer APK to Android device (email, Bluetooth, cloud storage)
2. Open file manager
3. Find `digihealth.apk`
4. Tap to install
5. Grant permissions
6. Open app

### On Emulator
```bash
adb install digihealth.apk
```

---

## What You'll Get

✅ `digihealth.apk` - ~60-80MB file
✅ Works on Android 5.0+
✅ Can install on unlimited devices
✅ Full professional UI with icons & images
✅ Ready to share & distribute

---

## Build Options

| Option | Command | Time | Best For |
|--------|---------|------|----------|
| **Preview (Fast)** | `eas build --platform android --profile preview` | 10-15 min | Testing |
| **Production** | `eas build --platform android --profile production` | 15-20 min | Play Store |
| **Local** | `eas build --platform android --local` | Variable | Advanced |

---

## Links

- Expo: https://expo.dev
- EAS Build: https://docs.expo.dev/build/introduction/
- Android: https://developer.android.com/

---

**Status:** ✅ Ready to Build
**Configuration:** eas.json ✅ Created
**Requirements:** Free Expo account (5 min setup)

Build your APK now! 📦
