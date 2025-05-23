# FixHood - Local Home Repair Platform

FixHood is a platform connecting homeowners with local repair professionals for home maintenance and repair services.

## Features

- 🔐 User Authentication (Homeowners & Fixers)
- 🏠 Job Posting & Management
- 💬 Real-time Chat System
- 📍 Location-based Job Matching
- ⭐ Rating & Review System
- 🔍 Job Search & Filtering

## Tech Stack

### Frontend
- React + TypeScript
- Vite
- Tailwind CSS
- Socket.IO Client

### Backend
- Node.js + Express
- MongoDB
- Socket.IO
- JWT Authentication

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- MongoDB
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/Zaidmakandar1/FixHood.git
cd FixHood
```

2. Install frontend dependencies:
```bash
npm install
```

3. Install backend dependencies:
```bash
cd server
npm install
```

4. Create a `.env` file in the server directory:
```env
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
PORT=5000
```

5. Start the development servers:

Frontend:
```bash
npm run dev
```

Backend:
```bash
cd server
npm run dev
```

The application will be available at:
- Frontend: http://localhost:5173
- Backend: http://localhost:5000

## Project Structure

```
FixHood/
├── src/                    # Frontend source code
│   ├── components/        # React components
│   ├── contexts/         # React contexts
│   ├── hooks/           # Custom hooks
│   ├── pages/          # Page components
│   ├── services/      # API services
│   └── types/        # TypeScript types
├── server/           # Backend source code
│   ├── models/      # MongoDB models
│   ├── routes/     # API routes
│   └── middleware/ # Express middleware
└── public/        # Static files
```

## API Endpoints

### Authentication
- POST `/api/auth/register` - Register new user
- POST `/api/auth/login` - User login

### Jobs
- GET `/api/jobs` - List all jobs
- POST `/api/jobs` - Create new job
- GET `/api/jobs/:id` - Get job details
- PUT `/api/jobs/:id` - Update job
- DELETE `/api/jobs/:id` - Delete job

### Chat
- GET `/api/chat/:jobId` - Get chat history
- POST `/api/chat` - Send message
- WebSocket events for real-time messaging

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Contact

Zaid Makandar - [@Zaidmakandar1](https://github.com/Zaidmakandar1)

Project Link: [https://github.com/Zaidmakandar1/FixHood](https://github.com/Zaidmakandar1/FixHood) 