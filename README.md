# 🚄 RailYatri Connect

**RailYatri Connect** is a modern, full-stack Indian railway booking platform that integrates AI-powered assistance, real-time train tracking, automated ticket management, and seamless digital experiences for travelers.

---

## ✨ Features

* **Train Ticket Booking** – Search, book, and manage train tickets easily.
* **AI Assistant – Ask Disha** – Instant help for bookings, cancellations, transfers, and travel queries using Perplexity AI.
* **Live Train Tracking** – View real-time train locations and platform status.
* **PNR Status Checker** – Instantly check your PNR status and get live updates.
* **Scheduled Bookings** – Automate Tatkal and high-demand bookings at the optimal time.
* **Smart Notifications** – Receive alerts for PNR status, platform changes, payment deadlines, and more.
* **Ticket Transfer** – Securely transfer or resell tickets to friends and family.
* **Payment Reminders** – Never miss Tatkal or booking payment deadlines.
* **Digital Ticket Sharing** – Share tickets with QR codes securely.
* **User Account Management** – Register, login, and manage your account securely.

---

## 🏗️ Project Structure

```
IrctcBookingPlatform/
├── client/             # Frontend (React, Vite)
├── server/             # Backend (Node.js, Express, Drizzle ORM)
├── prisma/             # DB schema and migrations
├── .env                # Environment variables
├── README.md           # Project README
└── package.json
```

---

## 🚀 Getting Started (Local Development)

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/IrctcBookingPlatform.git
cd IrctcBookingPlatform
```

### 2. Install Dependencies

```bash
npm install
cd client && npm install
```

### 3. Set Up the Database

* Install PostgreSQL and create a database named `irctc_booking`.
* Set the environment variable:

```bash
export DATABASE_URL=postgresql://username:password@localhost:5432/irctc_booking
```

* Push the schema using Drizzle:

```bash
npx drizzle-kit push
```

### 4. Run the App in Development

Start the backend:

```bash
npm run dev
```

Start the frontend:

```bash
cd client
npm run dev
```

Visit: [http://localhost:5000](http://localhost:5000)

---

## 🛠️ Build for Production

Build both frontend and backend:

```bash
cd client
npm run build
```

Backend is bundled with a Node.js server for deployment.

---

## 🌐 Deployment

### Frontend (Recommended: Vercel)

Deploy the `client/` folder to Vercel with the following settings:

* **Root Directory:** `IrctcBookingPlatform/client`
* **Build Command:** `npm run build`
* **Output Directory:** `dist`
* **Install Command:** `npm install`

### Backend (Recommended: Render, Railway, Fly.io, or Heroku)

Deploy the root directory (`IrctcBookingPlatform/`) to your preferred Node.js host.

* Set environment variables (e.g., `DATABASE_URL`, `SESSION_SECRET`)
* Use the following start command:

```bash
npm run start
```

---

## ⚙️ Environment Variables

| Variable             | Description                           |
| -------------------- | ------------------------------------- |
| `DATABASE_URL`       | PostgreSQL connection string          |
| `SESSION_SECRET`     | Session key for secure authentication |
| `PERPLEXITY_API_KEY` | *(Optional)* API key for AI assistant |

---

## 📚 API Endpoints

| Endpoint                       | Description                          |
| ------------------------------ | ------------------------------------ |
| `POST /api/register`           | Register a new user                  |
| `POST /api/login`              | User login                           |
| `POST /api/trains/search`      | Search for available trains          |
| `POST /api/bookings`           | Book train tickets                   |
| `POST /api/pnr/status`         | Check PNR status                     |
| `POST /api/scheduled-bookings` | Schedule a Tatkal or regular booking |
| `POST /api/ticket-transfers`   | Transfer or resell tickets           |
| ...more endpoints to come      |                                      |

---

## 👨‍💻 Tech Stack

* **Frontend:** React, Vite, Tailwind CSS, Wouter, React Query
* **Backend:** Node.js, Express, Drizzle ORM, PostgreSQL
* **AI Assistant:** Perplexity AI (optional integration)
* **Deployment:** Vercel (frontend), Render/Fly.io/Heroku/Railway (backend)

---

## 📄 License

MIT License – feel free to use, modify, and distribute.

---

## 🙏 Acknowledgements

* **Indian Railways** – for the inspiration behind the project
* **Perplexity AI** – for powering the smart assistant
* All open-source tools and contributors who made this possible.

---
# Rail-Yatri-Connect
