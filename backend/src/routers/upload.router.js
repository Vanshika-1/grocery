import { Router } from 'express';
import admin from '../middleware/admin.mid.js';
import handler from 'express-async-handler';
import upload from '../config/multer.config.js';
import { BAD_REQUEST } from '../constants/httpStatus.js';




const router = Router();

router.post(
  '/',
  admin,
  upload.single('image'), 
  handler(async (req, res) => {
    const file = req.file;

    if (!file) {
      return res.status(BAD_REQUEST).send({ message: 'No file uploaded' });
    }

    const imageUrl = `/uploads/${file.filename}`; 
    res.send({ imageUrl }); 
  })
);

export default router;
