import mongoose from 'mongoose';

const WishSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: false },
  category: { type: String, required: true },
  taken: { type: Boolean, default: false },
  quantity: { type: Number, default: 1 }, // Total number of items initially available
  takenQuantity: { type: Number, default: 0 }, // Number of items already taken
  remainingQuantity: { type: Number }, // Number of items remaining to be taken (auto-calculated)
  takenBy: { type: String, required: false }, // The person who has taken the item
  image: { type: String, required: false }, // Optional image URL for the item
}, { timestamps: true });

export default mongoose.models.Wish || mongoose.model('Wish', WishSchema);
