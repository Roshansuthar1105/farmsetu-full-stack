# 🌾 FarmSetu Project Overview (Non-Technical)

FarmSetu is an all-in-one digital agriculture portal designed to empower farmers by bridging the gap between traditional agricultural practices and modern data-driven insights. It solves key rural challenges such as unpredictable weather, fluctuating market rates, lack of specialist guidance, disease outbreaks, and resource scarcity. The main value is providing farmers with real-time, actionable insights, a direct e-marketplace, and community resources to improve crop yield, hire local labor or machinery, and secure fair prices for their produce.

---

## 👥 Key User Roles

*   **Farmer:** The core user of the platform. Farmers can map their fields, track custom crop calendars, buy/sell agricultural goods, rent machinery, hire local laborers, seek expert advice, check weather updates, and monitor market prices.
*   **Expert (Agronomist):** Verified agricultural specialists and consultants. They monitor farmer queries, answer questions regarding crop health, diagnose crop diseases, and guide farmers on optimal cultivation techniques.
*   **Seller (Vendor):** Commercial agricultural suppliers. They list inputs like seeds, fertilizers, pesticides, tools, and farming machinery for direct sale or bidding in the marketplace.
*   **Admin (Platform Administrator):** Manage global users, moderate the community forum, seed commodity market prices, update crop databases, and broadcast newsletters/email updates.

---

## 🚀 Main Features (Organized by User Goal)

### Visualizing and Monitoring Farm Land
*   **Draw Farm Boundaries:** Outline fields on interactive map views to record exactly where crops are planted.
*   **Acreage Estimation:** Automatically calculate field surface areas in acres.
*   **Soil Health Indicators:** Track soil metrics (like nutrient levels, acidity, and moisture) to understand what inputs are needed.

### Scheduling Cultivation Tasks
*   **Seasonal Planners:** Set up cultivation trackers for main crop seasons (Kharif, Rabi, Zaid).
*   **Task Checklists:** Follow step-by-step guides for planting, watering, fertilizing, spraying, and harvesting.
*   **Activity Reminders:** Receive alerts when tasks are due to keep crops healthy and on schedule.

### Trading Agricultural Inputs & Rental Equipment
*   **Direct Marketplace Shop:** Browse, filter, and buy seeds, organic fertilizers, tools, and pesticides from verified sellers.
*   **Live Auction Bidding:** Place bids on high-demand farming inputs to win items at competitive rates.
*   **Equipment Rental Board:** Hire heavy machinery (like tractors, harvesters, or agricultural drones) from nearby farmers, or list idle equipment to earn extra income.

### Hiring Seasonal Farm Labor
*   **Job Posting Board:** Farmers post short-term jobs for field tasks (such as weeding or harvesting).
*   **Labor Application Board:** Job seekers apply for local farm work and track application statuses.
*   **Applicant Manager:** Review applications, accept hires, and coordinate schedules.

### Consulting Experts & AI Advisors
*   **Instant AI Assistant:** Ask quick agricultural questions and get immediate replies in local languages.
*   **Expert Escalation:** Send questions directly to verified agronomists, complete with photos of plants or soils.
*   **Real-Time Chats:** Swap texts, photos, and voice notes with advisors or neighboring contacts.

### Detecting Crop Diseases
*   **Photo Scanner:** Take and upload pictures of sick crop leaves.
*   **Instant AI Analysis:** Identify potential pests or plant disease types instantly.
*   **Treatment Advice:** Get immediate tips on organic and chemical treatments, plus preventive steps.

### Monitoring Market Prices & Mandis
*   **Live Price Dashboard:** Track updated crop prices across agricultural markets.
*   **Price Forecasts:** View price prediction charts to decide the best times to sell.
*   **Market Location Finder:** Find local markets, calculate travel distances, and check operating hours.
*   **Target Price Alerts:** Get notified when a commodity's price hits a desired rate.

