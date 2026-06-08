# 🚜 FarmSetu: Full-Stack Farmer Empowerment & Farm Management System

FarmSetu is a modern, state-of-the-art full-stack agricultural platform designed to empower farmers with data-driven decision tools, advanced farm boundary mapping, real-time weather alerts, market price analytics, and a direct-to-consumer mandi marketplace.

---

## 🌟 Key Features

### 🚜 1. Multi-Farm & Geospatial Area Dashboard
* **Interactive Leaflet Mapping**: Locate farms and sketch exact boundary polygons with drag-and-drop node adjustments.
* **Geodesic Area Calculation**: Automated surface area calculation inside custom-drawn coordinates utilizing a spherical excess formula, displaying results instantly in Acres.
* **Nutrient & Environment Telemetry**: Dynamic IoT sensor metrics covering NPK ratios, soil pH, and environmental telemetry (Temperature, Rainfall, Humidity, Water Levels).

### 📅 2. Smart Crop Cultivation Calendar
* **Dual-Pane Action Center**: Visualizes active crops on the left and stage-by-stage scheduled tasks checklist (Sowing, Irrigation, Fertilizing, Pesticides, Harvesting, Selling) on the right.
* **Dynamic Crop Registration**: Register custom crops directly inside the scheduling form on the fly, saving them to `/api/crops` and auto-filling options.
* **Timeline Completion Metrics**: Computes active growth progress relative to `plantingDate` and `expectedHarvestDate`.

### 📊 3. Mandi Market Analysis & Admin Bulk Upload
* **Mandi Finder & Interactive Price Charts**: Interactive historical trend charting via ApexCharts, showing commodity price variations across different state mandis (markets).
* **Admin Bulk Upload**: Direct copy-paste CSV/JSON upload console for commodity prices, equipped with prefilled mock template helpers, strict input schema validation, and database records insertion.
* **CRUD Mandi Manager**: Exposes REST interfaces to edit, update, or remove commodity listings on demand.

### 🌤️ 4. Meteorological Geolocation Center
* **GPS Auto-Detect**: Uses browser Geolocation APIs to query local weather stations.
* **Dynamic City/District Search**: Converts named location strings to coordinates using geocoding APIs.
* **Saved Locations Dashboard**: Custom local list panels stored in `localStorage` displaying the current weather for saved cities.
* **Self-Healing Queries**: Cleans error suffixes (`(Location Not Found)`) or comma-delimited strings to correctly resolve queries.
* **Aesthetic Polish**: Styled with a dark glassmorphism card theme, Toastr notification warning overlays, and custom thin rounded scrollbars.

### 🤖 5. ML Disease Detection & AI Assistant
* **Disease Scanner**: Upload leaf images to run pest classification scans with instant treatment recommendations.
* **Agronomy Chatbot**: Get expert answers on crop health, soil treatment, and harvesting tips.
* **Agricultural News & Govt Schemes**: Browse daily crop news feeds and government financial aid details.

### 🏪 6. Direct-to-Consumer E-Marketplace
* **Agricultural Marketplace**: Order high-quality seeds, fertilizers, and tools.
* **Bidding & Cart Management**: Place direct bids on wholesale farm produce and manage delivery carts.

---

## 🛠️ Tech Stack

| Component | Technology | Description |
| :--- | :--- | :--- |
| **Backend Core** | Java 17, Spring Boot 3 | High-performance REST API & transactional orchestration |
| **Database** | Hibernate JPA, H2 / MySQL | Persistent data modeling, schema auto-generation & seeding |
| **Frontend Framework** | Angular 18 | Standalone component-driven frontend using **Angular Signals** |
| **Styling** | Tailwind CSS v3 & Vanilla CSS | Glassmorphic overlay panels, dark theme grids, micro-animations |
| **Maps & Geospatial** | Leaflet.js | Map rendering, polygon drawing, boundary calculations |
| **Charts** | ApexCharts | Historical commodity price trend graphs |

---

## ⚙️ Project Setup

### Prerequisites
* **Java Development Kit (JDK) 17** or higher
* **Node.js** v18+ and **npm** v10+
* **Maven** (wrappers are configured in the repository)

### 1. Launch Spring Boot Backend
Navigate to the `backend` directory and compile/run the project:
```bash
cd backend
# Compile and build package
mvn clean package -DskipTests
# Run the application
java -jar target/farmsetu-backend-1.0.0.jar
```
*The REST API endpoints will start listening at [http://localhost:8080](http://localhost:8080).*

### 2. Launch Angular Frontend
Navigate to the `frontend` directory, install packages, and boot up the development server:
```bash
cd frontend
# Install package dependencies
npm install
# Start local dev server
npm run dev
```
*The frontend portal will open at [http://localhost:4200](http://localhost:4200).*

---

## 📂 Project Structure

```text
farmsetu-full-stack/
├── backend/
│   ├── src/main/java/com/farmsetu/
│   │   ├── config/          # Startup price seeders and configuration beans
│   │   ├── controller/      # API Controllers mapping REST routes
│   │   ├── exception/       # Global exception interceptor and REST responses
│   │   ├── model/           # JPA entities (Crop, CropCalendar, MarketPrice) & DTOs
│   │   ├── repository/      # Spring Data JPA CRUD interfaces
│   │   └── service/         # Weather fetchers & transactional business logic
│   └── pom.xml              # Maven dependencies file
└── frontend/
    ├── src/app/
    │   ├── core/            # Services, API models, & auth interceptors
    │   ├── features/        # Standalone Angular feature views (Dashboard, Calendar, Mandi, Weather)
    │   └── shared/          # Reusable header navigation & page layout controls
    └── package.json         # Node scripts and devDependencies
```

---

## 🛡️ License
Distributed under the MIT License.
