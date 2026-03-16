
# Mall-E Mobile App

A React Native mobile shopping app that displays products from multiple clothing stores with features for subscriptions, favorites, and custom lists.

## Features

- **Authentication**: Email/password sign-up and sign-in via Supabase; email confirmation; profile (username, first name, last name) stored in a secure `profiles` table
- **Home Screen**: View products from stores you're subscribed to
- **Explore Screen**: Discover products with a selector to browse by stores or by curated public lists; snap-up layout and refreshed product grid
- **Search Tab**: Search across **stores**, **products**, and **users** with filter chips (All, Stores, Products, Users); subscribe to stores or follow users from results
- **Favorites**: Save products and organize them into custom lists
- **Profile**: View and edit your profile; sign out; toggle **dark mode** (preference saved)
- **Product Details**: View detailed product information and open store links
- **Store Subscriptions**: Subscribe/unsubscribe from stores to personalize your feed

## Prerequisites

Before you begin, make sure you have these installed:

### Required for Everyone:
- **Node.js** (v18 or higher): [Download here](https://nodejs.org/)
- **Git**: [Download here](https://git-scm.com/)
- **Python 3.8+**: [Download here](https://www.python.org/downloads/)

### For native iOS/Android (Expo Developer Builds):
This app uses **Expo Developer Builds** (a custom dev client), not Expo Go. You need native tooling to build and run on device or simulator:
- **iOS**: Mac with [Xcode](https://developer.apple.com/xcode/) (for simulator or device)
- **Android**: [Android Studio](https://developer.android.com/studio) with SDK and an emulator or physical device

    
## Quick start (run the project)

```bash
cd mall-e-app
npm install          # Install dependencies (includes postinstall patches)
npm run web          # Run in browser (no native setup required)
# Or for native:
npx expo run:ios     # Build and run on iOS simulator (Mac only)
npx expo run:android # Build and run on Android emulator
```

See [Setup Instructions](#setup-instructions) and [Step 4: Run the App](#step-4-run-the-app) for full steps (including mock data and physical devices).

## Authentication & Supabase environment

The app uses **Supabase** for authentication (email/password) and for storing user profiles. You must configure a Supabase project and set local environment variables before the auth flow will work.

### Setting up your `.env` for Supabase

1. **Copy the example env file** (do not commit your real `.env`):

   ```bash
   cp .env.example .env
   ```

2. **Get your Supabase credentials** from the [Supabase Dashboard](https://supabase.com/dashboard):
   - Open your project → **Project Settings** (gear) → **API**.
   - Copy **Project URL** and **Publishable (anon) key**.  
   - Do **not** use or expose the **service_role** key in the app; it bypasses Row Level Security.

3. **Edit `.env`** and set:

   ```bash
   EXPO_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
   EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_publishable_key_here
   ```

   Replace `YOUR_PROJECT_REF` and `your_publishable_key_here` with your actual values.

4. **Keep `.env` out of version control.** The repo already ignores `.env` and `.env.local` in `.gitignore`. Never commit real keys.

5. **Restart the dev server** after changing env vars (e.g. `npm start` or `npm run web`). Expo only reads `EXPO_PUBLIC_*` variables at build/start time.

### How authentication works

- **Sign up**: Users enter email, password, username, first name, and last name. A confirmation email is sent (if enabled in Supabase). After they open the link (which deep-links back into the app), they are signed in and a row is created in the `profiles` table via a database trigger.
- **Sign in**: Email and password; on success the app shows the main tabs (Home, Explore, Favorites, Profile).
- **Session**: Stored in AsyncStorage and restored on app launch. Deep links from confirmation emails are handled so tapping the link opens the app and completes sign-in.
- **Profile**: Stored in Supabase `profiles` with RLS so users can only read/update their own row. The Profile tab lets users edit username, first name, last name and sign out.

Supabase dashboard setup (Auth providers, redirect URLs, `profiles` table, RLS, trigger) is required for this to work; see the project’s Supabase auth flow plan for the full phased setup.

## Project Structure
```markdown
mall-e/
   ├── mall-e-app/                  # React Native mobile app
   │       ├── src/
   │       │   ├── components/      # Reusable UI components
   │       │   ├── context/         # React Context (state management)
   │       │   ├── data/            # Mock data (generated from scraper)
   │       │   ├── hooks/           # Custom React hooks
   │       │   ├── navigation/      # Navigation configuration
   │       │   ├── screens/         # App screens
   │       │   └── types/           # TypeScript type definitions
   │       ├── .agents/             # Agent skills (React Native best practices)
   │       ├── App.tsx              # Root component
   │       └── package.json
   └── scripts/
          ├── get_store_url_and_tags/   # Python scraper (backend)
          │   ├── venv/                 # Python virtual environment
          │   ├── config/
          │   ├── models/
          │   └── ...
          ├── generate_mock_data.ps1    # Windows script
          └── generate_mock_data.sh     # Mac/Linux script
```

## Agent skills (AI-assisted development)

The repo includes React Native best-practice guidelines in `.agents/react-native-skills/` so that AI coding agents (e.g. Cursor, OpenCode) follow shared rules when building or refactoring code. The content is synced from [vercel-labs/agent-skills](https://github.com/vercel-labs/agent-skills).

**To update the agent skills** when the upstream repo adds or changes rules, run from the project root:

```bash
npm run update:agent-skills
```

Or run the script directly:

```bash
./scripts/sync-react-native-skills.sh
```

You can pass a branch or tag to sync from a specific ref, e.g. `./scripts/sync-react-native-skills.sh main`. After syncing, review the changes and commit. See [.agents/README.md](.agents/README.md) for more detail.

## Setup Instructions

### Step 1: Clone the Repository

```bash
# Clone the repo
git clone https://github.com/Project-Mall-E/mall-e-app.git

# Navigate to project root
cd mall-e-app

# If you also need the scripts (they might be separate):
cd ..
git clone https://github.com/Project-Mall-E/scripts.git
```

**Note:** The actual structure depends on how the repos are organized. Adjust paths accordingly.

### Step 2: Generate Mock Data

The app needs product data to display. We generate this using the Python scraper.

#### Windows (PowerShell):

```powershell
# Navigate to project root (where mall-e-app and scripts folders are)
cd C:\path\to\mall-e

# Run the mock data generator
.\scripts\generate_mock_data.ps1
```

**First time setup (if `venv` doesn't exist):**
- The script will automatically create a Python virtual environment
- Install dependencies (takes 5-10 minutes)
- Install Playwright Chromium browser
- Then scrape products

**Subsequent runs:**
- Much faster (2-5 minutes)
- Just scrapes fresh product data

#### Mac/Linux:

```bash
# Navigate to project root
cd /path/to/mall-e

# Make script executable (first time only)
chmod +x scripts/generate_mock_data.sh

# Run the script
bash scripts/generate_mock_data.sh
```

#### Manual Alternative (if scripts don't work):

```powershell
# Windows
cd scripts\get_store_url_and_tags
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
playwright install chromium
cd ..\..
$env:PYTHONPATH = "scripts"
python -m get_store_url_and_tags --stores "AmericanEagle,Abercrombie" --max-urls-per-shop 3 --json > mall-e-app\src\data\mock-data.json
```

```bash
# Mac/Linux
cd scripts/get_store_url_and_tags
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
playwright install chromium
cd ../..
export PYTHONPATH=scripts
python -m get_store_url_and_tags --stores "AmericanEagle,Abercrombie" --max-urls-per-shop 3 --json > mall-e-app/src/data/mock-data.json
```

**Expected output:**
- Creates `mall-e-app/src/data/mock-data.json`
- File should contain an array of product objects
- Should see "Found X products in the mock data"

### Step 3: Install App Dependencies

```bash
cd mall-e-app
npm install
```

- **First run:** `npm install` also runs `patch-package` (postinstall) to apply any patches in `patches/`. Commit `package-lock.json` so everyone gets the same versions.
- See [Dependencies](#dependencies) for full instructions on installing, upgrading, adding, and troubleshooting dependencies.

### Git hooks (Lefthook)

Pre-commit hooks run checks before each commit so broken code is not committed. They use **TypeScript** (typecheck), **ESLint**, **Stylelint**, and **cspell** (spelling). All of these tools are installed as dev dependencies when you run `npm install`, so the hooks never prompt to install packages.

**Installation (all platforms):** No extra steps. When you run `npm install` in `mall-e-app` (Step 3 above), the `prepare` script automatically runs `lefthook install` and installs the Git hooks. This works the same on Linux, Mac, and Windows.

**Verify hooks are installed:** Run `npx lefthook install`. It should complete without errors.

**Verify the hook runs:** Run `npx lefthook run pre-commit` (or `npm run validate:hooks`). Success means the pre-commit checks (e.g. typecheck) run and pass.

If a commit is blocked by the hook, fix the reported errors and try again. To skip hooks for a single commit (not recommended): `git commit --no-verify`.

### Step 4: Run the App

This project uses **Expo Developer Builds** (custom dev client with `expo-dev-client`), not Expo Go. You run a native build that connects to the Metro bundler for fast refresh and dev tools.

#### Option A: Web Browser (easiest — no native setup)

```bash
npm run web
```

Opens the app in your default browser. Best for initial testing and development.

#### Option B: iOS (Mac only)

```bash
npx expo run:ios
```

Builds the native app and opens it in the iOS Simulator (requires Xcode). First run may take a few minutes while the native project is built.

#### Option C: Android

```bash
npx expo run:android
```

Builds the native app and opens it in the Android emulator (requires Android Studio and an AVD). First run may take a few minutes.

#### Option D: Physical device (iPhone or Android)

1. **Build and install the dev client** on your device:
   - **iOS**: Connect your iPhone, then run `npx expo run:ios` and choose your device from the list (or open `ios/MallE.xcworkspace` in Xcode and run to your device).
   - **Android**: Enable USB debugging, connect the device, then run `npx expo run:android` (it will install the debug build).
2. **Start the dev server:** `npm start`
3. The app on your device will connect to Metro. If it doesn’t, shake the device (or press the menu key on Android) to open the dev menu and enter your machine’s IP (your computer and phone must be on the same Wi‑Fi network).

**Note:** We no longer use Expo Go; the app requires a developer build that includes native code and the dev client.

---

## Dependencies

### 1. Installing dependencies

**First time (after clone) or when someone else has updated `package.json`:**

```bash
cd mall-e-app
npm install
```

- This runs the `postinstall` script (`patch-package`), which applies patches in the `patches/` folder. No extra step needed.
- Commit and use `package-lock.json` so everyone gets the same dependency versions.
- If you see peer dependency or version errors, see [Troubleshooting dependencies](#4-troubleshooting-dependencies) below.

### 2. Upgrading dependencies

**Expo and React Native–related packages (recommended):**

```bash
cd mall-e-app
npx expo install --fix
```

This aligns Expo SDK packages and React/React Native to versions compatible with your current SDK. Run it after upgrading the Expo SDK or when you see version mismatch errors.

**Other packages:**

- Update version ranges in `package.json`, then run `npm install`.
- Or use `npm update` to bump within existing semver ranges (e.g. `^1.0.0`).

**Major upgrades (e.g. new Expo SDK):**

- Follow the [Expo upgrade guide](https://docs.expo.dev/workflow/upgrading-expo/) for your target SDK.
- Then run `npx expo install --fix` and fix any breaking changes.

### 3. Adding dependencies

**Expo / React Native / React ecosystem packages:**

Use Expo’s installer so versions stay compatible with the current SDK:

```bash
cd mall-e-app
npx expo install <package-name>
```

Examples: `npx expo install expo-camera`, `npx expo install @react-navigation/native`.

**Plain JavaScript/TypeScript packages (no Expo/RN coupling):**

```bash
npm install <package-name>
```

For dev-only tools (e.g. linters, types):

```bash
npm install --save-dev <package-name>
```

- Do **not** manually add or upgrade `react` or `react-native` unless you are following an Expo upgrade; use `npx expo install` for those.

### 4. Troubleshooting dependencies

**React version mismatch (“react” and “react-native-renderer” must match):**

- This happens when `react` and the React version used by React Native get out of sync.
- Fix: run `npx expo install --fix` to align versions.
- If the error persists, ensure `package.json` does not use a newer React than Expo supports (e.g. for SDK 54, React is pinned to 19.1.4). Do not use a loose range like `^19.1.0` for `react`/`react-dom` if it pulls in a different minor version.

**Peer dependency conflicts or “npm install” fails:**

```bash
cd mall-e-app
rm -rf node_modules package-lock.json
npm cache clean --force
npm install
```

If conflicts remain, try:

```bash
npm install --legacy-peer-deps
```

**“Cannot read property 'default' of undefined” or odd runtime errors after install:**

- Often caused by mixed React versions or stale Metro cache.
- Fix: align versions with `npx expo install --fix`, then clear and restart:

```bash
rm -rf node_modules
npm install
npx expo start --clear
```

**Expo/React Native version incompatibility:**

- Check [Expo SDK versions](https://docs.expo.dev/versions/latest/) for the React and React Native versions that match your SDK.
- Prefer `npx expo install <pkg>` when adding or upgrading Expo/RN-related packages.

---

## Troubleshooting

### Mock data is empty or missing

**Symptom:** App loads but shows "No products found"

**Fix:**
```bash
# Check if mock-data.json exists and has content
cat mall-e-app/src/data/mock-data.json  # Mac/Linux
type mall-e-app\src\data\mock-data.json  # Windows

# If empty or missing, re-run the generator
.\scripts\generate_mock_data.ps1  # Windows
bash scripts/generate_mock_data.sh  # Mac/Linux
```

### Python scraper fails

**Common issues:**

1. **Python not found:**
    - Install Python 3.8+ from [python.org](https://www.python.org/downloads/)
    - Make sure "Add to PATH" is checked during installation

2. **playwright install fails:**
   ```bash
   # Windows - Run PowerShell as Administrator
   playwright install chromium
   
   # Mac/Linux - Install system dependencies
   playwright install --with-deps chromium
   ```

3. **Module not found errors:**
   ```bash
   cd scripts/get_store_url_and_tags
   source venv/bin/activate  # Mac/Linux
   .\venv\Scripts\Activate.ps1  # Windows
   pip install -r requirements.txt
   ```

### npm install fails

**Error: "Cannot find module" or dependency conflicts**

See [Troubleshooting dependencies](#4-troubleshooting-dependencies) for full steps (clean reinstall, cache clear, and when to use `--legacy-peer-deps`).

### Expo start fails

**Error: "Metro bundler failed"**

```bash
# Clear Expo cache
npm start -- --clear

# Or use:
npx expo start --clear
```

**Error: "Port 8081 already in use"**

```bash
# Use different port
npm start -- --port 8082

# Or find and kill the process using port 8081
# Windows: netstat -ano | findstr :8081
# Mac/Linux: lsof -ti:8081 | xargs kill
```

### Images not loading

- Check internet connection
- Verify `mock-data.json` has valid image URLs
- Some stores may block external image requests (normal)

### SDK version mismatch (developer build)

**Error: "Project is incompatible with this version of Expo Go" or similar**

This app does **not** use Expo Go; it uses Expo Developer Builds. If you see compatibility errors:

- **On device/simulator:** Rebuild the dev client so it matches the project’s Expo SDK: run `npx expo run:ios` or `npx expo run:android` again (clean if needed: e.g. `npx expo run:ios --no-build-cache`).
- **Quick workaround:** Run in the browser: `npm run web`.

---

## Development Workflow

### Making Changes

1. **Edit code** in `src/` folder
2. **Save** - Metro bundler will auto-reload
3. **Shake device** or press `m` in terminal to open Dev Menu

### Useful Commands

```bash
npm install        # Install dependencies (run after clone or when package.json changes)
npm start          # Start Metro dev server (for dev builds / web)
npm run web        # Run in web browser (no native build)
npx expo run:ios     # Build and run on iOS simulator (Mac only, developer build)
npx expo run:android # Build and run on Android emulator (developer build)

# Clear cache if you see weird errors
npm start -- --clear
```

### Hot Reloading

- **Fast Refresh**: Automatically reloads when you save files
- If something breaks, press `r` in the terminal to reload manually

---

## Testing the App

### Quick Feature Test Checklist:

- [ ] **Home Screen**: Shows products from subscribed stores (default: AmericanEagle)
- [ ] **Explore tab**: Select "Stores" or "Lists" to browse; store chips and product grid
- [ ] **Search tab**: Type to search; filter by All / Stores / Products / Users; subscribe or follow from results
- [ ] **Tap product**: Opens Product Detail screen
- [ ] **Heart icon**: Adds/removes from favorites
- [ ] **Store chips**: Tap to filter by store
- [ ] **Subscribe button**: Toggle store subscription
- [ ] **Favorites tab**: View hearted products
- [ ] **Lists**: Create a new list, add products to it
- [ ] **Product Detail**: "View on [Store]" opens store link
- [ ] **Auth**: Sign up (with email confirmation), sign in, Profile tab (edit profile, sign out)
- [ ] **Dark mode**: Toggle in Profile; app and tab bar switch to dark theme; preference persists

---

## Known Issues

### Current Limitations:

1. **Static data**: Uses mock data from one-time scrape. No live updates.
2. **Developer builds required**: The app uses Expo Developer Builds (custom dev client), not Expo Go; you need Xcode (iOS) or Android Studio (Android) to run on device or simulator.
3. **Web for quickest start**: For the fastest run without native tooling, use `npm run web`; iOS/Android require native setup.
4. **Auth requires Supabase**: Sign-up/sign-in and profiles depend on a configured Supabase project and a local `.env` with `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY`. Favorites and lists are still stored locally (AsyncStorage).

### Planned Improvements:

- [ ] Backend API for real-time product updates
- [ ] Cloud sync for favorites and lists
- [ ] Push notifications for price drops
- [ ] Filter by price, size, color
- [ ] Share products with friends

---

## Tech Stack

- **React Native**: Mobile framework
- **Expo**: Development tooling
- **TypeScript**: Type safety
- **React Navigation**: Screen navigation (tabs: Home, Explore, Search, Favorites, Profile)
- **ThemeContext**: App-wide light/dark mode (persisted via AsyncStorage)
- **Supabase**: Authentication and user profiles (email/password, RLS)
- **AsyncStorage**: Local data persistence (session, favorites, lists, dark mode preference)
- **Python**: Backend scraper for product data

---

## Project Context

This is a two-part system:

1. **Backend (Python)**: Scrapes product data from clothing stores
    - Located in `scripts/get_store_url_and_tags/`
    - Discovers category URLs, scrapes products
    - Outputs JSON data

2. **Frontend (React Native)**: Mobile app interface
    - Located in `mall-e-app/`
    - Consumes JSON from backend
    - Provides shopping/browsing experience

Currently uses **mock data workflow** (one-time scrape → JSON file). Future: REST API for live data.

---


### If Mock Data Changed:

```bash
# Re-generate mock data
.\scripts\generate_mock_data.ps1  # Windows
bash scripts/generate_mock_data.sh  # Mac/Linux

# Restart the app
npm start
```
