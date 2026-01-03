HotelFlow is a robust, full-stack web application designed to streamline hotel operations. It allows administrators to manage room inventories and users to browse and book accommodations seamlessly.
----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
Frontend (Client Side)
Next.js: A powerful React framework used for building a fast, SEO-friendly, and responsive user interface.

Key Features: Server-Side Rendering (SSR), optimized image loading, and dynamic routing for room details.

Backend (Server Side)
Node.js & Express.js: The core engine handling the application logic and RESTful API development.

Key Features: Efficient request handling, custom middleware for data validation, and secure API endpoints.

Database (Data Storage)
MongoDB & Mongoose: A NoSQL database used to store flexible data like room types, pricing, and availability.

Key Features: Schema-based validation using Mongoose and high-speed data retrieval.

feature:
----------------------------------
1.১. User (Guest) Side Features:
Room Browsing & Filtering: 
Detailed Room View
Booking System
Booking History
Review & Rating

2.Admin Dashboard Features
1.Statistic Overview (Charts)
2.Room Management (CRUD)
3.Booking Management
4.User/Guest Management
5.Search Functionality




how to run this project 
-----------------------------

1. Backend (Node.js/Express)
Open your terminal in the server folder.

Install dependencies: npm install

Set your MONGO_URI in the .env file.

Start the server: npm run dev (or node server.js).

Running on: http://localhost:5000

2. Frontend (Next.js)
Open a new terminal in the client folder.

Install dependencies: npm install

Start the development server: npm run dev

Running on: http://localhost:3000
