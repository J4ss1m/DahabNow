# Master Project Documentation & Developer Onboarding Guide

## 1. Executive Overview & Architecture

### What is DahabNow?
**DahabNow** is a sophisticated B2C/B2B marketplace and centralized hub designed specifically for the Saudi Arabian gold and jewelry market. It connects buyers with verified sellers, providing real-time gold prices, shop portfolios, Zakât calculation tools, and an interactive discovery platform. 

### Core Objectives
1. **Digital Transformation:** Modernize the traditional gold retail sector in Saudi Arabia.
2. **Trust & Verification:** Implement strict vetting processes for sellers, managed via a robust Admin Dashboard.
3. **Multilingual Accessibility:** Full support for Arabic (RTL) and English (LTR) with seamless switching.
4. **Premium User Experience:** Deliver an ultra-premium aesthetic with smooth micro-animations, glassmorphism, and a strict dark-mode/gold color palette (`#263238`, `#455A64`, `#D4AF37`).

### Architectural Patterns
- **Single Page Application (SPA):** Built strictly on React and Vite for immediate client-side routing.
- **Serverless Backend architecture:** Entirely reliant on Firebase (Firestore for NoSQL data, Authentication for identity, and Storage/Cloudinary for asset delivery).
- **Context-Driven State Management:** Global states (User Auth, Localized Language, User Favorites) are injected at the root level via React Context API, avoiding prop-drilling without the overhead of Redux.
- **Role-Based Access Control (RBAC):** Clients are categorized fundamentally into `guest`, `seller`, and `admin`, dictated directly by Firestore user documents and protected via route guards (`ProtectedRoute.jsx`).
- **Domain-Driven Directory Structure:** Components and classes are rigorously separated by domain logic (`admin`, `seller`, `guest`, `common`, `services`).

---

## 2. Exhaustive Tech Stack & Tooling

*   **React 18**
    *   *Why:* Industry standard for building reactive user interfaces using a Virtual DOM.
    *   *Function:* Orchestrates the entire application lifecycle, component rendering, and hook-based logic state.
*   **Vite**
    *   *Why:* Substantially faster HMR (Hot Module Replacement) and optimized build bundling compared to traditional Webpack.
    *   *Function:* Serves as the local dev server and compiles the production artifacts (`dist`).
*   **React Router DOM (v6)**
    *   *Why:* Seamless client-side routing.
    *   *Function:* Defines the URL structure (`/`, `/login`, `/seller`, `/admin`, `/shop/:id`) and manages browser history and URL search parameters for filtering.
*   **Firebase (Auth, Firestore, Storage)**
    *   *Why:* Zero-maintenance backend scaling.
    *   *Function:* Handles JWT-based user authentication, real-time NoSQL database listeners, and file hosting.
*   **Cloudinary**
    *   *Why:* Highly optimized edge-delivery of images with dynamic transformations (cropping, compression).
    *   *Function:* Primary storage point for high-resolution gold product images to prevent Firestore bandwidth throttling.
*   **Framer Motion**
    *   *Why:* Declarative, physics-based animation library for React.
    *   *Function:* Drives all UI micro-animations (page transitions, modal scaling, toast notifications, hover effects).
*   **React-i18next**
    *   *Why:* Standardized internationalization.
    *   *Function:* Provides dynamic dictionary switching between Arabic (`ar.json`) and English (`en.json`), alongside RTL/LTR layout management.
*   **React-Icons (`react-icons/fi`)**
    *   *Why:* Clean, scalable, lightweight SVG iconography (specifically the Feather Icons set).
    *   *Function:* Replaced all legacy emoji-based icons to ensure cross-platform professional rendering.
*   **Recharts**
    *   *Why:* Lightweight and declarative charting library built directly on React.
    *   *Function:* Powers the interactive Gold Price tracking visualization in the Services Hub.

---

## 3. Meticulous File-by-File Deep Dive

