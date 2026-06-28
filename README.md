# BLOXED - Backend (Node.js & Express)

This is the RESTful API backend for the **BLOXED** E-Commerce platform. It handles all the data processing, authentication, and database operations required by the frontend application.

## 🚀 Technologies Used
- **Node.js** & **Express.js** for the server framework
- **MongoDB** & **Mongoose** for the NoSQL database
- **JSON Web Tokens (JWT)** for secure authentication
- **Bcrypt.js** for password hashing
- **Nodemailer** for sending emails

## ✨ Key Features
- **User Authentication:** Registration, login, and profile management with secure JWT tokens.
- **Role-Based Access Control:** Protects admin routes (managing products, orders, categories, users).
- **Product & Category Management:** Full CRUD operations for the store catalog.
- **Order Processing:** Cart checkout, order tracking, and status updates.
- **Grouped Wishlists:** Endpoints to support saving products into custom folders.
- **Advanced Filtering & Pagination:** High-performance database queries.

## 🛠️ Installation & Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Environment Variables:**
   Create a `.env` file in the root of the backend folder and configure the following variables:
   ```env
   PORT=5000
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret_key
   ```

3. **Database Seeding (Optional):**
   To populate the database with initial products and categories, run:
   ```bash
   npm run seed
   ```

4. **Run the server:**
   - For development (with nodemon):
     ```bash
     npm run dev
     ```
   - For production:
     ```bash
     npm start
     ```
   The server will run on `http://localhost:5000`.

## 📁 Folder Structure
- `/models` - Mongoose schemas (User, Product, Order, Category).
- `/routes` - API endpoints grouped by feature.
- `/middleware` - Custom middleware (Auth verification, Admin check).
- `/public` - Static assets and uploaded images.

## 📜 License
This project is part of a graduation project.
