# Create Root Admin

This script creates the `root@unza.zm` admin account using the Firebase Admin SDK.

Steps:

1. In the Firebase Console, go to Project Settings → Service accounts.
2. Click **Generate new private key** and download the JSON file.
3. Save the file as `serviceAccountKey.json` in the project root (next to `package.json`).
4. Ensure `Email/Password` sign-in is enabled in Firebase Authentication.
5. From the project root run:

```bash
npm install
npm run create-root-admin
```

6. After the script completes, rotate the password for security, and remove `serviceAccountKey.json`.

Notes:
- The script will create the user if it does not exist, set custom claims (`role: 'admin', isRootAdmin: true`), and create `staffData/{uid}` and `adminAccounts/root` documents.
- `serviceAccountKey.json` is ignored via `.gitignore`.
