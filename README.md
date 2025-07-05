# IRCTC Booking Platform

A comprehensive railway booking platform built with React, TypeScript, Express.js, and MongoDB.

## Features

- **Train Search & Booking**: Search trains by source, destination, and date
- **PNR Status**: Check booking status using PNR number
- **Live Train Tracking**: Real-time train location and status updates
- **Tatkal Booking**: Quick booking for urgent travel needs
- **Scheduled Booking**: Automate bookings for future dates
- **Ticket Transfer**: Transfer tickets to other users
- **Payment Integration**: Stripe payment processing
- **AI Chatbot**: Intelligent assistance using Perplexity AI
- **Responsive Design**: Mobile-first approach with Tailwind CSS

## Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS, Shadcn/ui
- **Backend**: Node.js, Express.js, TypeScript
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: Passport.js with session management
- **Payment**: Stripe integration
- **AI**: Perplexity AI for chatbot functionality
- **Build Tools**: Vite, esbuild

## Prerequisites

- Node.js 18+ 
- MongoDB (local or cloud)
- npm or yarn

## Installation

1. **Clone the repository**
```bash
   git clone https://github.com/vinayj16/Rail-Yatri-Connect.git
   cd Rail-Yatri-Connect
```

2. **Install dependencies**
```bash
npm install
   ```

3. **Set up environment variables**
   
   **Option 1: Using PowerShell script (Recommended)**
   ```powershell
   .\setup-env.ps1
   ```
   
   **Option 2: Manual setup**
   Create a `.env` file in the root directory:
   ```env
   MONGODB_URI=mongodb://localhost:27017/irctc_booking
   SESSION_SECRET=dev-secret-key-123-change-in-production
   PERPLEXITY_API_KEY=your-perplexity-api-key-here
   NODE_ENV=development
   ```

4. **Start MongoDB**
   Make sure MongoDB is running locally or use a cloud service like MongoDB Atlas.

5. **Run the development server**

   **Option 1: Using PowerShell script (Recommended)**
   ```powershell
   .\start-dev.ps1
   ```

   **Option 2: Manual start**
```bash
   $env:MONGODB_URI="mongodb://localhost:27017/irctc_booking"; $env:SESSION_SECRET="dev-secret-key-123"; npm run dev
```

   The server will start on **http://localhost:3001**

6. **Build for production**
```bash
npm run build
   npm start
   ```

## Database Setup

The application uses MongoDB with the following collections:
- `users` - User accounts and authentication
- `stations` - Railway stations
- `trains` - Train information
- `trainstops` - Intermediate stops for trains
- `trainclasses` - Available classes and pricing
- `bookings` - User bookings
- `passengers` - Passenger details
- `trainlocations` - Live train tracking data
- `paymentreminders` - Payment reminder system
- `scheduledbookings` - Automated booking system
- `tickettransfers` - Ticket transfer functionality
- `sessions` - User session management

## API Endpoints

### Authentication
- `POST /api/register` - User registration
- `POST /api/login` - User login
- `POST /api/logout` - User logout
- `GET /api/user` - Get current user

### Trains
- `GET /api/stations` - Get all stations
- `POST /api/trains/search` - Search trains
- `GET /api/trains/:id` - Get train details
- `GET /api/trains/:id/location` - Get train location

### Bookings
- `POST /api/bookings` - Create booking
- `GET /api/bookings` - Get user bookings
- `POST /api/bookings/tatkal` - Tatkal booking
- `POST /api/scheduled-bookings` - Schedule booking

### PNR & Status
- `POST /api/pnr/status` - Check PNR status

### AI Chatbot
- `POST /api/chatbot` - Get AI response
- `GET /api/ai-status` - Check AI service status

## Deployment on Render

### Step-by-Step Deployment Guide

1. **Fork/Clone the Repository**
   - Fork this repository to your GitHub account
   - Or clone it to your local machine

2. **Create a MongoDB Database**
   - Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
   - Create a free account and cluster
   - Get your connection string (it looks like: `mongodb+srv://username:password@cluster.mongodb.net/database`)

3. **Deploy on Render**
   - Go to [Render Dashboard](https://dashboard.render.com)
   - Click "New" → "Web Service"
   - Connect your GitHub repository
   - Configure the service:
     - **Name**: `irctc-booking-platform` (or any name you prefer)
     - **Environment**: `Node`
     - **Build Command**: `npm install && npm run build`
     - **Start Command**: `npm start`
     - **Root Directory**: (leave empty)

4. **Set Environment Variables**
   In your Render service dashboard, go to "Environment" tab and add:
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/irctc_booking
   NODE_ENV=production
   SESSION_SECRET=your-random-secret-key-here
   PERPLEXITY_API_KEY=your-perplexity-api-key-here
   ```

5. **Deploy**
   - Click "Create Web Service"
   - Render will automatically build and deploy your application
   - Your app will be available at: `https://your-app-name.onrender.com`

### Environment Variables for Render

Set these environment variables in your Render dashboard:

```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/irctc_booking
NODE_ENV=production
SESSION_SECRET=your-random-session-secret
PERPLEXITY_API_KEY=your-perplexity-api-key
```

### Build Configuration

- **Build Command**: `npm install && npm run build`
- **Start Command**: `npm start`
- **Root Directory**: (leave empty)

### Database Setup

1. **MongoDB Atlas** (Recommended):
   - Create a free cluster at [MongoDB Atlas](https://www.mongodb.com/atlas)
   - Get your connection string
   - Set `MONGODB_URI` environment variable

2. **Render MongoDB** (Alternative):
   - Create a MongoDB service in Render
   - Use the provided connection string

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For support, email support@railyatriconnect.com or create an issue in the repository.
