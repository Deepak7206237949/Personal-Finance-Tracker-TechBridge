# 💰 Personal Finance Tracker – TechBridge  

## Live URL for Website -- https://personal-finance-tracker-techbridge.netlify.app/

A **full-stack web application** to take control of your money 💵.  
Track your **income & expenses**, get **visual analytics**, and manage your financial journey — all in one place!  

---

## 🚀 Features  

### 🔐 Authentication  
- JWT-based secure login & registration  
- Refresh tokens for smooth sessions  
- Role-based access (Admin 👑, User 🙋, Read-only 👀)
- 
- <img width="1264" height="952" alt="image" src="https://github.com/user-attachments/assets/15a7d2eb-84c4-4a66-a5af-443da6239692" />
 

### 💸 Transaction Management  
- Add, edit, delete, categorize income & expenses  
- Categories: Food 🍔, Transport 🚗, Entertainment 🎬, etc.  
- Search & filter your history

- <img width="1914" height="880" alt="image" src="https://github.com/user-attachments/assets/5aa4e9c4-b399-420a-a83e-4de21d79b7e5" />


### 📊 Analytics Dashboard  
- Monthly/yearly spending overview  
- Category-wise expense breakdown (Pie 🍕)  
- Income vs Expense trends (Bar 📊 & Line 📈)  
- Beautiful & interactive charts

-<img width="1920" height="1016" alt="image" src="https://github.com/user-attachments/assets/bb894692-6f0f-41c8-bbcd-f697f45e2c87" />



### ⚙️ Technical Goodies  
- RESTful API (Swagger/OpenAPI docs)  
- Redis caching ⚡  
- Rate limiting 🚦  
- Secure input validation & error handling  
- Responsive mobile-first design 📱

- <img width="1834" height="992" alt="image" src="https://github.com/user-attachments/assets/928a3cd4-9315-4801-9d5f-31456135385a" />


---

## 🏗️ Architecture  

### 🔧 Backend (Node.js + Express)  
- **Database**: MySQL + Prisma ORM  

<img width="1814" height="947" alt="image" src="https://github.com/user-attachments/assets/e78240ab-c50c-4621-9905-1fe437e11144" />


- **Auth**: JWT + refresh token rotation  
- **Cache**: Redis  
- **Validation**: Express-validator  
- **Docs**: Swagger UI  

### 🎨 Frontend (React + Vite)  
- **Routing**: React Router  
- **State Management**: Context API  
- **Charts**: Chart.js / Recharts  
- **Styling**: Custom CSS + utility classes  
- **HTTP Client**: Axios with interceptors  

### ☁️ Infrastructure  
- Docker & Docker Compose 🐳  
- Nginx as frontend server  
- Hot reload for dev  
- CI/CD friendly  

---

## 📋 Prerequisites  
- Node.js **18+**  
- MySQL **8+**  
- Redis **7+** (optional, for caching)  
- Docker & Docker Compose (recommended for prod)  

---

## ⚡ Quick Start  

### 🐳 Using Docker Compose (Recommended)  

```bash
# Clone repo
git clone <your-repo-url>
cd personal-finance-tracker

# Start services
docker-compose up --build

==============================================
cd backend
npx prisma generate
npx prisma migrate dev --name init
node prisma/seed.js


🖥️ Local Development
Backend
cd backend
npm install
cp .env.example .env  # configure MySQL & JWT
npx prisma generate
npx prisma migrate dev --name init
npm run dev

Frontend
cd frontend
npm install
cp .env.example .env  # set API URL
npm run dev

<img width="1582" height="544" alt="image" src="https://github.com/user-attachments/assets/a46ba0c6-d5f1-4898-ab44-b0e397a0a8fb" />


🔑 Demo Credentials
Role	Email	Password
Admin 👑	admin@demo.com
	AdminPass123!
User 🙋	user@demo.com
	UserPass123!
Read-only 👀	readonly@demo.com
	ReadOnly123
📚 API Highlights

Auth: POST /api/auth/login, POST /api/auth/register, POST /api/auth/refresh

Transactions: CRUD /api/transactions

Categories: CRUD /api/categories

Analytics: /api/analytics/dashboard, /api/analytics/trends

Admin: /api/users, /api/users/stats

👉 Full Swagger docs: http://localhost:4000/api-docs

🧪 Testing
# Backend
cd backend
npm test

# Frontend
cd frontend
npm test

📦 Deployment
Backend (Production)
cd backend
npm run build
npm start

Frontend (Production)
cd frontend
npm run build
npm run preview


Or with Docker:

docker-compose -f docker-compose.prod.yml up -d

🔒 Security Features

✅ JWT Auth & refresh token rotation
✅ Bcrypt password hashing
✅ Rate limiting against brute force
✅ SQL injection protection (Prisma)
✅ Helmet.js security headers
✅ Proper CORS config

🤝 Contributing

🍴 Fork it

🌱 Create your feature branch (git checkout -b feature/amazing-feature)

💾 Commit changes (git commit -m 'Add some amazing feature')

🚀 Push branch (git push origin feature/amazing-feature)

🎉 Open a Pull Request

📄 License

MIT License © 2025 – TechBridge Team

💌 Support

Found a bug 🐛? Need help?

Open an issue

Or reach out to the dev team 🚀

🔄 Changelog

See CHANGELOG.md
 for version history.

✨ Track smart. Spend wise. Save big. ✨


---

This version is:  
- 🎨 More **visual & enjoyable** with emojis and clear headers  
- 📦 Keeps **technical depth** (so devs can follow easily)  
- 🧭 Easy **navigation** with tables & quick commands  

