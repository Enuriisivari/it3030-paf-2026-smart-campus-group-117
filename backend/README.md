# Smart Campus API - Backend

A comprehensive Spring Boot REST API for the Smart Campus system, enabling resource booking, maintenance ticket management, and real-time notifications for campus facilities.

## 🚀 Project Overview

The Smart Campus API provides backend services for:
- **Resource Management**: Schedule and manage campus facilities and equipment
- **Booking Management**: Reserve resources with conflict detection and QR code verification
- **Maintenance Tickets**: Create and track facility maintenance requests
- **User Authentication**: OAuth2-based authentication with JWT tokens
- **Real-time Notifications**: Event-driven notifications for booking and maintenance updates

## 📋 Prerequisites

- **Java 17+** (JDK)
- **MongoDB** (local or remote instance)
- **Maven 3.6+**
- **Git**

### MongoDB Setup

Ensure MongoDB is running on `localhost:27017` or configure connection in `application.properties`:

```bash
# Windows
mongod

# Linux/Mac
brew services start mongodb-community
```

## 🛠 Installation & Setup

### 1. Clone the Repository
```bash
cd backend/smart-campus-api
```

### 2. Configure Environment Variables
Create `.env` file in the project root:
```properties
MONGODB_URI=mongodb://localhost:27017/smart_campus
JWT_SECRET=your-secret-key-here
OAUTH2_CLIENT_ID=your-oauth-client-id
OAUTH2_CLIENT_SECRET=your-oauth-client-secret
```

Or update `src/main/resources/application.properties` directly.

### 3. Install Dependencies
```bash
mvn clean install
```

## 🏃 Running the Application

### Option 1: Using Maven Wrapper (Recommended)
```bash
# Windows
.\mvnw.cmd spring-boot:run

# Linux/Mac
./mvnw spring-boot:run
```

### Option 2: Using System Maven
```bash
mvn spring-boot:run
```

### Option 3: Build and Run JAR
```bash
mvn clean package -DskipTests
java -jar target/smart-campus-api-0.0.1-SNAPSHOT.jar
```

The API will start on **http://localhost:8080**

## 📁 Project Structure

```
smart-campus-api/
├── src/main/java/com/sliit/smartcampus/
│   ├── SmartCampusApiApplication.java     # Main application class
│   ├── authnotifications/                 # Authentication & Notifications module
│   │   ├── NotificationService.java
│   │   └── AuthController.java
│   ├── bookingmanagement/                 # Booking module
│   │   ├── BookingService.java
│   │   ├── BookingController.java
│   │   ├── QrService.java                 # QR code generation & verification
│   │   └── dto/                           # Data Transfer Objects
│   ├── facilitiesassets/                  # Facilities & Assets module
│   ├── maintenancetickets/                # Maintenance Tickets module
│   │   ├── TicketService.java
│   │   └── TicketController.java
│   ├── domain/
│   │   ├── entity/                        # MongoDB Documents
│   │   │   ├── Booking.java
│   │   │   ├── Resource.java
│   │   │   ├── User.java
│   │   │   ├── Ticket.java
│   │   │   ├── Notification.java
│   │   │   └── Comment.java
│   │   └── enums/                         # Enumerations
│   │       ├── BookingStatus.java
│   │       ├── ResourceType.java
│   │       ├── TicketStatus.java
│   │       └── UserRole.java
│   ├── repository/                        # MongoDB Repositories
│   │   └── *Repository.java
│   ├── security/                          # Security Configuration
│   │   ├── JwtAuthenticationFilter.java
│   │   ├── SecurityConfig.java
│   │   └── CustomUserDetails.java
│   └── config/                            # Application Configuration
└── src/main/resources/
    ├── application.properties              # Main configuration
    ├── application-dev.properties          # Development configuration
    └── application-test.properties         # Test configuration
```

## 🔧 Core Modules

### Booking Management
Handles resource booking with features:
- Create, approve, and reject bookings
- Conflict detection and time slot validation
- QR code generation for verified entry
- Automatic notification on booking status changes

**Key Classes**:
- `BookingService` - Business logic
- `BookingController` - REST endpoints
- `QrService` - QR code handling

### Resource Management
Manages campus facilities and equipment:
- Create, update, and track resources
- Monitor resource availability and status
- Schedule maintenance windows

**Key Classes**:
- `ResourceService` - Resource operations
- `Resource` - Entity model

