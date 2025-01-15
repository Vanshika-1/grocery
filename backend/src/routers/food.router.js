import { Router } from 'express';
import { FoodModel } from '../models/food.model.js';
import handler from 'express-async-handler';
import admin from '../middleware/admin.mid.js';
import multer from 'multer';
import path from 'path';


const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './uploads'); 
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`); 
  },
});

const upload = multer({ storage }); 

const router = Router();

// Get all foods
router.get(
  '/',
  handler(async (req, res) => {
    const foods = await FoodModel.find({});
    res.send(foods);
  })
);

// Add a new food item
router.post(
  '/',
  admin,
  upload.single('image'), 
  handler(async (req, res) => {
    const { name, price, tags, favorite, origins, cookTime } = req.body;
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : ''; 
    const food = new FoodModel({
      name,
      price,
      tags: tags.split ? tags.split(',') : tags,
      favorite,
      imageUrl, 
      origins: origins.split ? origins.split(',') : origins,
      cookTime,
    });

    await food.save();

    res.send(food);
  })
);


router.put(
  '/',
  admin,
  upload.single('image'), 
  handler(async (req, res) => {
    const { id, name, price, tags, favorite, origins, cookTime } = req.body;

   
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : undefined; 

    
    await FoodModel.updateOne(
      { _id: id },
      {
        name,
        price,
        tags: tags.split ? tags.split(',') : tags,
        favorite,
        ...(imageUrl && { imageUrl }), 
        origins: origins.split ? origins.split(',') : origins,
        cookTime,
      }
    );

    res.send(); 
  })
);

// Delete a food item
router.delete(
  '/:foodId',
  admin,
  handler(async (req, res) => {
    const { foodId } = req.params;
    await FoodModel.deleteOne({ _id: foodId });
    res.send();
  })
);

// Get all tags and the count of each
router.get(
  '/tags',
  handler(async (req, res) => {
    const tags = await FoodModel.aggregate([
      {
        $unwind: '$tags',
      },
      {
        $group: {
          _id: '$tags',
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          name: '$_id',
          count: '$count',
        },
      },
    ]).sort({ count: -1 });

    const all = {
      name: 'All',
      count: await FoodModel.countDocuments(),
    };

    tags.unshift(all);

    res.send(tags);
  })
);

// Search food by name
router.get(
  '/search/:searchTerm',
  handler(async (req, res) => {
    const { searchTerm } = req.params;
    const searchRegex = new RegExp(searchTerm, 'i');

    const foods = await FoodModel.find({ name: { $regex: searchRegex } });
    res.send(foods);
  })
);

// Get foods by tag
router.get(
  '/tag/:tag',
  handler(async (req, res) => {
    const { tag } = req.params;
    const foods = await FoodModel.find({ tags: tag });
    res.send(foods);
  })
);

// Get food by foodId
router.get(
  '/:foodId',
  handler(async (req, res) => {
    const { foodId } = req.params;
    const food = await FoodModel.findById(foodId);
    res.send(food);
  })
);

export default router;
