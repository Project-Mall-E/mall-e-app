
# Mall-E Mobile App

A React Native mobile shopping app that displays products from multiple clothing stores with features for subscriptions, favorites, and custom lists.

## Features

- **Home Screen**: View products from stores you're subscribed to
- **Explore Screen**: Discover products from all available stores
- **Favorites**: Save products and organize them into custom lists
- **Product Details**: View detailed product information and open store links
- **Store Subscriptions**: Subscribe/unsubscribe from stores to personalize your feed

## Prerequisites

Before you begin, make sure you have these installed:

### Required for Everyone:
- **Node.js** (v18 or higher): [Download here](https://nodejs.org/)
- **Git**: [Download here](https://git-scm.com/)
- **Python 3.8+**: [Download here](https://www.python.org/downloads/)

### Optional (for mobile testing):
- **Expo Go app** on your phone:
  - [iOS App Store](https://apps.apple.com/app/expo-go/id982107779)
  - [Android Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent)

    
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

**First time setup (if venv doesn't exist):**
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
npm install --legacy-peer-deps
```

**Note:** We use `--legacy-peer-deps` because React Native has some peer dependency conflicts. This is normal.

**If you see errors:**
```bash
# Try clearing cache
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps
```

### Step 4: Run the App

#### Option A: Web Browser (Easiest - works on all platforms)

```bash
npm run web
```

This opens the app in your default browser. Best for initial testing and development.

#### Option B: iOS (Mac only)

```bash
npm run ios
```

Opens in iOS Simulator (requires Xcode).

#### Option C: Android

```bash
npm run android
```

Opens in Android Emulator (requires Android Studio setup).

#### Option D: Physical Device (iPhone or Android)

1. **Install Expo Go** on your phone
2. Run: `npm start`
3. Scan the QR code with:
    - **iOS**: Camera app → Opens in Expo Go
    - **Android**: Expo Go app → Scan QR code button

**Important:** Your phone and computer must be on the same WiFi network.

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

```bash
# Clear everything and reinstall
rm -rf node_modules package-lock.json
npm cache clean --force
npm install --legacy-peer-deps
```

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

### SDK version mismatch (Expo Go)

**Error: "Project is incompatible with this version of Expo Go"**

**Fix:** Use web version instead:
```bash
npm run web
```

Or update Expo Go app on your phone to the latest version.

---

## Development Workflow

### Making Changes

1. **Edit code** in `src/` folder
2. **Save** - Metro bundler will auto-reload
3. **Shake device** or press `m` in terminal to open Dev Menu

### Useful Commands

```bash
npm start          # Start dev server (choose platform)
npm run web        # Run in web browser
npm run ios        # Run on iOS simulator (Mac only)
npm run android    # Run on Android emulator

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
- [ ] **Search**: Type in search bar to filter products
- [ ] **Tap product**: Opens Product Detail screen
- [ ] **Heart icon**: Adds/removes from favorites
- [ ] **Explore tab**: Shows all products from all stores
- [ ] **Store chips**: Tap to filter by store
- [ ] **Subscribe button**: Toggle store subscription
- [ ] **Favorites tab**: View hearted products
- [ ] **Lists**: Create a new list, add products to it
- [ ] **Product Detail**: "View on [Store]" opens store link

---

## Known Issues

### Current Limitations:

1. **Static data**: Uses mock data from one-time scrape. No live updates.
2. **SDK 51**: Using older Expo SDK due to compatibility. Will upgrade later.
3. **Web only recommended**: iOS/Android have some setup issues on Windows.
4. **No authentication**: User data stored locally (AsyncStorage).

### Planned Improvements:

- [ ] Backend API for real-time product updates
- [ ] User authentication and cloud sync
- [ ] Push notifications for price drops
- [ ] Filter by price, size, color
- [ ] Share products with friends
- [ ] Dark mode

---

## Tech Stack

- **React Native**: Mobile framework
- **Expo**: Development tooling
- **TypeScript**: Type safety
- **React Navigation**: Screen navigation
- **AsyncStorage**: Local data persistence
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
