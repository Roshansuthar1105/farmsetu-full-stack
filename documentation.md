# 🖥️ FarmSetu Frontend Developer & Architecture Documentation

This document provides a comprehensive overview of the FarmSetu frontend architecture, page-by-page component breakdown, API integration, and routing scheme.

---

## 🏛️ 1. Frontend Overview

* **Framework:** **Angular v18.2.0** utilizing a component-driven architecture with **Standalone Components**.
* **State Management:**
  * **Global State:** **NgRx Store & Effects (v18.1.0)** is used to manage authentication sessions, user profiles, and login/logout state transitions.
  * **Local Reactive State:** **Angular Signals** are heavily used within components to manage reactive data bindings (e.g., active selections, form visibilities, coordinate variables, drawing triggers).
  * **Service Layer:** **RxJS (v7.8.0)** constructs async streams for network calls, image upload bindings, and real-time WebSocket messaging.
* **Styling Solution:**
  * **Tailwind CSS v3.4.14** handles fluid layout grids, dark/light theme classes, typography spacing, and glassmorphic card patterns.
  * **SCSS/SASS** handles custom scrollbar styling, keyframe animations, and complex Leaflet/ApexCharts container styles.
* **Routing Library:** **Angular Router (`@angular/router` v18.2.0)** orchestrates lazy-loaded standalone components and route guards.

---

## 📅 2. Page-by-Page Documentation