### `/src` (Root Logic)
*   **`main.jsx`**
    *   **Purpose:** The ultimate entry point of the React application.
    *   **Contents:** Mounts the app to `#root` via `ReactDOM.createRoot`.
    *   **Dependencies:** React, ReactDOM.
    *   **Relationships:** Injects `App.jsx`.
*   **`App.jsx`**
    *   **Purpose:** Central router and Provider orchestrator.
    *   **Contents:** Wraps the entire application in `AuthProvider`, `LanguageProvider`, and `FavoritesProvider`. Defines the structural `BrowserRouter` and maps all paths (`/`, `/admin`, `/seller`, etc.) to specific Page components. Implements `SplashScreen` timeout logic.
    *   **Dependencies:** React Router, Contexts.
    *   **Relationships:** Ties all global contexts to the routing tree.

### `/src/assets`
*   **`hero.png` & `vite.svg`**
    *   **Purpose:** Static image assets used for placeholders and hero backgrounds.

### `/src/classes` (Object-Oriented Domain Models)
*   *Purpose of folder:* Defines pure JS classes that represent the structural schema of the app's entities.
*   **`Account.js`, `Seller.js`, `Guest.js`, `SystemAdmin.js`**
    *   **Contents:** Inheritance hierarchy. `Account` is the base class (ID, email, name). `Seller` extends it with shop data, `SystemAdmin` with privilege flags.
*   **`Shop.js` & `Product.js`**
    *   **Contents:** Models representing a verified jewelry store and its individual items (karat, weight, pictures).
*   **`Advertisement.js` & `Notification.js` & `Message.js`**
    *   **Contents:** Schema mappings for marketing requests, system alerts, and internal comms.
*   **`GoldPrice.js` & `Area.js`**
    *   **Contents:** Utility models for regional data and market ticker points.

### `/src/components` (UI Modules)

#### `/admin`
*   **`AdminDashboard.jsx`**: The main entry page wrapping all admin functionalities. Contains the sidebar.
*   **`VerificationQueue.jsx`**: Logic for fetching `shops` where `isApproved == false`. Allows admins to review and approve/reject sellers.
*   **`ShopManagement.jsx`**: Active list of approved shops. Admins can revoke access or edit shop details.
*   **`ContentManagement.jsx`**: Allows admins to push global announcements or manage homepage featured sections.
*   **`AdRequestsManagement.jsx`**: Processes `adRequests` submitted by sellers. Admins toggle `status: "approved"`.
*   **`PlatformStats.jsx`**: Analytical overview (total users, shops, product counts) fetched via Firestore aggregations.

#### `/common`
*   **`DahabNowLogo.jsx`**: The SVG graphic representation of the application's branding.
*   **`Footer.jsx`**: The application footer. Contains `ContactModal` logic for deep-linking WhatsApp and Emails.
*   **`ForgotPassword.jsx`**: Uses Firebase `sendPasswordResetEmail` with localized error mapping.
*   **`GoldSpinner.jsx`**: Reusable loading state component using Framer Motion rotation.
*   **`ScrollToTopButton.jsx`**: Floating Action Button triggering `window.scrollTo`.
*   **`SearchResults.jsx`**: Dropdown triggered by the Header. Fetches `shops` dynamically via keyword matching.
*   **`SplashScreen.jsx`**: Initial 2.5-second brand introduction animation mounted at app launch.
*   **`Toast.jsx`**: Custom notification system (Success/Error/Info) using Framer Motion `AnimatePresence`.

#### `/header`
*   **`Header.jsx`**: Fixed navigation bar. Handles scrolling logic (hiding on scroll down, showing on scroll up/hover). Houses search bar, location picker, language toggle, and routing links.
*   **`NotificationsPanel.jsx`**: A pop-out menu listening to the `notifications` Firestore collection. Uses localStorage (`dahabnow_notif_readAt`) to calculate unread states locally.

