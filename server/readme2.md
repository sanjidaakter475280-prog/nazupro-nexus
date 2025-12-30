Deploying Nazupro Nexus to Render 🚀
Everything is correctly set up for deployment. Since you have a 
Dockerfile
, Render will automatically detect it and use it to build your application.

1. Prerequisites
MongoDB Atlas: You need a connection string (e.g., mongodb+srv://...).
Google Gemini API Key: Needed for the AI features.
2. Environment Variables (Set these on Render)
In your Render Dashboard, go to Environment and add:

Key	Value	Note
MONGODB_URI	your_mongodb_atlas_url	Required for the database
GEMINI_API_KEY	your_google_ai_key	Needed for market insights
NODE_ENV	production	(Automatically set by Docker)
PORT	5000	(Internal port matches Dockerfile)
3. Deployment Steps
Push to GitHub: Make sure all changes are committed and pushed to your GitHub repository.
Create Web Service:
Go to Dashboard.
Click New -> Web Service.
Connect your GitHub repository.
Render should automatically detect the 
Dockerfile
.
Configure:
Runtime: Docker
Environment Variables: Add the keys from step 2.
Deploy: Click Create Web Service.
4. Connecting the Python Bot
Once the Render service is live, you will get a URL like https://nazupro-nexus.onrender.com.

Update your Python bot's 
.env
 file:

CLOUD_SYNC_ENABLED=true
CLOUD_SYNC_URL=https://nazupro-nexus.onrender.com
TIP

Build Speed: Render's free tier is a bit slow for Docker builds. If the build times out, you might need to upgrade to a starter plan or use Render's "Static Site" + "Web Service" separately (but the current monorepo Docker setup is simpler to manage).