### 🏠 Public Landing Page
* **Route Path:** `/`
* **Role:** Introduces visitors to the FarmSetu ecosystem and features.
* **Functionality:** View core platform statistics, switch language, toggle dark/light theme, and redirect to authentication.
* **Main Components Used:** [LandingComponent](file:///d:/new%20project%20f/frontend/src/app/features/landing/landing.component.ts)
* **API Endpoints Called:** None
* **Authentication Required:** No (Guest access)

### 🔑 User Login
* **Route Path:** `/auth/login`
* **Role:** Authenticates existing users.
* **Functionality:** Input mobile number or email, toggle password visibility, trigger SMS/OTP verification popup, and direct social sign-in.
* **Main Components Used:** [LoginComponent](file:///d:/new%20project%20f/frontend/src/app/features/auth/login/login.component.ts) (integrates `AuthLayoutComponent`, `SocialLoginComponent`)
* **API Endpoints Called:**
  * `POST /api/auth/login` (Submit phone/email credentials)
  * `POST /api/auth/verify-otp` (Optional OTP login request)
* **Authentication Required:** No (Guest access)

### 📝 Farmer Registration Wizard
* **Route Path:** `/auth/register`
* **Role:** Multi-step wizard to register new farmers.
* **Functionality:** Form validation for personal credentials, OTP security verification, and default farm land specs collection.
* **Main Components Used:** 
  * [RegisterComponent](file:///d:/new%20project%20f/frontend/src/app/features/auth/register/register.component.ts) (Orchestrator)
  * [PersonalInfoStepComponent](file:///d:/new%20project%20f/frontend/src/app/features/auth/register/steps/personal-info-step.component.ts) (Step 1)
  * [OtpVerificationStepComponent](file:///d:/new%20project%20f/frontend/src/app/features/auth/register/steps/otp-verification-step.component.ts) (Step 2)
  * [FarmDetailsStepComponent](file:///d:/new%20project%20f/frontend/src/app/features/auth/register/steps/farm-details-step.component.ts) (Step 3)
* **API Endpoints Called:**
  * `POST /api/auth/register` (Submit full registration payload)
* **Authentication Required:** No (Guest access)

### 🔒 Password Recovery
* **Route Path:** `/auth/forgot-password`
* **Role:** Recovers lost user accounts.
* **Functionality:** Request verification code to email or mobile, verify 6-digit OTP code, and set a new password.
* **Main Components Used:** [ForgotPasswordComponent](file:///d:/new%20project%20f/frontend/src/app/features/auth/forgot-password/forgot-password.component.ts) (imports `OtpInputComponent`)
* **API Endpoints Called:**
  * `POST /api/auth/forgot-password` (Request OTP code)
  * `POST /api/auth/reset-password` (Verify OTP and save new password)
* **Authentication Required:** No (Guest access)

### 📲 Two-Factor Authentication (2FA)
* **Route Path:** `/auth/2fa`
* **Role:** Provides secondary OTP verification during login.
* **Functionality:** Input verification code, trust device selection, and resend OTP.
* **Main Components Used:** [TwoFactorComponent](file:///d:/new%20project%20f/frontend/src/app/features/auth/two-factor/two-factor.component.ts)
* **API Endpoints Called:**
  * `POST /api/auth/verify-otp` (Validate 2FA token)
* **Authentication Required:** No (Guest access)

### 🎛️ Portal Hub Dashboard
* **Route Path:** `/app/dashboard`
* **Role:** Hub landing page for authenticated farmers.
* **Functionality:** Navigate to quick links (weather, market price, ML scanner, P2P labor, schemes).
* **Main Components Used:** [DashboardComponent](file:///d:/new%20project%20f/frontend/src/app/features/dashboard/dashboard.component.ts)
* **API Endpoints Called:** None
* **Authentication Required:** Yes (`FARMER`, `EXPERT`, `SELLER`, `ADMIN`)

### 🚜 Geospatial Farm Hub
* **Route Path:** `/app/farm-dashboard`
* **Role:** Visual mapping and telemetry overview of fields.
* **Functionality:** Sketch field polygon boundary lines, auto-calculate acreage size, view soil telemetry indicators, and add/edit/delete farm records.
* **Main Components Used:** [FarmDashboardComponent](file:///d:/new%20project%20f/frontend/src/app/features/farm-dashboard/farm-dashboard.component.ts)
* **API Endpoints Called:**
  * `GET /api/dashboard/{userId}` (Fetch dashboard profile details and farms)
  * `POST /api/dashboard/farms/{userId}` (Register new farm land boundary)
  * `PUT /api/dashboard/farms/{userId}/{farmId}` (Modify existing farm specifications)
  * `DELETE /api/dashboard/farms/{userId}/{farmId}` (Remove farm land)
* **Authentication Required:** Yes (`FARMER`, `ADMIN`)

### 🛒 Agricultural Marketplace
* **Route Path:** `/app/marketplace`
* **Role:** Catalogs products for buy-now or bid-now.
* **Functionality:** Filter products by categories, search text queries, filter price bounds and rating, set stock limit status, sort listings, and upload images to create new product listings.
* **Main Components Used:** [ProductListComponent](file:///d:/new%20project%20f/frontend/src/app/features/marketplace/product-list.component.ts)
* **API Endpoints Called:**
  * `GET /api/marketplace/products` (Search and list products)
  * `POST /api/marketplace/products` (List a new product item)
  * `POST /api/marketplace/products/upload` (Upload image attachments)
* **Authentication Required:** Yes (`FARMER`, `SELLER`, `ADMIN`)

### 📦 Product Detail & Bidding Panel
* **Route Path:** `/app/marketplace/:id`
* **Role:** Detailed display page for specific products.
* **Functionality:** View product description, view ratings breakdown, write or delete customer reviews, place live auction bids, select quantity, add items to cart, or checkout directly.
* **Main Components Used:** [ProductDetailComponent](file:///d:/new%20project%20f/frontend/src/app/features/marketplace/product-detail.component.ts)
* **API Endpoints Called:**
  * `GET /api/marketplace/products/{id}` (Get product details)
  * `POST /api/marketplace/products/{id}/bids` (Submit bid amount)
  * `POST /api/marketplace/orders` (Buy product directly)
  * `POST /api/marketplace/cart` (Add to cart)
  * `GET /api/marketplace/products/{id}/reviews` (Fetch customer comments)
  * `POST /api/marketplace/products/{id}/review` (Add product rating)
  * `PUT /api/marketplace/reviews/{reviewId}` (Edit rating review)
  * `DELETE /api/marketplace/reviews/{reviewId}` (Remove rating review)
  * `DELETE /api/marketplace/products/{id}` (Cancel product listing)
* **Authentication Required:** Yes (All authenticated users)

### 🛒 Checkout Shopping Cart
* **Route Path:** `/app/marketplace/cart`
* **Role:** Manages checkout items.
* **Functionality:** Adjust quantities, display low-stock warning banners, input delivery address, and proceed to checkout.
* **Main Components Used:** [CartComponent](file:///d:/new%20project%20f/frontend/src/app/features/marketplace/cart.component.ts)
* **API Endpoints Called:**
  * `GET /api/marketplace/cart` (Fetch cart details)
  * `PUT /api/marketplace/cart/{productId}` (Update item quantities)
  * `DELETE /api/marketplace/cart/{productId}` (Remove item from cart)
  * `POST /api/marketplace/cart/checkout` (Checkout cart items)
* **Authentication Required:** Yes (All authenticated users)

### 📦 Order History Dashboard
* **Route Path:** `/app/orders`
* **Role:** Tracks orders for buyers and sellers.
* **Functionality:** View purchases or sales, moderate delivery status, cancel pending orders, and view transaction receipts.
* **Main Components Used:** [OrdersComponent](file:///d:/new%20project%20f/frontend/src/app/features/marketplace/orders.component.ts)
* **API Endpoints Called:**
  * `GET /api/marketplace/orders/buyer` (Get purchases logs)
  * `GET /api/marketplace/orders/seller` (Get incoming sales requests)
  * `PUT /api/marketplace/orders/{orderId}/status` (Update delivery status / cancel order)
* **Authentication Required:** Yes (All authenticated users)

### 💬 Advisory & Expert AI Chat
* **Route Path:** `/app/chat`
* **Role:** Live websocket advice chat.
* **Functionality:** Select AI bots or agronomists, send text/voice/media files, request expert escalation, view queue positions, and accept advisory sessions (for experts).
* **Main Components Used:** [ChatComponent](file:///d:/new%20project%20f/frontend/src/app/features/chat/chat.component.ts)
* **API Endpoints Called:**
  * `GET /api/users` (List experts/users)
  * `GET /api/chats/online` (Get online user list)
  * `GET /api/chats/{partnerId}` (Load chat messages)
  * `PUT /api/chats/read-all/{partnerId}` (Mark messages as read)
  * `POST /api/expert-chat/sessions` (Initialize advisory session)
  * `PUT /api/expert-chat/sessions/{id}/escalate` (Escalate to human expert)
  * `GET /api/expert-chat/queue` (Fetch position queue)
  * `PUT /api/expert-chat/sessions/{id}/accept` (Expert accept session)
  * `PUT /api/expert-chat/sessions/{id}/resolve` (Expert resolve session)
  * `POST /api/ai/chat` (Send message to AI bot)
  * `POST /api/chats/upload` (Upload voice / image files)
* **Authentication Required:** Yes (All authenticated users)

### 💬 Peer-to-Peer Contact Chat
* **Route Path:** `/app/farm-chat`
* **Role:** Direct chat between registered contacts.
* **Functionality:** Select contacts, search chat history, pin/unpin messages, and send attachments/voice notes.
* **Main Components Used:** [FarmChatComponent](file:///d:/new%20project%20f/frontend/src/app/features/chat/farm-chat.component.ts)
* **API Endpoints Called:**
  * `GET /api/users` (Get contacts list)
  * `GET /api/chats/online` (Fetch online presence)
  * `GET /api/chats/{partnerId}` (Load history)
  * `PUT /api/chats/read-all/{partnerId}` (Mark read)
  * `PUT /api/chats/{msgId}/read` (Mark single read)
  * `PUT /api/chats/{msgId}/pin` (Toggle pinned state)
  * `POST /api/chats/upload` (Upload files)
* **Authentication Required:** Yes (All authenticated users)

### 🌾 Kheti Chaupal (Community Forum)
* **Route Path:** `/app/community`
* **Role:** Interactive public discussion forum.
* **Functionality:** Post topics under categories, add comments, and like posts.
* **Main Components Used:** [CommunityComponent](file:///d:/new%20project%20f/frontend/src/app/features/community/community.component.ts)
* **API Endpoints Called:**
  * `GET /api/community/posts` (Get all posts)
  * `POST /api/community/posts` (Publish a post)
  * `POST /api/community/posts/{id}/like` (Like a post)
  * `GET /api/community/posts/{id}/comments` (Fetch comments)
  * `POST /api/community/posts/{id}/comment` (Add a comment)
* **Authentication Required:** Yes (All authenticated users)

### 📊 Mandi Price Analytics
* **Route Path:** `/app/market-analysis`
* **Role:** Price tracking and profitability calculators.
* **Functionality:** View latest prices, compare ROI across mandis, check 15-day price predictions, pin items to watchlists, and set price thresholds alerts.
* **Main Components Used:** [MarketAnalysisComponent](file:///d:/new%2520project%2520f/frontend/src/app/features/market-analysis/market-analysis.component.ts) (integrates ApexCharts)
* **API Endpoints Called:**
  * `GET /api/mandi-bhaav/commodities` (List commodities)
  * `GET /api/mandi-bhaav/latest` (Fetch local prices)
  * `GET /api/mandi-bhaav/watchlist` (Load pinned watchlist)
  * `POST /api/mandi-bhaav/watchlist` (Pin to watchlist)
  * `DELETE /api/mandi-bhaav/watchlist/{id}` (Unpin watchlist)
  * `GET /api/mandi-bhaav/compare-roi` (Fetch transport/revenue stats)
  * `GET /api/mandi-bhaav/forecast/{commodityId}` (Fetch predictions)
* **Authentication Required:** Yes (All authenticated users)

### 🌤️ Meteorological Weather Center
* **Route Path:** `/app/weather`
* **Role:** Geolocation-based agricultural weather forecasts.
* **Functionality:** View temperature/humidity alerts, check rain accumulation forecasts, geocode city strings, and save locations.
* **Main Components Used:** [WeatherComponent](file:///d:/new%20project%20f/frontend/src/app/features/weather/weather.component.ts)
* **API Endpoints Called:**
  * `GET /api/weather` (Get weather metrics for coords or city query)
  * `GET /api/weather/current` (Get current metrics for saved lists)
* **Authentication Required:** Yes (All authenticated users)

### 📅 Crop Cultivation Calendar
* **Route Path:** `/app/crop-calendar`
* **Role:** Crop cultivation checklist timelines.
* **Functionality:** Create cultivation calendars, view scheduled checklist items, edit tasks, check task completion, and register crops on the fly.
* **Main Components Used:** [CropCalendarComponent](file:///d:/new%2520project%2520f/frontend/src/app/features/crop-calendar/crop-calendar.component.ts)
* **API Endpoints Called:**
  * `GET /api/calendar/{userId}` (Get cultivation calendars)
  * `GET /api/calendar/{calendarId}/tasks` (Get schedule tasks)
  * `POST /api/calendar` (Add calendar plan)
  * `PUT /api/calendar/{planId}` (Edit calendar plan)
  * `DELETE /api/calendar/{planId}` (Delete calendar plan)
  * `POST /api/calendar/{calendarId}/tasks` (Schedule new task)
  * `PUT /api/calendar/tasks/{taskId}` (Toggle task completion)
  * `DELETE /api/calendar/tasks/{taskId}` (Delete task)
  * `GET /api/crops` (Get crop lists)
  * `POST /api/crops` (Register crop)
* **Authentication Required:** Yes (`FARMER`)

### 🤖 ML Disease Detection
* **Route Path:** `/app/disease-detection`
* **Role:** Pest classification and plant healthcare suggestions.
* **Functionality:** Upload plant photos to detect diseases and suggest treatments.
* **Main Components Used:** [DiseaseDetectionComponent](file:///d:/new%2520project%2520f/frontend/src/app/features/disease-detection/disease-detection.component.ts)
* **API Endpoints Called:**
  * `POST /api/disease/detect` (Classify photo and return advisor rules)
* **Authentication Required:** Yes (`FARMER`)

### 🗺️ Mandi Finder
* **Route Path:** `/app/mandi-finder`
* **Role:** Finds physical mandis.
* **Functionality:** Find markets within search radii, calculate distance, and view schedules/contacts.
* **Main Components Used:** [MandiFinderComponent](file:///d:/new%2520project%2520f/frontend/src/app/features/mandi-finder/mandi-finder.component.ts)
* **API Endpoints Called:**
  * `GET /api/mandis` (List all mandis)
  * `GET /api/mandis/nearby` (Search nearby mandis)
* **Authentication Required:** Yes (`FARMER`)

### 💧 Canal Water Distribution Queue
* **Route Path:** `/app/water-queue`
* **Role:** Canal water distribution queuing scheduler.
* **Functionality:** Schedule water allocation hours, check rain forecast warnings to bypass or abort bookings, view slot positions, and track running queue timelines.
* **Main Components Used:** [WaterQueueComponent](file:///d:/new%20project%20f/frontend/src/app/features/water-queue/water-queue.component.ts)
* **API Endpoints Called:**
  * `GET /api/water-queue/sources` (Get water source registry)
  * `GET /api/water-queue/bookings` (Get my water bookings)
  * `GET /api/water-queue/bookings/queue` (Get date-wise timeline queue)
  * `POST /api/water-queue/bookings/check` (Perform rain forecast verify check)
  * `POST /api/water-queue/bookings` (Submit water slot booking)
  * `PUT /api/water-queue/bookings/{id}/cancel` (Cancel booking)
* **Authentication Required:** Yes (`FARMER`)

### 💼 On-Demand Labor Booking Board
* **Route Path:** `/app/labor-booking`
* **Role:** Local seasonal labor hiring.
* **Functionality:** Post jobs, search available listings, apply for jobs, view application statuses, and accept/reject applicants.
* **Main Components Used:**
  * [LaborBookingComponent](file:///d:/new%20project%20f/frontend/src/app/features/labor-booking/labor-booking.component.ts)
  * [ManageApplicantsComponent](file:///d:/new%20project%20f/frontend/src/app/features/labor-booking/manage-applicants/manage-applicants.component.ts)
  * [JobCardComponent](file:///d:/new%2520project%2520f/frontend/src/app/features/labor-booking/job-card/job-card.component.ts)
  * [PostJobFormComponent](file:///d:/new%2520project%2520f/frontend/src/app/features/labor-booking/post-job-form/post-job-form.component.ts)
* **API Endpoints Called:**
  * `GET /api/labor/jobs` (Load open jobs)
  * `GET /api/labor/jobs/my` (Load my posted jobs)
  * `POST /api/labor/jobs` (Post job)
  * `POST /api/labor/jobs/{jobId}/apply` (Submit application)
  * `GET /api/labor/jobs/{jobId}/applications` (Get applicants list)
  * `PUT /api/labor/applications/{appId}/accept` (Accept applicant)
  * `PUT /api/labor/applications/{appId}/reject` (Reject applicant)
  * `GET /api/labor/applications/my` (Get my submissions)
* **Authentication Required:** Yes (`FARMER`)

### 🚜 Peer-to-Peer Machinery Rental
* **Route Path:** `/app/machinery`
* **Role:** Rent heavy agricultural machinery.
* **Functionality:** List machinery, calculate rental cost, request bookings, and approve/reject bookings.
* **Main Components Used:**
  * [MachineryDashboardComponent](file:///d:/new%20project%20f/frontend/src/app/features/machinery/machinery.component.ts)
  * [EquipmentCardComponent](file:///d:/new%2520project%2520f/frontend/src/app/features/machinery/equipment-card/equipment-card.component.ts)
  * [BookingRequestModalComponent](file:///d:/new%2520project%2520f/frontend/src/app/features/machinery/booking-modal/booking-modal.component.ts)
  * [ListEquipmentFormComponent](file:///d:/new%2520project%2520f/frontend/src/app/features/machinery/list-equipment-form/list-equipment-form.component.ts)
* **API Endpoints Called:**
  * `GET /api/machinery/equipment/nearby` (Search discover equipment)
  * `GET /api/machinery/equipment/my` (Get listed equipment)
  * `POST /api/machinery/equipment` (List new equipment)
  * `PUT /api/machinery/equipment/{id}` (Edit listing details)
  * `PUT /api/machinery/equipment/{id}/toggle` (Deactivate/activate equipment visibility)
  * `POST /api/machinery/equipment/{id}/calculate-cost` (Get rental rate computation)
  * `POST /api/machinery/bookings` (Request rental booking)
  * `GET /api/machinery/bookings/my` (Get my rentals)
  * `GET /api/machinery/bookings/incoming` (Get booking requests)
  * `PUT /api/machinery/bookings/{id}/approve` (Approve rental request)
  * `PUT /api/machinery/bookings/{id}/reject` (Reject rental request)
  * `PUT /api/machinery/bookings/{id}/complete` (Complete rental transaction)
* **Authentication Required:** Yes (`FARMER`)

### 👤 Profile & Soil Hub
* **Route Path:** `/app/profile`
* **Role:** Profile and land registry dashboard.
* **Functionality:** Upload profile photo, edit credentials, view reputation score/achievements, and register lands.
* **Main Components Used:** [ProfileComponent](file:///d:/new%20project%20f/frontend/src/app/features/profile/profile.component.ts)
* **API Endpoints Called:**
  * `GET /api/users/me` (Fetch user profile details)
  * `GET /api/dashboard/{userId}` (Get farm profile details and lands)
  * `GET /api/users/me/badges` (Get achievements list)
  * `PUT /api/users/me` (Modify name, bio, lang details)
  * `PUT /api/dashboard/farm-details/{userId}` (Update farming specs)
  * `POST /api/dashboard/farms/{userId}` (Register new land)
  * `PUT /api/dashboard/farms/{userId}/{farmId}` (Update land metrics)
  * `DELETE /api/dashboard/farms/{userId}/{farmId}` (Delete land)
  * `POST /api/chats/upload` (Upload avatar image)
  * `PUT /api/users/{userId}/profile-photo` (Save avatar photo URL)
* **Authentication Required:** Yes (All authenticated users)

### ⚙️ User Settings
* **Route Path:** `/app/settings`
* **Role:** System configurations page.
* **Functionality:** Toggle dark mode/high contrast, change font size, and set language (English/Hindi).
* **Main Components Used:** [SettingsComponent](file:///d:/new%20project%20f/frontend/src/app/features/profile/settings.component.ts)
* **API Endpoints Called:** None (client-side services only)
* **Authentication Required:** Yes (All authenticated users)

### 📈 Admin Dashboard
* **Route Path:** `/admin`
* **Role:** System statistics monitoring.
* **Functionality:** Displays total users, orders, and forum posts.
* **Main Components Used:** [AdminDashboardComponent](file:///d:/new%20project%20f/frontend/src/app/features/admin/admin-dashboard.component.ts)
* **API Endpoints Called:**
  * `GET /api/admin/dashboard` (Retrieve totals counts)
* **Authentication Required:** Yes (Requires `ADMIN` role)

### 👥 Admin User Management
* **Route Path:** `/admin/users`
* **Role:** Account moderation dashboard.
* **Functionality:** View users, search names, modify profile details, toggle active/verified, and deactivate users.
* **Main Components Used:** [AdminUsersComponent](file:///d:/new%20project%20f/frontend/src/app/features/admin/users/admin-users.component.ts)
* **API Endpoints Called:**
  * `GET /api/admin/users` (Fetch user page list)
  * `GET /api/admin/users/{id}` (Get user full details)
  * `PUT /api/admin/users/{id}/details` (Modify user profile details)
  * `PUT /api/admin/users/{id}` (Activate/Deactivate or Verify/Unverify account)
  * `DELETE /api/admin/users/{id}` (Deactivate account)
* **Authentication Required:** Yes (Requires `ADMIN` role)

### 🌾 Admin Crop Management
* **Route Path:** `/admin/crops`
* **Role:** Manages the crop variety dictionary.
* **Functionality:** Add crop types, edit parameters, edit local names, and delete crops.
* **Main Components Used:** [AdminCropsComponent](file:///d:/new%20project%20f/frontend/src/app/features/admin/crops/admin-crops.component.ts)
* **API Endpoints Called:**
  * `GET /api/admin/crops` (Get crops list page)
  * `POST /api/admin/crops` (Create crop)
  * `PUT /api/admin/crops/{id}` (Update crop parameters)
  * `DELETE /api/admin/crops/{id}` (Delete crop)
* **Authentication Required:** Yes (Requires `ADMIN` role)

### 🗺️ Admin Mandi Registry
* **Route Path:** `/admin/mandis`
* **Role:** Coordinates mandi registry databases.
* **Functionality:** Add, edit, or delete mandis.
* **Main Components Used:** [AdminMandisComponent](file:///d:/new%20project%20f/frontend/src/app/features/admin/mandis/admin-mandis.component.ts)
* **API Endpoints Called:**
  * `GET /api/admin/mandis` (Get mandis list page)
  * `POST /api/admin/mandis` (Create mandi)
  * `PUT /api/admin/mandis/{id}` (Update mandi details)
  * `DELETE /api/admin/mandis/{id}` (Delete mandi)
* **Authentication Required:** Yes (Requires `ADMIN` role)

### 📊 Admin Market Prices Bulk Upload
* **Route Path:** `/admin/market-prices`
* **Role:** bulk seeder for market prices.
* **Functionality:** Paste JSON arrays of commodity data, run syntax validations, submit bulk data, and edit single records.
* **Main Components Used:** [MarketPricesBulkComponent](file:///d:/new%20project%20f/frontend/src/app/features/admin/crops/market-prices-bulk.component.ts)
* **API Endpoints Called:**
  * `GET /api/market/prices` (Load existing price records)
  * `POST /api/market/prices/bulk` (Submit bulk JSON array)
  * `POST /api/market/prices` (Create single price entry)
  * `PUT /api/market/prices/{id}` (Edit price entry)
  * `DELETE /api/market/prices/{id}` (Delete price entry)
* **Authentication Required:** Yes (Requires `ADMIN` role)

### ✉️ Admin Email Broadcaster
* **Route Path:** `/admin/email`
* **Role:** Broadcasts communications to user bases.
* **Functionality:** Compose subject/content (plain text or HTML) and send emails.
* **Main Components Used:** [AdminEmailComponent](file:///d:/new%20project%20f/frontend/src/app/features/admin/email/admin-email.component.ts)
* **API Endpoints Called:**
  * `POST /api/admin/mail/send` (Dispatches email via Brevo REST APIs)
* **Authentication Required:** Yes (Requires `ADMIN` role)

### 📦 Admin Orders Control
* **Route Path:** `/admin/orders`
* **Role:** Moderate marketplace transactions.
* **Functionality:** View transactions, edit details, and delete transactions.
* **Main Components Used:** [AdminOrdersComponent](file:///d:/new%20project%20f/frontend/src/app/features/admin/orders/admin-orders.component.ts)
* **API Endpoints Called:**
  * `GET /api/admin/orders` (List all orders)
  * `PUT /api/admin/orders/{id}` (Update transaction info)
  * `DELETE /api/admin/orders/{id}` (Remove order)
* **Authentication Required:** Yes (Requires `ADMIN` role)

### 💧 Admin Canal distribution Queue
* **Route Path:** `/admin/water-queue`
* **Role:** Manages canal distribution queues.
* **Functionality:** Approve/complete/reject booking slots, add new water sources, edit flow rates, and delete sources.
* **Main Components Used:** [AdminWaterQueueComponent](file:///d:/new%20project%20f/frontend/src/app/features/admin/water-queue/admin-water-queue.component.ts)
* **API Endpoints Called:**
  * `GET /api/admin/water-queue/bookings` (Get booking queue slots)
  * `GET /api/admin/water-queue/sources` (Get water source registers)
  * `PUT /api/admin/water-queue/bookings/{id}/status` (Approve/Reject/Complete slot)
  * `POST /api/admin/water-queue/sources` (Add new water source)
  * `PUT /api/admin/water-queue/sources/{id}` (Update water source info)
  * `DELETE /api/admin/water-queue/sources/{id}` (Remove water source)
* **Authentication Required:** Yes (Requires `ADMIN` role)

---

## ⚡ 3. State Management Summary

* **Global Store Slice (Auth Store):**
  * **State Definition (`AuthState`):** Stores `user` object, `loading` state, and network `error` message.
  * **Actions:** `login` (Submit phone/email), `loginSuccess` (Saves authenticated user), `loginFailure` (Sets error message), and `logout` (Resets state).
  * **Effects (`AuthEffects`):** Intercepts `login` to invoke `AuthService.login()` and navigates on `loginSuccess` to `/app/dashboard`.
* **Local State Decisions (Signals vs Store):**
  * **NgRx Store (Global):** Handles user session details.
  * **Angular Signals (Local):** Handles interactive UI states (e.g., drawing mode flags, selected tab, search filter query, list of local nearby equipment, and weather search results). This avoids boilerplate code and optimizes performance.

---

## 🧭 4. Routing Table

| Route | Page Component | Authentication | Description |
| :--- | :--- | :--- | :--- |
| `/` | `LandingComponent` | No (Guest) | Public landing and system overview page |
| `/auth/login` | `LoginComponent` | No (Guest) | Login entry portal |
| `/auth/register` | `RegisterComponent` | No (Guest) | 3-step registration wizard for new farmers |
| `/auth/forgot-password` | `ForgotPasswordComponent` | No (Guest) | Reset account password via SMS/Email OTP |
| `/auth/2fa` | `TwoFactorComponent` | No (Guest) | OTP verification checkpoint |
| `/app/dashboard` | `DashboardComponent` | Yes (User) | Quick navigation dashboard |
| `/app/farm-dashboard` | `FarmDashboardComponent` | Yes (User) | Leaflet field boundary sketch map and IoT meters |
| `/app/marketplace` | `ProductListComponent` | Yes (User) | Search catalog and product listings creator |
| `/app/marketplace/cart` | `CartComponent` | Yes (User) | Selected item checkouts and delivery address inputs |
| `/app/marketplace/:id` | `ProductDetailComponent` | Yes (User) | Review listings, submit bids, order items, and write reviews |
| `/app/orders` | `OrdersComponent` | Yes (User) | Tracks purchases and incoming sales orders |
| `/app/chat` | `ChatComponent` | Yes (User) | Live agronomist advisory chats and AI specialist bots |
| `/app/farm-chat` | `FarmChatComponent` | Yes (User) | Peer-to-peer messaging |
| `/app/community` | `CommunityComponent` | Yes (User) | Kheti Chaupal forum |
| `/app/market-analysis` | `MarketAnalysisComponent` | Yes (User) | Mandi analytics charts, ROI tool, and price forecasts |
| `/app/weather` | `WeatherComponent` | Yes (User) | Local weather alerts and agricultural suggestions |
| `/app/news` | `NewsComponent` | Yes (User) | Aggregates daily agricultural news cards |
| `/app/resources` | `ResourcesComponent` | Yes (User) | Learning webinars catalog |
| `/app/govt-schemes` | `GovtSchemesComponent` | Yes (User) | Government subsidy schemes registry |
| `/app/insurance` | `InsuranceComponent` | Yes (User) | PMFBY insurance schemes directory |
| `/app/crop-recommendation`| `CropRecommendationComponent`| Yes (User) | Suggests optimal crops based on soil/season |
| `/app/crop-calendar` | `CropCalendarComponent` | Yes (User) | Cultivation calendar schedules and checklists |
| `/app/disease-detection` | `DiseaseDetectionComponent` | Yes (User) | ML pest classification scan uploads |
| `/app/mandi-finder` | `MandiFinderComponent` | Yes (User) | Near mandi finder |
| `/app/water-queue` | `WaterQueueComponent` | Yes (User) | Community canal water distribution queues |
| `/app/financial` | `FinancialComponent` | Yes (User) | Micro-loans directory and expense trackers |
| `/app/labor-booking` | `LaborBookingComponent` | Yes (User) | Seasonal labor booking portal |
| `/app/labor-booking/manage/:jobId` | `ManageApplicantsComponent`| Yes (User) | Approve applicant lists |
| `/app/machinery` | `MachineryDashboardComponent`| Yes (User) | discover, list, and rent heavy equipment |
| `/app/notifications` | `NotificationsComponent` | Yes (User) | Notifications inbox |
| `/app/profile` | `ProfileComponent` | Yes (User) | Profile edit, achievements, and land registry |
| `/app/settings` | `SettingsComponent` | Yes (User) | Dark mode, high contrast, and language choices |
| `/admin` | `AdminDashboardComponent` | Yes (Admin) | Administrative statistics panel |
| `/admin/users` | `AdminUsersComponent` | Yes (Admin) | moderate accounts and deactivations |
| `/admin/crops` | `AdminCropsComponent` | Yes (Admin) | manage standard crop parameters |
| `/admin/mandis` | `AdminMandisComponent` | Yes (Admin) | manage physical mandi metadata |
| `/admin/market-prices` | `MarketPricesBulkComponent` | Yes (Admin) | bulk upload commodity prices |
| `/admin/email` | `AdminEmailComponent` | Yes (Admin) | broadcast emails to users |
| `/admin/orders` | `AdminOrdersComponent` | Yes (Admin) | manage marketplace transactions |
| `/admin/water-queue` | `AdminWaterQueueComponent` | Yes (Admin) | moderate water source status |
| `**` | `NotFoundComponent` | No (Guest) | 404 Route Not Found page |