#### `/home`
*   **`HeroSlider.jsx`**: Auto-rotating carousel. Interleaves default marketing slides with dynamically fetched, approved `adRequests` from sellers.
*   **`GoldPriceCard.jsx`**: Summary widget displaying today's 24k, 21k, and 18k gold rates.
*   **`ShopGrid.jsx`**: The primary discovery UI. Fetches approved shops, parses URL `?search=` and `?city=` parameters, and renders `ShopCard` components.
*   **`ServicesHub.jsx`**: A grid offering interactive widgets (Price Chart, Zakat Calculator, Portfolio).

#### `/portfolio` (New/Pending Feature)
*   **`AddItemModal.jsx`, `CreatePortfolioModal.jsx`, `PortfolioCard.jsx`**: Components for allowing buyers to track their physical gold assets over time.

#### `/seller`
*   **`ApprovalStatus.jsx`**: The "Holding Screen" a seller sees after registering but before an Admin approves them.
*   **`AddProduct.jsx` & `EditProductModal.jsx`**: Forms for creating/modifying a `Product` document. Contains Cloudinary upload logic.
*   **`MyProducts.jsx`**: Data table mapping products tied to `sellerId`.
*   **`MyShop.jsx`**: Form allowing sellers to update their public shop profile (avatar, description, location).
*   **`AdRequest.jsx`**: Form for sellers to submit a banner advertisement for Admin review.
*   **`AccountSettings.jsx`**: Standard user setting adjustments.

#### `/services`
*   **`GoldPriceChart.jsx`**: Uses `Recharts` to draw historical pricing trends.
*   **`ZakatCalculator.jsx`**: Formulaic component calculating 2.5% Zakat thresholds based on Nisab and specific karat purities.

#### `/shop`
*   **`ProductDetailModal.jsx`**: Expanded view of a specific gold item, showcasing weight, karat, and direct CTA buttons (WhatsApp the seller).

### `/src/context`
*   **`AuthContext.jsx`**: Wraps `onAuthStateChanged`. Fetches the associated `/users/{uid}` document to determine `role` and `isApproved` flags.
*   **`FavoritesContext.jsx`**: Uses `localStorage` to persist an array of favorite `shopId`s for guests/users without strict backend saves.
*   **`LanguageContext.jsx`**: Connects to `react-i18next`. Dynamically injects `dir="rtl"` or `dir="ltr"` into the DOM based on state.

### `/src/firebase`
*   **`config.js`**: Initializes the Firebase app using `import.meta.env` environment variables.
*   **`auth.js`, `firestore.js`, `storage.js`**: Re-exports initialized instances of specific Firebase services.

### `/src/hooks`
*   **`useLiveGoldPrice.js`**: Currently returns static/mocked data. Architected to be the point of integration for a live REST API (e.g., MetalPrice API).
*   **`usePortfolios.js`**: Hook managing CRUD operations for the buyer's physical gold tracking feature.

### `/src/i18n`
*   **`en.json` & `ar.json`**: Massive dictionary objects mapping UI keys to English and Arabic strings.
*   **`i18nConfig.js`**: Bootstraps the `i18next` library.

### `/src/pages`
*   **`AdminDashboard.jsx`**: (Detailed above in `/admin`).
*   **`HomePage.jsx`**: Stacks HeroSlider, ShopGrid, ServicesHub, and Footer.
*   **`LoginPage.jsx` & `RegisterPage.jsx`**: Authenticaton screens utilizing the topographic gold CSS pattern and `react-icons`.
*   **`FavoritesPage.jsx`**: Maps through `FavoritesContext` to fetch and render specific saved shops.
*   **`ShopPage.jsx`**: Dynamic route (`/shop/:shopId`). Fetches the shop and its related products.
*   **`RegisterShopPage.jsx`**: Secondary registration flow asking users for store location, WhatsApp, and name.
*   **`SellerDashboard.jsx`**: Wraps the `/seller` components into an accessible sidebar layout.

### `/src/routes`
*   **`ProtectedRoute.jsx`**: A High-Order Component wrapping React Router elements. Intercepts routing, checks `AuthContext.role`, and redirects unauthorized users back to `/`.

