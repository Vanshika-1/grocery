import dotenv from 'dotenv';
dotenv.config();
import { fileURLToPath } from 'url';
import express from 'express';
import cors from 'cors';
import foodRouter from './routers/food.router.js';
import userRouter from './routers/user.router.js';
import orderRouter from './routers/order.router.js';
import uploadRouter from './routers/upload.router.js';
import { dbconnect } from './config/database.config.js';
import { EventEmitter } from 'events';
import fs from 'fs';
import path from 'path';


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true }); 
}

EventEmitter.defaultMaxListeners = 500; 


const app = express();
app.use(express.json());


app.use(
  cors({
    credentials: true,
    origin: ['http://localhost:3000'], 
  })
);


app.use('/uploads', express.static(uploadDir));

// Connect to Database
dbconnect();

// Routers
app.use('/api/foods', foodRouter);
app.use('/api/users', userRouter);
app.use('/api/orders', orderRouter);
app.use('/api/upload', uploadRouter);

// Serve Static Files for Frontend
const publicFolder = path.join(__dirname, 'public');
if (!fs.existsSync(publicFolder)) {
  console.warn(`Public folder not found at: ${publicFolder}`);
} else {
  app.use(express.static(publicFolder));

  // Serve Frontend Index File
  app.get('*', (req, res) => {
    const indexFilePath = path.join(publicFolder, 'index.html');
    if (!fs.existsSync(indexFilePath)) {
      res.status(404).send('Frontend index.html file not found.');
    } else {
      res.sendFile(indexFilePath);
    }
  });
}

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