### Maintenance Tickets
Tracking system for facility maintenance:
- Create and update tickets
- Assign priorities and track progress
- Add comments and attachments

**Key Classes**:
- `TicketService` - Ticket operations
- `Ticket` - Entity model

### Authentication & Authorization
Secure API access with:
- OAuth2 client authentication
- JWT token-based session management
- Role-based access control (Admin, User, Staff)

## 🔐 Security Configuration

- **Authentication**: OAuth2 with JWT tokens
- **Authorization**: Role-based access (USER, ADMIN, STAFF)
- **Password Encoding**: BCrypt
- **CORS**: Configured for frontend integration

## 📊 Database Schema

MongoDB Collections:
- `users` - Campus users with OAuth IDs
- `resources` - Facilities and equipment
- `bookings` - Resource reservations
- `tickets` - Maintenance requests
- `notifications` - User notifications
- `comments` - Ticket comments

## 🧪 Testing

### Run Tests
```bash
mvn test
```

### Run with Coverage
```bash
mvn clean test jacoco:report
```

Test configuration: `src/test/resources/application-test.properties`

## 📝 API Documentation

### Key Endpoints

#### Authentication
```
POST   /api/auth/login          # User login
POST   /api/auth/logout         # User logout
GET    /api/auth/profile        # Get current user
```

#### Bookings
```
POST   /api/bookings            # Create booking
GET    /api/bookings            # Get all bookings
GET    /api/bookings/:id        # Get booking by ID
PUT    /api/bookings/:id        # Update booking
DELETE /api/bookings/:id        # Cancel booking
POST   /api/bookings/:id/approve # Approve booking (Admin)
POST   /api/bookings/:id/reject  # Reject booking (Admin)
GET    /api/bookings/:id/qr     # Get QR code
POST   /api/bookings/verify-qr  # Verify QR code
```

#### Resources
```
GET    /api/resources           # Get all resources
POST   /api/resources           # Create resource (Admin)
GET    /api/resources/:id       # Get resource by ID
PUT    /api/resources/:id       # Update resource (Admin)
DELETE /api/resources/:id       # Delete resource (Admin)
GET    /api/resources/:id/busy-slots  # Get busy time slots
```

#### Maintenance Tickets
```
GET    /api/tickets             # Get all tickets
POST   /api/tickets             # Create ticket
GET    /api/tickets/:id         # Get ticket by ID
PUT    /api/tickets/:id         # Update ticket
DELETE /api/tickets/:id         # Delete ticket
POST   /api/tickets/:id/comments # Add comment
```

#### Notifications
```
GET    /api/notifications       # Get user notifications
POST   /api/notifications/:id/mark-read # Mark as read
```

## 🔄 CI/CD Pipeline

The project uses Maven for:
- **Compilation**: `mvn compile`
- **Testing**: `mvn test`
- **Building**: `mvn package`
- **Running**: `mvn spring-boot:run`

## 🐛 Troubleshooting

### Port 8080 Already in Use
```bash
# Windows
netstat -ano | findstr :8080
taskkill /PID <PID> /F

# Linux/Mac
lsof -i :8080
kill -9 <PID>
```

### MongoDB Connection Issues
```bash
# Check MongoDB is running
mongosh

# Verify connection string in application.properties
spring.data.mongodb.uri=mongodb://localhost:27017/smart_campus
```

### Build Failures
```bash
# Clean and rebuild
mvn clean install -U

# With debug output
mvn -X clean install
```

## 📦 Dependencies

- **Spring Boot 4.0.3** - Framework
- **Spring Data MongoDB** - Database layer
- **Spring Security + OAuth2** - Authentication
- **JWT (JJWT)** - Token management
- **Lombok** - Boilerplate reduction
- **ZXing** - QR code generation
- **Tomcat 11.0.18** - Web server

See `pom.xml` for complete dependency list.

## 🚀 Deployment

### Docker Build
```bash
mvn clean package
docker build -t smart-campus-api .
docker run -p 8080:8080 smart-campus-api
```

### Production Configuration
Update `application.properties` with production values:
- `spring.data.mongodb.uri` - Production MongoDB
- `server.port` - Deployment port
- `logging.level.root` - Log level

## 📞 Support

For issues or questions:
1. Check the troubleshooting section
2. Review application logs in `backend.log`
3. Check MongoDB connectivity
4. Verify Java version: `java -version`

## 📄 License

This project is part of the Smart Campus system developed by Group 117.

---

**Last Updated**: April 24, 2026