### `/src/styles`
*   **`globals.css`**: Defines CSS Resets, standard font imports (Tajawal), scrollbar aesthetics, and minor utility classes. The majority of styling is handled strictly via inline React styles (`style={{...}}`) per specific project guidelines.

---

## 4. Core Workflows & Data Flow

### A. User Authentication Flow
1. User hits `/login` or `/register`.
2. Component calls `createUserWithEmailAndPassword` or `signInWithEmailAndPassword`.
3. If new, a corresponding document is written to `/users/{uid}` with `{ email, role: "guest" }`.
4. `AuthContext` detects the session change via `onAuthStateChanged`, pulls the Firestore profile, and updates the global app state.
5. The Header updates dynamically to show `Avatar/Role` instead of the Login button.

### B. Shop Registration & Approval Flow
1. User logs in. Navigates to `/register-shop`.
2. Submits Shop details. A document is created in `/shops/{shopId}` with `isApproved: false` and `sellerId: user.uid`. The user's role is updated to `seller`.
3. Admin navigates to `/admin` -> `Verification Queue`.
4. Admin reviews shop. Clicks "Approve". Document is updated to `isApproved: true`.
5. The Seller, upon next login, bypasses `ApprovalStatus.jsx` and accesses `SellerDashboard.jsx`.

### C. Search & Discovery Data Flow
1. Buyer types into the `Header.jsx` search bar.
2. The `searchQ` state updates and triggers `SearchResults.jsx`.
3. A Firestore query fetches all `/shops` where `isApproved == true`.
4. Results are locally filtered using a `.filter(Regex(searchQ))` and displayed in a dropdown.
5. Clicking a shop routes to `/shop/:shopId`, which subsequently triggers a `getDocs` query against `/products` where `sellerId == shop.sellerId`.

---

## 5. Current State & Developer Handoff

### What is Fully Implemented?
- The fundamental infrastructure (Routing, Auth, i18n, Global Contexts).
- The complete visual design system (Gold/Dark theming, glassmorphism, Framer Motion transitions).
- Entire Admin and Seller dashboards.
- Product CRUD operations, Shop discovery, Search filtering, and Favorites tracking.
- User authentication and Password Reset mechanisms.

### Pending Tasks & Immediate Next Steps
1. **Live API Integration:** The `useLiveGoldPrice.js` hook is currently returning hard-coded mock numbers. It must be wired up to a real financial API (e.g., GoldAPI or MetalPrice).
2. **Notifications Backend:** The `NotificationsPanel.jsx` UI successfully listens to the `/notifications` Firestore collection, but there are no backend Firebase Cloud Functions currently written to *trigger* these notifications (e.g., triggering a notification when an admin approves a shop).
3. **Portfolio Service Development:** The UI for the Services Hub -> "Portfolio Tracker" exists as placeholders (`/portfolio`). The database schema and full CRUD UI need to be finalized for users to track their physical assets.
4. **Cloudinary Secrets:** Ensure `.env` vars for Cloudinary uploads inside `AddProduct.jsx` are secure and correctly configured for production scale.

### "Where to start" for a New Developer
1. **Understand the Auth Loop:** Begin by reading `src/context/AuthContext.jsx` and `src/routes/ProtectedRoute.jsx`. This dictates how everything else is accessed.
2. **Review the Data Schema:** Look at `src/classes/` to understand exactly what fields a `Shop`, `Product`, or `User` is expected to have in Firestore.
3. **Familiarize with the Aesthetic:** Open `src/components/common/Toast.jsx` and `src/components/home/HeroSlider.jsx` to see how `framer-motion` is intertwined with inline styles. Do not inject external CSS frameworks; maintain the inline scoped methodology.
4. **Tackle an Issue:** The best first ticket is to integrate the Live Gold Price API into `src/hooks/useLiveGoldPrice.js`, completely replacing the mock `[ { karat: 24, price: 310 }, ... ]` array with a standard `fetch()` or `axios` call.
