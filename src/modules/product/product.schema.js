const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const productSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
    },
    category: {
      type: String,
      enum: ["wigs", "bundles", "closure", "frontal", "accessories"],
      required: true,
    },
    length: {
      type: String, // e.g. "10 inch", "12 inch", "24 inch"
      trim: true,
    },
    texture: {
      type: String, // e.g. "straight", "curly", "body wave"
      trim: true,
    },
    color: {
      type: String, // e.g. "1B", "613", "Ombre", etc.
      default: "Natural Black",
    },
    discount: {
      type: Number, // e.g. 10 means 10% off
      default: 0,
    },
    stockQuantity: {
      type: Number,
      default: 0,
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
    image: {
      type: String, // Cloudinary or image URL
    },
    gallery: [
      {
        type: String, // for multiple images
      },
    ],
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    numReviews: {
      type: Number,
      default: 0,
    },
    inStock: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", productSchema);
