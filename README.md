# URL Shortener API | Cloud Infrastructure & DevOps Showcase

![Architecture: Cloud](https://img.shields.io/badge/Architecture-Cloud_Native-blue)
![CI/CD: GitHub Actions](https://img.shields.io/badge/CI%2FCD-GitHub_Actions-success)
![Hosting: AWS EC2](https://img.shields.io/badge/Hosting-AWS_EC2-orange)

A high-performance, containerized REST API deployed on AWS. While the application layer provides reliable URL shortening and redirection, the primary focus of this project is to demonstrate **production-grade infrastructure engineering, server management, and automated deployment pipelines.**

## 🏗 Architecture & Tech Stack

### Application Layer
* **Runtime:** Node.js (v18 Alpine)
* **Framework:** Express.js
* **Database:** MongoDB Atlas (Mongoose ODM)
* **Process Manager:** PM2 (Cluster Mode)

### Infrastructure & DevOps
* **Containerization:** Docker & Docker Compose
* **Cloud Provider:** AWS EC2 (Amazon Linux)
* **Reverse Proxy:** NGINX
* **Security:** HTTPS via Let's Encrypt (Certbot)
* **CI/CD Pipeline:** GitHub Actions

---

## 🚀 Infrastructure Highlights

This repository serves as a practical demonstration of modern deployment workflows and server architecture:

### 1. Optimized Containerization
The Node.js application is packaged in a lightweight Alpine Linux Docker image. To overcome Node's default single-threaded limitation, **PM2** is utilized inside the container (`pm2-runtime`). It is configured to run in *Cluster Mode*, automatically scaling the application to utilize all available CPU cores on the host EC2 instance.

### 2. Reverse Proxy & Secure Routing
Traffic is managed by an **NGINX** reverse proxy installed directly on the AWS EC2 host. NGINX intercepts public web traffic on Port 80/443 and securely proxies it to the isolated Docker container running on internal Port 5000. SSL certificates are dynamically provisioned and managed via **Certbot**.

### 3. Zero-Touch CI/CD Pipeline
Deployments are fully automated using **GitHub Actions**. Upon any push to the `main` branch, the workflow:
1. Securely SSHs into the AWS EC2 instance using stored GitHub Secrets.
2. Pulls the latest repository updates.
3. Rebuilds the Docker image and restarts the container system via Docker Compose with zero downtime.
4. Prunes dangling images to maintain server storage efficiency.

---

## 🔌 API Endpoints

### 1. Create Short Link
**POST** `/shorten`
* **Body:**
  ```json
  {
    "longUrl": "[https://github.com/your-username](https://github.com/your-username)"
  }
* **Response:**
  Returns the generated urlCode and databaseID

**GET** `/:code`
* **Description:**
  Looks up the urlCode, increments the click counter, and issues a 302 Redirect to the original longUrl.
