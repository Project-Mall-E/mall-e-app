# Mall-E Mobile App

A React Native mobile shopping app that displays products from multiple clothing stores with features for subscriptions, favorites, and custom lists.

## Features

- **Home Screen**: View products from stores you're subscribed to
- **Explore Screen**: Discover products from all available stores
- **Favorites**: Save products and organize them into custom lists
- **Product Details**: View detailed product information and open store links
- **Store Subscriptions**: Subscribe/unsubscribe from stores to personalize your feed

## Prerequisites

- Node.js (v16 or higher recommended)
- npm or yarn
- Expo CLI
- iOS Simulator (Mac only) or Android Studio (for Android development)
- For physical device testing: Expo Go app ([iOS](https://apps.apple.com/app/expo-go/id982107779) | [Android](https://play.google.com/store/apps/details?id=host.exp.exponent))

## Setup

### 1. Generate Mock Data

First, you need to run the backend scraper to generate product data:

**Windows (PowerShell):**
```powershell
# From project root (C:\Users\alboc\mall-e)
.\scripts\generate_mock_data.ps1