import mongoose from 'mongoose';

const FoodSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    price: { type: Number, required: true },
    tags: { type: [String] },
    favorite: { type: Boolean, default: false },
    stars: { type: Number, default: 3 },
    imageUrl: { type: String, required: true }, 
    origins: { type: [String], required: true },
  },
  {
    toJSON: {
      virtuals: true,
    },
    toObject: {
      virtuals: true,
    },
    timestamps: true,
  }
);


export const FoodModel = mongoose.model('Food', FoodSchema);
