# Deployment Guide - IRCTC Booking Platform

## Quick Deploy to Render

### Prerequisites
- GitHub account
- MongoDB Atlas account (free)
- Render account (free)

### Step 1: Set up MongoDB Atlas

1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a free account
3. Create a new cluster (free tier)
4. Create a database user with password
5. Get your connection string:
   - Click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your actual password
   - Replace `<dbname>` with `irctc_booking`

Example connection string:
```
mongodb+srv://username:yourpassword@cluster.mongodb.net/irctc_booking
```

### Step 2: Deploy to Render

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click "New" → "Web Service"
3. Connect your GitHub repository
4. Configure the service:
   - **Name**: `irctc-booking-platform`
   - **Environment**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Root Directory**: (leave empty)

### Step 3: Set Environment Variables

In your Render service dashboard:
1. Go to "Environment" tab
2. Add these variables:

```
MONGODB_URI=mongodb+srv://username:yourpassword@cluster.mongodb.net/irctc_booking
NODE_ENV=production
SESSION_SECRET=your-random-secret-key-here-make-it-long-and-random
PERPLEXITY_API_KEY=your-perplexity-api-key-here
```

### Step 4: Deploy

1. Click "Create Web Service"
2. Wait for the build to complete
3. Your app will be available at: `https://your-app-name.onrender.com`

## Environment Variables Explained

| Variable | Description | Required | Example |
|----------|-------------|----------|---------|
| `MONGODB_URI` | MongoDB connection string | ✅ Yes | `mongodb+srv://user:pass@cluster.mongodb.net/irctc_booking` |
| `NODE_ENV` | Environment mode | ✅ Yes | `production` |
| `SESSION_SECRET` | Secret for session encryption | ✅ Yes | `my-super-secret-key-123` |
| `PERPLEXITY_API_KEY` | AI chatbot API key | ❌ Optional | `pplx-...` |

## Troubleshooting

### Common Issues

1. **"MONGODB_URI environment variable is not set"**
   - Make sure you've added the environment variable in Render
   - Check that the connection string is correct
   - Ensure MongoDB Atlas IP whitelist includes `0.0.0.0/0`

2. **Build fails**
   - Check that all dependencies are in package.json
   - Ensure Node.js version is compatible (18+)

3. **App crashes on start**
   - Check Render logs for specific error messages
   - Verify all environment variables are set correctly

### Getting Help

- Check Render logs in your dashboard
- Verify MongoDB Atlas connection
- Test locally first with `npm run dev`

## Local Development

To run locally:

```bash
# Set environment variables
$env:MONGODB_URI="mongodb://localhost:27017/irctc_booking"
$env:SESSION_SECRET="dev-secret-key-123"

# Start the server
npm run dev
```

Or use the provided script:
```bash
.\start-dev.ps1
```

## Support

For issues:
1. Check the logs in Render dashboard
2. Verify environment variables
3. Test locally first
4. Create an issue in the repository 