### Managing Shared Water Resources
*   **Canal Water Queues:** Book specific water allocation times to irrigate fields fairly.
*   **Rain Forecast Safety Verification:** Run automated checks against weather data before booking to avoid watering fields right before heavy rainfall.

---

## 🗺️ Walkthrough of Key Screens

*   **Weather Center:** Shows current conditions and forecasts. Farmers see warnings for frost, heavy rain, or heatwaves, helping them decide when to harvest or irrigate.
*   **Market Price Advisor:** Shows tables and charts comparing commodity rates. Farmers can spot price spikes and identify the most profitable market to sell their harvest.
*   **AI Disease Classifier (ML Scanner):** Allows uploading images of sick plants. It tells the farmer exactly what disease the plant has and how to cure it, avoiding total crop failure.
*   **Advisory Chat Room:** A communication hub connecting farmers to AI helpers and real human specialists. Farmers get expert diagnostic help instantly when faced with crop issues.
*   **Water Gate Scheduler:** Shows a visual calendar of canal water times. Farmers book watering slots and coordinate with neighbors, ensuring fair resource distribution.
*   **Farm Dashboard (Geospatial Hub):** Shows a map of the farmer's plots with color-coded alerts. Allows drawing new plots and seeing visual soil reports at a glance.

---

## ⚖️ Business Rules & Logic

*   **Rain-Alert Water Booking Rule:** When a farmer books a canal irrigation slot, the system automatically checks local weather forecasts. If heavy rainfall is predicted during that period, the system warns the farmer, helping them avoid waterlogging their fields.
*   **Market Price Thresholds:** Farmers can save commodities to a watchlist. If the price goes above or drops below a custom target rate, the system triggers automated alerts via SMS, email, or WhatsApp.
*   **Expert Escalation Queue:** The chat begins with an automated AI bot. If the AI cannot solve the issue, or if the farmer requests a human expert, the session is placed in a live advisor queue. Verified agronomists can view and accept these queued sessions.
*   **Low-Stock Marketplace Banners:** If a seller's item stock falls below 5 units, the platform displays a prominent alert on the product details and shopping cart pages to encourage immediate checkout.
*   **Account Verification Standards:** Expert and Seller accounts must be manually verified by system administrators before they can offer consulting sessions or post products in the marketplace, preventing fraudulent listings or bad advice.

---

## ❓ Frequently Asked Questions

*   **How do I log in?**
    Enter your registered phone number or email and your password. Alternatively, you can log in using a secure one-time verification code (OTP) sent directly to your phone via SMS.
*   **How do I reset my password?**
    On the login screen, click "Forgot Password." Enter your phone number or email to receive a recovery code. Once verified, you will be prompted to type in a new secure password.
*   **Can I use this on my phone?**
    Yes! The portal is built specifically for smartphones. It is optimized to load quickly and consume very little data, making it reliable even in areas with weak internet connections.
*   **How do I get help?**
    Go to the "Advisory Chat" section. You can start typing with the automated helper, or click "Talk to Expert" to be connected to a live agricultural advisor.

---

## 📖 Glossary

*   **Mandi:** A local physical wholesale market in India where crops and agricultural commodities are traded.
*   **Kheti Chaupal:** The community discussion forum where farmers write posts, share pictures, ask questions, and chat with neighbors.
*   **Soil pH:** A metric measuring how acidic or basic the soil is, which helps determine which crops will grow best.
*   **NPK:** Nitrogen (N), Phosphorus (P), and Potassium (K) – the three crucial nutrients required for healthy plant growth.
*   **Stepper:** A progressive form wizard (such as the registration screens) that guides users through steps sequentially without overwhelming them.
*   **Auction:** A selling format where buyers compete by placing bids on goods, and the highest bidder wins the product when time runs out.
*   **Websocket:** A real-time connection technology that lets messages, bids, and updates show up instantly on your screen without you having to refresh the web page.
