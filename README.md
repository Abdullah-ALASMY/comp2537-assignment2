COMP 2537 - Assignment 1
Student: Abdullah Al Asmy

Description:
This is a basic Node.js web app with user login and signup. 
It uses MongoDB to store users and sessions.
Only logged-in users can access the members page, which shows a random image.

Technologies Used:
- Node.js
- Express
- MongoDB Atlas
- bcrypt
- Joi
- express-session
- connect-mongo
- dotenv

To Run the Project:
1. Run 'npm install'
2. Create a .env file with the required keys (MONGO_URL, secrets, etc.)
3. Run 'node server.js'
4. Open http://localhost:3000 in your browser

Note:
- All secrets are kept in the .env file and not uploaded to GitHub.
- Sessions expire after 1 hour and are stored in MongoDB.

Thank you.
