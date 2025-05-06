COMP 2537 - Assignment 1
Student: Abdullah Al Asmy
=================================================
=================================================

Self-graded Assignment 1 Checklist

    Criteria	
    ========
[x]  A home page links to signup and login, if not logged in; and links to members and signout, if logged in.

[x]  A members page that displays 1 of 3 random images stored on the server.

[x]  The members page will redirect to the home page if no valid session is found.

[x]  The signout buttons end the session.

[x]  All secrets, encryption keys, database passwords are stored in a .env file.

[x]  The .env file is NOT in your git repo.

[x]  Password is BCrypted in the MongoDB database.

[x]  Your site is hosted in a hosting service like Qoddi.

[x]  A 404 page that "catches" all invalid page hits and that sets the status code to 404.

[x]  Session information is stored in an encrypted MongoDB session database. Sessions expire after 1 hour.

 
50/50 (Total grade out of 50, 5 marks each x 10 items)


*Note items are considered *fully* complete (marked with an x inside the box: [x]), OR incomplete (box is left empty: [ ])


=================================================
=================================================


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
