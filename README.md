# Nazupro Nexus (v3) - AI Trading Fleet Dashboard

## 🚀 Overview
Nazupro Nexus is a real-time trading dashboard that connects to a local Python trading bot (`back2.py`) via a WebSocket bridge. It features AI-driven analytics, live signal streaming, and autonomous bot control.

---

## 🛠️ Configuration Steps

### 1. MongoDB Atlas Setup (Database)
You need to configure your Backend to talk to MongoDB Atlas.

#### A. Create Account & Cluster
1.  Log in to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2.  Create a **New Project**.
3.  Build a **Database** -> Choose **FREE (M0)** tier -> Create.
4.  **Security Quickstart**:
    *   Create a Database User (Username/Password). **Write these down.**
    *   **Network Access**: Select "Allow Access from Anywhere" (`0.0.0.0/0`) for easiest connectivity.

#### B. Get Connection String (For Backend)
1.  Click **Connect** on your Database Cluster.
2.  Choose **Drivers** -> **Node.js**.
3.  Copy the connection string. Replace `<password>` with your actual password.
    *   *Example:* `mongodb+srv://admin:pass123@cluster0.abcde.mongodb.net/?retryWrites=true&w=majority`
4.  **Create `server/.env`** and paste it:
    ```ini
    MONGODB_URI=your_connection_string_here
    PORT=5000
    CORS_ORIGIN=*
    ```

#### ❓ Do I need a Schema?
**NO.** You do **NOT** need to create any collections or schemas manually.
*   The system uses NoSQL.
*   The Backend will automatically create the `bots` and `signals` collections and structure the data via Mongoose when you run the app.

---

### 2. Deployment (Render - Web Service)
To host the dashboard online:

1.  Connect your repository to [Render](https://render.com).
2.  Create a new **Web Service**.
3.  **Settings:**
    *   **Root Directory:** `.` (Current root)
    *   **Build Command:** `npm run render-build`
    *   **Start Command:** `cd server && npm start`
    *   **Environment Variables:**
        *   `MONGODB_URI`: (Your Atlas Connection String)
        *   `NODE_VERSION`: `18`

---

### 3. Local Python Bot Connection
To connect your local `back2.py` to the hosted dashboard:

1.  **Get your Render URL** (e.g., `https://your-app.onrender.com`).
2.  **Rename/Create `.env`** in `nazmulbot` folder:
    *   Rename `.env.template` to `.env`.
3.  **Edit `.env`:**
    ```ini
    CLOUD_SERVER_URL=wss://your-app.onrender.com
    BOT_ID=Alpha  # Or your specific Bot ID
    ```

---

## ⚡ Running Locally

### Prerequisites
*   Node.js (v18+)
*   Python (v3.10+)

### 1. Start the Backend Server (Express + Socket.io)
The server handles WebSocket connections and database interactions.

```bash
cd "nazupro-nexus (v3)/server"
npm install
npm run dev
```
*Server will start on `http://localhost:5000`*

### 2. Start the Frontend (React + Vite)
The dashboard UI.

```bash
cd "nazupro-nexus (v3)"
npm install
npm run dev
```
*Frontend will start on `http://localhost:5173`*

### 3. Start the Python Bot
The trading logic and bridge.

```bash
cd "51main bot/51main bot/nazmulbot"
# Ensure virtualenv is active if you use one
pip install -r requirements.txt
python back2.py
```
*Bot will connect to `http://localhost:5000` (default) or your cloud URL on Render.*

---

## 📂 Project Structure
*   `server/`: Express backend (WebSocket & MongoDB).
*   `src/`: React Frontend.
*   `services/socketService.ts`: Real-time frontend communication.
*   `nazmulbot/cloud_sync.py`: Python Socket.io bridge.
