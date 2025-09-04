# Deployment Instructions

This document provides instructions for deploying the backend server and the WeChat Mini Program.

---

## Part 1: Manual Backend Server Deployment

This method is suitable if you prefer to manage Node.js and the application process manually.

### Prerequisites

*   A server (e.g., a Linux VPS from any cloud provider).
*   `Node.js` (version 14.x or higher) and `npm` installed on the server.
*   A tool to copy files to your server (like `scp` or an FTP client).
*   A process manager like `pm2` is highly recommended to keep the server running continuously. You can install it globally with `npm install -g pm2`.

### Steps

1.  **Copy Project Files**:
    *   Transfer all project files (e.g., `server.js`, `package.json`, `db.json`, `public/`, etc.) except for the `node_modules` directory to a new directory on your server (e.g., `/home/user/gz-metro-backend`).

2.  **Install Dependencies**:
    *   Navigate to your project directory on the server via SSH:
        ```bash
        cd /home/user/gz-metro-backend
        ```
    *   Install the production dependencies:
        ```bash
        npm install
        ```

3.  **Start the Server**:
    *   **For simple testing**:
        ```bash
        npm start
        ```
        The server will stop if you close your SSH session.
    *   **For production (recommended)**: Use `pm2` to start and manage the process.
        ```bash
        pm2 start npm --name "metro-backend" -- start
        ```
        This will start the server in the background and automatically restart it if it crashes.

4.  **Firewall Configuration**:
    *   Ensure your server's firewall allows incoming traffic on the port your application is running on (port `3000` by default).

## Part 2: WeChat Mini Program Publication

### Prerequisites

*   You have a registered WeChat Mini Program account.
*   You have installed the [WeChat Developer Tools](https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html).

### Steps

1.  **Update API Endpoint**:
    *   Open the project in your local code editor.
    *   Navigate to and open the `pages/index/index.js` file.
    *   Find the line `const API_URL = 'http://localhost:3000/api/lines';`.
    *   Change the URL from `http://localhost:3000` to your server's public IP address or domain name. **If you have an SSL certificate (which is required by WeChat), use `https://`**.
        ```javascript
        // Example:
        const API_URL = 'https://www.your-domain.com/api/lines';
        ```

2.  **Configure Server Domain in WeChat Platform**:
    *   Log in to the [WeChat MP Admin Platform](https://mp.weixin.qq.com/).
    *   Go to "开发" (Development) -> "开发管理" (Development Management) -> "开发设置" (Development Settings).
    *   Find the "服务器域名" (Server Domain) section.
    *   Add your server's domain (e.g., `https://www.your-domain.com`) to the `request合法域名` (request-valid domains) list. This step is mandatory; otherwise, the Mini Program will not be allowed to communicate with your backend.

3.  **Upload and Publish**:
    *   Open the project folder in the WeChat Developer Tools.
    *   Click the "上传" (Upload) button in the top right corner. Fill in a version number and description.
    *   After the upload is successful, go back to the WeChat MP Admin Platform.
    *   Navigate to "管理" (Management) -> "版本管理" (Version Management). You should see the version you just uploaded.
    *   You can submit this version for review. After WeChat's review passes, you can publish it to make it available to all users.

---

## Part 3: Docker Deployment (Recommended)

This is the recommended method as it simplifies dependency management and ensures a consistent environment.

### Prerequisites

*   A server with `Docker` and `Docker Compose` installed.
*   A tool to copy files to your server (like `scp` or an FTP client).

### Steps

1.  **Copy Project Files**:
    *   Transfer all project files, including the `Dockerfile` and `docker-compose.yml`, to a new directory on your server (e.g., `/home/user/gz-metro-backend`).

2.  **Build and Run the Container**:
    *   Navigate to your project directory on the server via SSH:
        ```bash
        cd /home/user/gz-metro-backend
        ```
    *   Run the following command to build the Docker image and start the container in the background:
        ```bash
        docker-compose up -d
        ```
    *   Docker will now handle everything: it will build the image, install dependencies, and run the server. The `restart: unless-stopped` policy in `docker-compose.yml` ensures it runs automatically after a server reboot.

3.  **Firewall and Data**:
    *   Ensure your server's firewall allows traffic on port `3000`.
    *   The `docker-compose.yml` file is configured to use a named volume (`metro-data`) to persist the `db.json` file. This means your data is safe even if you remove and recreate the container.

4.  **Mini Program Configuration**:
    *   Follow the same steps as in "Part 2: WeChat Mini Program Publication" to update the API endpoint to your server's IP/domain and configure the legal domain in the WeChat platform. The endpoint is the same regardless of whether you use Docker or manual deployment.
