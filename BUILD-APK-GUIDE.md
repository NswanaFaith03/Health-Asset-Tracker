# 📦 Building DigiHealth as an Android APK

## Overview
This guide explains how to build your DigiHealth mobile app as an Android APK file that can be installed on Android devices.

## Build Methods

### Method 1: EAS Build (Recommended - Cloud-based)
EAS Build is the easiest way to create APK files without needing Android Studio or the Android SDK.

#### Prerequisites
- Expo account (free) at https://expo.dev
- EAS CLI installed

#### Step 1: Install EAS CLI
```bash
npm install -g eas-cli
```

#### Step 2: Login to your Expo account
```bash
eas login
```

#### Step 3: Build the APK
```bash
cd /home/dalitso/Desktop/projects/Health-Asset-Tracker/artifacts/digihealth
eas build --platform android --local
```

Or for a quick preview build:
```bash
eas build --platform android --profile preview
```

**Build will start and show progress in terminal**

#### Step 4: Download your APK
Once build is complete, download the APK from the provided link

#### Expected Time
- Preview build: 10-15 minutes
- Production build: 15-20 minutes

---

### Method 2: Local Build (Requires Android Tools)

#### Prerequisites
- Android SDK installed
- JDK 11 or higher
- 5GB free disk space

#### Step 1: Install Android tools
```bash
# On macOS
brew install android-sdk

# On Linux
sudo apt-get install android-sdk

# On Windows
Download from https://developer.android.com/studio
```

#### Step 2: Set Android SDK path
```bash
# On macOS/Linux
export ANDROID_SDK_ROOT=$HOME/Library/Android/sdk

# Or add to ~/.bashrc or ~/.zshrc
export ANDROID_SDK_ROOT=/path/to/android/sdk
```

#### Step 3: Build locally
```bash
cd /home/dalitso/Desktop/projects/Health-Asset-Tracker/artifacts/digihealth
eas build --platform android --local
```

#### Step 4: Find your APK
The APK will be saved in your project directory

---

## Quick Build Steps

### Fastest Method (EAS Cloud)
```bash
# 1. Install EAS CLI (one time)
npm install -g eas-cli

# 2. Navigate to project
cd /home/dalitso/Desktop/projects/Health-Asset-Tracker/artifacts/digihealth

# 3. Login to Expo (one time)
eas login

# 4. Start build
eas build --platform android --profile preview

# 5. Download APK from link shown in terminal
```

That's it! The APK will be ready to install on any Android device.

---

## APK Installation

### On Physical Android Device
1. Download the APK file to your device
2. Open file manager and navigate to Downloads
3. Tap the APK file
4. Follow installation prompts
5. Grant permissions if asked
6. Open DigiHealth app

### On Android Emulator
```bash
# Connect to emulator first
adb devices

# Install APK
adb install /path/to/digihealth.apk

# Or directly
eas build --platform android --local
# Then follow installation prompts
```

### Using adb (Advanced)
```bash
# If you have Android SDK tools
adb install -r digihealth.apk
```

---

## Build Profiles

### Preview Build
- Faster build time
- Suitable for testing
- Can be installed on any device
- Great for development

```bash
eas build --platform android --profile preview
```

### Production Build
- Optimized for performance
- Signed with production credentials
- Ready for Google Play Store
- Larger build time

```bash
eas build --platform android --profile production
```

---

## Configuration (eas.json)

The `eas.json` file in your project controls build settings:

```json
{
  "build": {
    "preview": {
      "android": {
        "buildType": "apk"  // Creates APK (not AAB)
      }
    },
    "production": {
      "android": {
        "buildType": "apk"  // Creates APK for production
      }
    }
  }
}
```

---

## Troubleshooting

### Build Failed Error
```
Solution: Make sure you're logged into Expo
eas login
```

### APK Installation Fails
```
Solutions:
1. Enable "Unknown Sources" on Android device
2. Ensure Android version is compatible
3. Try a preview build instead of production
```

### Takes Too Long
```
Solution: Use preview profile for faster builds
eas build --platform android --profile preview
```

### Storage Issues
```
Solution: Clear old builds
eas build:list  # View all builds
eas build:cancel <BUILD_ID>  # Cancel old build
```

---

## What You Can Do With APK

✅ Install on Android devices
✅ Test on emulators
✅ Share with users for testing
✅ Publish to Google Play Store (requires signing)
✅ Distribute via QR code
✅ Beta testing with TestFlight

---

## File Information

**Build Output:**
- Filename: `digihealth.apk`
- Size: Approximately 50-80 MB
- Compatibility: Android 5.0+ (API 21+)
- Architecture: ARM64, ARMv7, x86, x86_64

**Installation:**
- Can be shared via email, cloud storage, QR code
- One-click installation on Android
- No app store required

---

## Advanced Options

### Build with Custom Name
```bash
eas build --platform android --profile preview --message "DigiHealth v1.0"
```

### View Build Status
```bash
eas build:view
```

### List All Builds
```bash
eas build:list --platform android
```

### Check Build Logs
```bash
eas build:view <BUILD_ID>  # View full logs
```

---

## Next Steps

1. **Build the APK**
   ```bash
   eas build --platform android --profile preview
   ```

2. **Download & Test**
   - Download APK from provided link
   - Test on Android device or emulator

3. **Share**
   - Share APK link with team
   - Get feedback from users

4. **Publish** (Optional)
   - Sign with production key
   - Submit to Google Play Store
   - Reach millions of users

---

## Support

### Issues?
- Check Expo docs: https://docs.expo.dev/
- View EAS documentation: https://docs.expo.dev/build/introduction/
- See Android docs: https://developer.android.com/

### Resources
- EAS Build: https://docs.expo.dev/build/introduction/
- Expo Docs: https://docs.expo.dev/
- React Native: https://reactnative.dev/

---

## Summary

**To build your APK in 5 minutes:**
```bash
npm install -g eas-cli
cd /path/to/digihealth
eas login
eas build --platform android --profile preview
# Download APK from link!
```

Your DigiHealth app is now ready to be installed on Android devices! 📦🚀

---

**Last Updated:** June 24, 2026
**Build Method:** EAS Build (Recommended)
**APK Status:** Ready to Build ✅
