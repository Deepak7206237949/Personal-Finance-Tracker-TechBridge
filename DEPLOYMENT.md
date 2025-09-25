# 🚀 Personal Finance Tracker - Deployment Guide

## 📋 Pre-Deployment Checklist

### ✅ Requirements
- [x] Docker and Docker Compose installed
- [x] MongoDB Atlas database configured
- [x] Environment variables configured
- [x] Production secrets generated
- [x] Domain/hosting configured (optional)

### ✅ What's Ready for Deployment
- [x] **Database**: MongoDB Atlas with Prisma ORM
- [x] **Authentication**: JWT with refresh tokens, role-based access
- [x] **Backend API**: Express.js with comprehensive endpoints
- [x] **Frontend**: React with Vite, responsive design
- [x] **Docker**: Production-ready containers with health checks
- [x] **Security**: CORS, rate limiting, input validation
- [x] **Documentation**: OpenAPI/Swagger documentation

## 🔧 Environment Setup

### 1. Create Environment File
```bash
cp .env.example .env
```

### 2. Configure Environment Variables
Edit `.env` file with your production values:

```env
# Database Configuration
DATABASE_URL="mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority"

# JWT Secrets (GENERATE NEW ONES!)
JWT_ACCESS_SECRET=your_super_secret_jwt_access_key_change_in_production
JWT_REFRESH_SECRET=your_super_secret_jwt_refresh_key_change_in_production

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost

# API URL for frontend
VITE_API_URL=http://localhost:4000/api
```

### 3. Generate Strong JWT Secrets
```bash
# Generate random secrets
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

## 🚀 Deployment Options

### Option 1: Local Docker Deployment

#### Quick Deploy (Windows)
```powershell
.\deploy.ps1
```

#### Quick Deploy (Linux/Mac)
```bash
chmod +x deploy.sh
./deploy.sh
```

#### Manual Deploy
```bash
# Build and start production containers
docker-compose -f docker-compose.prod.yml up --build -d

# Check logs
docker-compose -f docker-compose.prod.yml logs -f
```

### Option 2: Cloud Deployment

#### For VPS/Cloud Server:
1. Clone repository to server
2. Configure environment variables
3. Run deployment script
4. Configure reverse proxy (nginx/Apache) if needed

#### For Container Platforms (AWS ECS, Google Cloud Run, etc.):
1. Build images: `docker-compose -f docker-compose.prod.yml build`
2. Push to container registry
3. Deploy using platform-specific tools

## 🔍 Health Checks

### Frontend Health Check
```bash
curl http://localhost/health
# Expected: "healthy"
```

### Backend Health Check
```bash
curl http://localhost:4000/health
# Expected: {"ok":true}
```

## 📱 Access Your Application

- **Frontend**: http://localhost
- **Backend API**: http://localhost:4000
- **API Documentation**: http://localhost:4000/api-docs

### Default Admin Credentials
- **Email**: admin@finance.com
- **Password**: SecureAdmin2024!

## 🔐 Security Considerations

### ✅ Implemented Security Features
- JWT authentication with refresh tokens
- Password hashing with bcrypt
- Rate limiting on API endpoints
- CORS configuration
- Input validation and sanitization
- SQL injection prevention (Prisma ORM)
- XSS protection headers
- Secure cookie settings

### 🚨 Production Security Checklist
- [ ] Change default admin password
- [ ] Generate strong JWT secrets
- [ ] Configure HTTPS/SSL certificates
- [ ] Set up firewall rules
- [ ] Enable database authentication
- [ ] Configure backup strategy
- [ ] Set up monitoring and logging
- [ ] Review and update CORS origins

## 📊 Monitoring

### Container Status
```bash
docker-compose -f docker-compose.prod.yml ps
```

### View Logs
```bash
# All services
docker-compose -f docker-compose.prod.yml logs -f

# Specific service
docker-compose -f docker-compose.prod.yml logs -f backend
docker-compose -f docker-compose.prod.yml logs -f frontend
```

### Resource Usage
```bash
docker stats
```

## 🔄 Updates and Maintenance

### Update Application
```bash
# Pull latest changes
git pull origin main

# Rebuild and restart
docker-compose -f docker-compose.prod.yml up --build -d
```

### Database Migrations
```bash
# If schema changes are needed
docker-compose -f docker-compose.prod.yml exec backend npx prisma db push
```

### Backup Database
Since we're using MongoDB Atlas, backups are handled automatically. For manual backups:
```bash
# Export data
docker-compose -f docker-compose.prod.yml exec backend node -e "
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
// Add backup logic here
"
```

## 🆘 Troubleshooting

### Common Issues

#### 1. Container Won't Start
```bash
# Check logs
docker-compose -f docker-compose.prod.yml logs backend
docker-compose -f docker-compose.prod.yml logs frontend
```

#### 2. Database Connection Issues
- Verify DATABASE_URL in .env
- Check MongoDB Atlas network access
- Ensure IP whitelist includes server IP

#### 3. Frontend Can't Connect to Backend
- Verify VITE_API_URL in .env
- Check if backend container is running
- Verify network connectivity

#### 4. Permission Issues
```bash
# Fix file permissions
sudo chown -R $USER:$USER .
chmod +x deploy.sh
```

### Reset Everything
```bash
# Stop and remove all containers, networks, and volumes
docker-compose -f docker-compose.prod.yml down -v
docker system prune -a -f

# Start fresh
docker-compose -f docker-compose.prod.yml up --build -d
```

## 📈 Performance Optimization

### Production Optimizations Included
- Gzip compression in nginx
- Static asset caching
- Optimized Docker images
- Health checks for container orchestration
- Connection pooling in Prisma
- Rate limiting to prevent abuse

### Additional Optimizations
- Set up CDN for static assets
- Configure database connection pooling
- Implement Redis for session storage (optional)
- Set up load balancing for high traffic

## 🎯 Next Steps After Deployment

1. **Change Default Credentials**: Update admin password
2. **Configure Domain**: Set up custom domain and SSL
3. **Set Up Monitoring**: Implement logging and monitoring
4. **Create Backups**: Set up automated backup strategy
5. **Performance Testing**: Test under expected load
6. **Security Audit**: Review security configurations
7. **User Training**: Provide user documentation

---

## 🎉 Congratulations!

Your Personal Finance Tracker is now ready for production use with:
- ✅ Complete user authentication and authorization
- ✅ Category management with budget tracking
- ✅ Transaction management and analytics
- ✅ Responsive web interface
- ✅ RESTful API with documentation
- ✅ Production-ready Docker deployment
- ✅ Security best practices implemented

Happy budgeting! 💰📊
