# Messaging App Backend

This is the backend service for the **Messaging App**, built with **Node.js**, **Express**, and **PostgreSQL**, with **Redis** for session management.  
The project also includes **Swagger UI** for interactive API documentation.

---

## 🚀 Features
- User authentication (Signup, Login, Logout)
- Session management with Redis
- RESTful API with Express
- Swagger API documentation

---

## 🛠️ Installation & Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/messaging-app-backend.git
   cd messaging-app-backend

### Explanation of API Doc
1. **New Section for API Documentation**:
   - Added a dedicated `## 📚 API Documentation` section to clearly highlight where users can access the Swagger UI.
   - Included the URL `http://localhost:5000/api-docs`, which matches the route defined in your `swagger.js` and `app.js` files (`app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec))`).
   - Removed the `#/` suffix from the provided URL (`http://localhost:5000/api-docs/#/`) as it’s not necessary for accessing the Swagger UI and might cause confusion. The `#/` is typically part of the Swagger UI’s internal routing and not needed in the base URL.

2. **User Guidance**:
   - Added a note to remind users to ensure the backend server is running to access the Swagger UI.
   - Used a markdown link `[http://localhost:5000/api-docs](http://localhost:5000/api-docs)` for better readability and clickability in rendered markdown.

3. **Placement**:
   - Placed the API documentation section after the **Installation & Setup** section, as users typically need to set up the project before accessing the documentation.

### Additional Suggestions
- **Production URL**: If you deploy the backend to a production server (e.g., Heroku, AWS, or Vercel), consider adding a note about the production Swagger URL or using an environment variable to dynamically set the URL in the `README.md`. For example:
  ```markdown
  - **Swagger Documentation**: [http://localhost:5000/api-docs](http://localhost:5000/api-docs) (Local) or visit the deployed API at `<your-production-url>/api-docs`.