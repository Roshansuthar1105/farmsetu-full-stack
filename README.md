# 🚜 FarmSetu: Full-Stack Farmer Empowerment & Farm Management System

FarmSetu is a next-generation agricultural portal designed to empower farmers with geospatial field mapping, scheduled cultivation calendars, real-time crop disease detection, live mandi price analytics, and on-demand labor and machinery booking portals. It bridges the gap between traditional farming and high-tech data insights, helping farmers improve yield, hire local resources, and sell directly to consumers.

---

## 🌟 Key Features

* **Multi-Farm Geospatial Dashboard:** Sketched farm boundaries using Leaflet mapping with real-time geodesic area calculation (in Acres) and integrated IoT telemetry (NPK, pH, temperature).
* **Smart Cultivation Calendar:** Stage-by-stage scheduled checklists (Sowing, Irrigation, Fertilizing, etc.) with growth timeline completion trackers and custom crop registrations.
* **Direct E-Marketplace & Live Auction:** Buy or sell wholesale seeds, tools, and fertilizers via direct checkout or live bidding auctions.
* **Canal Water Queue Scheduler:** Community water resource allocation tool with automated Open-Meteo rainfall forecast verification before booking.
* **AI Disease Classifier & Advisor Chat:** Instant leaf crop disease analysis by photo uploads, coupled with expert-agronomist websocket chats or specialized AI adviser bots.
* **Labor & Machinery Rental Booking:** Seasonal hiring boards for farm laborers and a peer-to-peer machinery sharing portal for hiring tractors, harvesters, or drones.
* **Admin Command Console:** Global dashboards for moderating users, seeding commodity indexes, and broadcasting HTML newsletter bulletins.

---

## 🛠️ Tech Stack

* **Frontend:** Angular 18 (Standalone architecture, Signals reactive state, RxJS streams)
* **Styling:** Tailwind CSS v3 (Responsive grids, dark/light theme support) & SCSS (Custom animations)
* **Global State Management:** NgRx Store & Effects (Auth session slice)
* **Backend:** Java 21, Spring Boot 3 (Security, JPA, WebSockets, AOP)
* **Database:** PostgreSQL (Production persistent database)
* **Geospatial Maps:** Leaflet.js
* **Analytics Charts:** ApexCharts & Ng-Apexcharts

---

## ⚙️ Installation & Setup

### Prerequisites
* **Java Development Kit (JDK) 21** or higher
* **Node.js** v18+ and **npm** v10+
* **Maven** v3.8+ (wrapper is configured)
* **PostgreSQL** database running locally

### 1. Configure Environment Variables
Create a `.env` file in the root workspace with appropriate keys for database connections, Cloudinary upload credentials, and Brevo API integrations:
```env
DB_URL=jdbc:postgresql://localhost:5432/farmsetu
DB_USERNAME=postgres
DB_PASSWORD=your_secure_password
CLOUDINARY_URL=cloudinary://your_api_key:your_secret@cloud_name
BREVO_API_KEY=xkeysib-your-key-here
```

### 2. Launch Spring Boot Backend
Navigate to the `backend` folder, install Maven dependencies, and run:
```bash
cd backend
# Compile packages
mvn clean package -DskipTests
# Boot Spring Boot server
java -jar target/farmsetu-backend-1.0.0.jar
```
*The API services will start listening at http://localhost:8080. Swagger API docs are served at http://localhost:8080/swagger-ui.html.*

### 3. Launch Angular Frontend
Navigate to the `frontend` folder, install NPM packages, and spin up the local development server:
```bash
cd ../frontend
# Install dependencies
npm install
# Boot up local development server
npm run dev
```
*The web interface will open automatically in your browser at http://localhost:4200.*

---

## 🛡️ License

Distributed under the MIT License. See `LICENSE` for more information.
