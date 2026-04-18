# 💻 LuxeDrive: Technical Specification Report
**Prepared by:** Midhun Shaj  
**Architecture:** MERN Stack (MongoDB, Express, React, Node)

---

## 1. 🏗️ High-Level Design
LuxeDrive follows the **Model-View-Controller (MVC)** architectural pattern. 

*   **View (Frontend):** React components styled with Tailwind CSS and animated with Framer Motion. 
*   **Controller (Backend):** Express routes and controllers handling logic for bookings, car inventory, and user auth.
*   **Model (Database):** Mongoose schemas defining the structure for Users, Vehicles, and Transactions.

---

## 2. 📡 Core API Endpoints
### 👤 Authentication API
*   `POST /api/users/login` - User authentication & JWT generation.
*   `POST /api/users/google` - OAuth 2.0 social sync.

### 🚗 Vehicle API
*   `GET /api/cars` - Fetch all available fleet data.
*   `POST /api/cars/add` - (Admin Only) Secure vehicle upload.

### 💰 Booking & Payment API
*   `POST /api/bookings/create` - Initiates a Razorpay Order ID.
*   `POST /api/bookings/verify` - Verifies the Razorpay Signature.

---

## 3. 🌐 Real-Time Logic (Socket.io)
The system uses a **Websocket** connection to ensure that Car Availability is "Reactive." When a booking is finalized, a broadcast is sent to all connected clients to update the UI without a page refresh.

---

## 🤖 4. DevOps & Hosting
*   **Server:** Linux environment (AWS EC2).
*   **Process Manager:** PM2 (Ensures the backend never goes down).
*   **Automation:** GitHub Actions CI/CD pipeline for automated testing and deployment.
*   **Reverse Proxy:** Nginx (Handles SSL termination and Load balancing).
