const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const orderSchema = new Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // link to the user who made the order
      required: true,
    },

    userEmail: {
      type: String,
      required: true,
    },
     
    orderItems: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        name: {
          type: String,
          required: true,
        },
        image: {
          type: String,
        },
        quantity: {
          type: Number,
          required: true,
          min: 1,
        },
        price: {
          type: Number,
          required: true,
        },
      },
    ],
    shippingAddress: {
      fullName: { type: String, required: true },
      address: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      country: { type: String, default: "Nigeria" },
      phone: { type: String, required: true },
      
    },
    paymentMethod: {
      type: String,
      enum: ["Paystack", "Flutterwave", "CashOnDelivery"],
      required: true,
    },
    paymentResult: {
      id: String, // transaction id from payment gateway
      status: String,
      update_time: String,
      email_address: String,
    },
    itemsPrice: {
      type: Number,
      required: true,
      default: 0.0,
    },
    shippingPrice: {
      type: Number,
      required: true,
      default: 0.0,
    },
    totalPrice: {
      type: Number,
      required: true,
      default: 0.0,
    },
    isPaid: {
      type: Boolean,
      default: false,
    },
    paidAt: {
      type: Date,
    },
    isDelivered: {
      type: Boolean,
      default: false,
    },
    deliveredAt: {
      type: Date,
    },
    orderNote: { 
      type: String
    },
    orderStatus: {
      type: String,
      enum: ["Pending", "Processing", "Shipped", "Delivered", "Cancelled"],
      default: "Pending",
    },
    trackingNumber: {
  type: String,
  unique: true,
  default: function () {
    return `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  },
},

  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);
