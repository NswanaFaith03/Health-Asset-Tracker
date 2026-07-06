#!/bin/bash

# DigiHealth APK Build Script
# Automates the entire APK building process

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Functions
print_header() {
    echo -e "${BLUE}============================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}============================================${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${YELLOW}ℹ️  $1${NC}"
}

# Main script
print_header "DigiHealth APK Build Script"

# Check if in correct directory
if [ ! -f "app.json" ]; then
    print_error "app.json not found. Make sure you're in the digihealth directory."
    echo "Run: cd /home/dalitso/Desktop/projects/Health-Asset-Tracker/artifacts/digihealth"
    exit 1
fi

print_success "Found app.json - Correct directory confirmed"

# Check if EAS CLI is installed
if ! command -v eas &> /dev/null; then
    print_info "EAS CLI not found. Installing..."
    npm install -g eas-cli
    print_success "EAS CLI installed"
else
    print_success "EAS CLI is installed"
fi

# Check if eas.json exists
if [ ! -f "eas.json" ]; then
    print_info "eas.json not found, but it's been created in the project."
    print_info "You can now run: eas build --platform android --profile preview"
    exit 0
fi

print_success "eas.json configuration found"

# Prompt for build type
print_header "Select Build Type"
echo "1) Preview (Fast - 10-15 min, for testing)"
echo "2) Production (Optimized - 15-20 min, for Play Store)"
echo "3) Cancel"
read -p "Choose option (1-3): " choice

case $choice in
    1)
        print_info "Starting PREVIEW build..."
        eas build --platform android --profile preview
        print_success "Build started! Check your Expo account for download link."
        ;;
    2)
        print_info "Starting PRODUCTION build..."
        eas build --platform android --profile production
        print_success "Build started! Check your Expo account for download link."
        ;;
    3)
        print_info "Build cancelled."
        exit 0
        ;;
    *)
        print_error "Invalid choice."
        exit 1
        ;;
esac

print_header "Build Complete"
print_success "Your APK build has been submitted!"
print_info "Next steps:"
echo "1. Wait for build to complete (10-20 minutes)"
echo "2. Download APK from Expo dashboard"
echo "3. Transfer to Android device"
echo "4. Install by opening the APK file"

print_info "View build status:"
echo "  eas build:list --platform android"

print_info "Track build progress:"
echo "  eas build:view"
