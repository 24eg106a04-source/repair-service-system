# Repair Service Management System (Java Full Stack)

A complete, enterprise-grade **Java Full Stack Application** built with **Spring Boot 3 (Java 21)**, **Spring Data JPA**, **H2 In-Memory Database / MySQL**, and a modern **Bootstrap 5 Responsive Web Frontend**.

This system implements the exact architecture and workflow requested:
- **Frontend (Web Interface)**: HTML5, CSS3, JavaScript (Fetch API), Bootstrap 5.3, Bootstrap Icons.
- **Backend (Spring Boot REST API)**: Enterprise multi-layered architecture (`controller`, `service`, `repository`, `entity`, `dto`, `config`).
- **Database**: H2 In-Memory Database (zero configuration needed, runs immediately) with ready-to-use MySQL configuration.
- **Live Tracking System**: Instant repair stage tracking with interactive progress bars (`PENDING` -> `ASSIGNED` -> `IN_PROGRESS` -> `COMPLETED`).

---

## 🌟 Architecture Diagram & Mapping

```
+----------------------------------------------------------------------------------+
|                            FRONTEND (WEB INTERFACE)                              |
|                   HTML5, Modern CSS, JavaScript ES6, Bootstrap 5                 |
|  - Customer Portal (Submit requests, live track ticket, view history)            |
|  - Technician Workbench (View assigned jobs, update diagnostic notes, set costs) |
|  - Admin Command Center (Manage requests, assign staff, view financial stats)    |
+----------------------------------------------------------------------------------+
                                        ▲ │
                          HTTP Requests │ │ JSON Responses
                                        │ ▼
+----------------------------------------------------------------------------------+
|                            BACKEND (SPRING BOOT 3)                               |
|  - Controllers: RESTful APIs (/api/repairs, /api/technicians, /api/dashboard)   |
|  - Business Logic Services: Validation, ticket numbering, assignment, billing   |
|  - Data Access: Spring Data JPA (Hibernate Dialects)                             |
+----------------------------------------------------------------------------------+
                                        ▲ │
                            SQL Queries │ │ Entities & Results
                                        │ ▼
+----------------------------------------------------------------------------------+
|                                    DATABASE                                      |
|  - H2 In-Memory Database (Default for instant zero-configuration execution)       |
|  - MySQL Database (Switchable via application.properties)                        |
|  - Tables: users, technicians, repair_requests                                   |
+----------------------------------------------------------------------------------+
```

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- **Java**: JDK 21+ installed
- **Maven**: 3.8+ installed (or bundled Maven)

### 2. Run the Application
Open a terminal in this directory (`C:\Users\Jeevanreddy\.gemini\antigravity\scratch\repair-service-system`) and execute:

```powershell
mvn spring-boot:run
```

Once the application starts:
- **Web Application**: Open [http://localhost:8080/](http://localhost:8080/)
- **H2 Database Console**: Open [http://localhost:8080/h2-console](http://localhost:8080/h2-console)
  - JDBC URL: `jdbc:h2:mem:repairdb`
  - Username: `sa`
  - Password: *(leave blank)*

---

## 💻 Pre-seeded Demo Data

Upon launching, the system automatically populates realistic test data:

### Pre-configured Technicians:
1. **Alex Rivera** - Specialization: *Laptops & Motherboard Soldering*
2. **Sophia Chen** - Specialization: *Smartphones & Display Diagnostics*
3. **Marcus Vance** - Specialization: *Tablets & Battery Systems*
4. **Elena Gomez** - Specialization: *Audio, Smart TVs & Power Modules*

### Pre-loaded Repair Tickets:
- **`REP-2026-1011`**: Apple MacBook Pro 16" (Status: `IN_PROGRESS`)
- **`REP-2026-1012`**: Samsung Galaxy S24 Ultra (Status: `ASSIGNED`)
- **`REP-2026-1010`**: Dell XPS 15 9520 (Status: `COMPLETED`, Billed: \$145.00)
- **`REP-2026-1013`**: iPad Air 5th Gen (Status: `PENDING`)

---

## 📡 REST API Reference

### 1. Repair Requests (`/api/repairs`)
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/repairs` | Submit a new repair request (Generates tracking code) |
| `GET` | `/api/repairs` | List all tickets (Supports `?status=IN_PROGRESS` or `?email=user@test.com`) |
| `GET` | `/api/repairs/{id}` | Get ticket by database ID |
| `GET` | `/api/repairs/track/{trackingNumber}` | Track ticket status by unique code |
| `GET` | `/api/repairs/technician/{techId}` | Get jobs assigned to a technician |
| `PUT` | `/api/repairs/{id}/assign` | Assign technician and set estimated cost |
| `PUT` | `/api/repairs/{id}/status` | Update progress, diagnostic notes & final billed cost |
| `DELETE` | `/api/repairs/{id}` | Delete repair ticket |

### 2. Technicians (`/api/technicians`)
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/technicians` | Get all technicians with active job counts |
| `POST` | `/api/technicians` | Register a new technician |
| `PUT` | `/api/technicians/{id}` | Update technician info / availability |
| `DELETE` | `/api/technicians/{id}` | Remove a technician |

### 3. Dashboard Analytics (`/api/dashboard`)
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/dashboard/stats` | Returns total requests, status breakdown, total revenue |

---

## 🗄️ Switching to MySQL

To switch from H2 to MySQL:
1. Open [`src/main/resources/application.properties`](file:///C:/Users/Jeevanreddy/.gemini/antigravity/scratch/repair-service-system/src/main/resources/application.properties).
2. Uncomment the MySQL block:
```properties
spring.datasource.url=jdbc:mysql://localhost:3306/repair_service_db?createDatabaseIfNotExist=true&useSSL=false&serverTimezone=UTC
spring.datasource.username=root
spring.datasource.password=your_password
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver
spring.jpa.database-platform=org.hibernate.dialect.MySQLDialect
spring.jpa.hibernate.ddl-auto=update
```
3. In [`pom.xml`](file:///C:/Users/Jeevanreddy/.gemini/antigravity/scratch/repair-service-system/pom.xml), uncomment the `mysql-connector-j` dependency.
