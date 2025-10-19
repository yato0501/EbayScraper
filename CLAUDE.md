# EbayScrape - React Native App

## Project Overview
EbayScrape is a React Native mobile application that extracts vehicle information from images containing text lists of cars. The app uses image input and OCR (Optical Character Recognition) to parse car listings and output them in a standardized format.

## Purpose
This app allows users to:
1. Input/upload an image containing a text list of cars
2. Process the image using OCR to extract text
3. Parse and format the vehicle information
4. Output each car in the format: **YEAR MAKE Model**

## Use Case
Ideal for quickly digitizing car listings from screenshots, photos of printed lists, or any image containing vehicle information.

## Tech Stack
- **Framework**: React Native 0.81.4
- **Platform**: Expo ~54.0.13
- **React**: 19.1.0
- **Language**: TypeScript
- **OCR**: Tesseract.js (web only)
- **eBay Integration**: eBay Browse API (RESTful Buy API)
- **HTTP Client**: Axios

## Project Structure
```
EbayScrape/
├── App.tsx                             # Main application component (shell)
├── components/
│   ├── ImagePickerComponent.tsx        # Main image selection and OCR workflow
│   ├── EditableVehicleList.tsx         # Editable vehicle list with eBay search
│   ├── RawTextDebug.tsx                # Collapsible raw OCR text display
│   └── EbayResultsModal.tsx            # eBay search results modal with filtering
├── utils/
│   ├── ocrService.ts                   # Tesseract.js OCR integration
│   ├── vehicleParser.ts                # Vehicle text parsing logic
│   ├── imagePreprocessor.ts            # Image enhancement for OCR
│   └── ebayApiService.ts               # eBay Browse API integration
├── config/
│   ├── ebay.config.example.ts          # Example eBay API config (committed to git)
│   └── ebay.config.ts                  # Actual credentials (gitignored, create from example)
├── index.js                            # Entry point
├── app.json                            # Expo configuration
├── package.json                        # Dependencies and scripts
├── tsconfig.json                       # TypeScript configuration
└── assets/                             # Static assets (images, fonts, etc.)
```

## Getting Started

### Prerequisites
- Node.js >= 20.19.4
- npm or yarn
- Expo CLI (installed via npx)

### Installation
Dependencies are already installed. If you need to reinstall:
```bash
npm install
```

### Running the App
```bash
npm start
```

Then choose your platform:
- Press `a` for Android
- Press `i` for iOS (macOS only)
- Press `w` for web
- Scan QR code with Expo Go app on mobile device

### Available Scripts
- `npm start` - Start the Expo development server
- `npm run android` - Run on Android emulator/device
- `npm run ios` - Run on iOS simulator
- `npm run web` - Run in web browser

## Development Notes
- Main app code is in `App.tsx` (TypeScript)
- Uses Expo for simplified React Native development
- Component-based architecture with separate files for each feature

### Important Notes
- **⚠️ Tesseract.js is WEB ONLY**: Current OCR implementation (Tesseract.js) only works in web browsers. If native mobile support is needed, will require switching to a different OCR solution such as:
  - Google Cloud Vision API (works everywhere, requires API key)
  - AWS Rekognition (works everywhere, requires API key)
  - React Native Vision Camera + ML Kit (native only)
  - Expo OCR (if available)

### eBay API Setup

The app integrates with eBay's Browse API to search for high-value items. To enable this feature:

1. **Register for eBay Developer Account**
   - Go to https://developer.ebay.com/
   - Sign in or create a free account
   - Navigate to "My Account" → "Application Keys"

2. **Create an Application**
   - Click "Create a new application"
   - Fill in the application details
   - Choose "Production" or "Sandbox" environment
   - You'll receive:
     - **Client ID** (App ID)
     - **Client Secret** (Cert ID)

3. **Configure Credentials**
   - Copy the example config file:
     ```bash
     # In the EbayScrape directory
     cp config/ebay.config.example.ts config/ebay.config.ts
     ```
   - Open `config/ebay.config.ts`
   - Replace the placeholder values with your actual credentials:
     ```typescript
     const config: EbayConfig = {
       CLIENT_ID: 'your_actual_client_id',      // Replace with your Client ID
       CLIENT_SECRET: 'your_actual_client_secret', // Replace with your Client Secret
       ENVIRONMENT: 'PRODUCTION',  // or 'SANDBOX' for testing
     };
     ```
   - The actual config file (`ebay.config.ts`) is in `.gitignore` and won't be committed to git
   - If the config file doesn't exist, the app falls back to dummy credentials

4. **Features**
   - Click "eBay" button next to any vehicle to search
   - Results sorted by price (highest first) for high-value items
   - Filter results by excluding keywords (e.g., "parts", "salvage", "damaged")
   - View item details: price, condition, seller info, shipping costs
   - Click any item to open in eBay

**Note**: The app will show an error message if credentials are not configured. eBay API has rate limits on the free tier.

## Coding Standards

### TypeScript Rules
- **All objects MUST have explicit types** - No `any` type allowed
- All variables, function parameters, and return types must be properly typed
- Use interfaces or type aliases for object shapes
- Prefer strict type checking
- **Abstract interfaces and types** - Create separate `.types.ts` files for shared interfaces and types
  - Never duplicate type definitions across files
  - Import types from a single source of truth
  - Example: `config/ebay.types.ts` exports `EbayConfig` interface used by multiple files

## Required Features

### Core Functionality
1. **Image Input**
   - Camera capture
   - Photo library selection
   - Image preview

2. **OCR Processing**
   - Extract text from image
   - Handle various image qualities
   - Support different text orientations

3. **Text Parsing**
   - Identify vehicle information (Year, Make, Model)
   - Format output as "YEAR MAKE Model"
   - Handle multiple vehicles in single image

4. **Output Display**
   - Show formatted list of vehicles
   - Editable vehicle entries with delete functionality
   - eBay search integration with keyword filtering
   - Modal display for eBay search results

## Required Libraries (To Be Installed)
- `expo-image-picker` - For camera and gallery access
- `expo-camera` - Camera functionality
- OCR solution (options):
  - Google Cloud Vision API
  - AWS Rekognition
  - Tesseract.js
  - expo-ocr or react-native-vision-camera with ML Kit

## Implementation Plan
1. Set up image picker component
2. Integrate OCR service
3. Build text parser for vehicle information
4. Create UI for displaying results
5. Add export/copy functionality

## Future Enhancements
- Batch processing multiple images
- Edit/correct OCR results manually
- Save history of scanned lists
- Export to CSV or other formats
- Support for additional vehicle details (color, VIN, price, etc.)
