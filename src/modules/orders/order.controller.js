const Order = require("../orders/order.schema");
const User = require("../users/user.schema")
const Cart = require("../cart/cart.schema");
const Shipping = require("../shippingRate/shipping.schema");
const { generateInvoice } = require("../../utils/invoice");


const axios = require("axios");
const { sendOrderEmail, getEmailTypeFromStatus } = require("../../utils/sendOrderEmail");


const createOrderFromCart = async (req, res) => {
  try {
    const userId = req.userData.id;

    const user = await User.findById(userId);
if (!user) {
  return res.status(404).json({ success: false, message: "User not found" });
}



    // 1️⃣ Find user's cart (correct field name)
    const userCart = await Cart.findOne({ owner: userId }).populate("cartedItems.productId");
console.log("🧍‍♂️ User ID:", userId);
console.log("🛒 Cart owner in DB:", userCart?.owner);

    if (!userCart || userCart.cartedItems.length === 0) {
      return res.status(400).json({ message: "Your cart is empty" });
    }

    // 2️⃣ Map cart items to order items
    const orderItems = userCart.cartedItems.map((item) => ({
      product: item.productId._id,
      name: item.name,
      image: item.image,
      quantity: item.quantity,
      price: item.price,
    }));

    // 3️⃣ Calculate items total
    const itemsPrice = orderItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    // 4️⃣ Get shipping info & payment method
    const { shippingAddress, paymentMethod } = req.body;

    if (!shippingAddress || !shippingAddress.state || !paymentMethod) {
      return res.status(400).json({
        message: "Missing shipping address, state, or payment method",
      });
    }

    // ✅ Match your Order schema payment method ENUM
    const allowedMethods = ["Paystack", "Flutterwave", "CashOnDelivery"];
    if (!allowedMethods.includes(paymentMethod)) {
      return res.status(400).json({ message: "Invalid payment method" });
    }

    // 5️⃣ Get shipping rate dynamically
    const shippingRate = await Shipping.findOne({
      state: { $regex: new RegExp(`^${shippingAddress.state}$`, "i") },
    });

    if (!shippingRate) {
      return res.status(404).json({
        message: `No shipping rate found for ${shippingAddress.state}`,
      });
    }

    const shippingPrice = shippingRate.price;

    // 6️⃣ Calculate total price
    const totalPrice = itemsPrice + shippingPrice;

    // 7️⃣ Create and save the new order
    const newOrder = new Order({
      user: userId,
      userEmail: user.email,
      orderItems,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      shippingPrice,
      totalPrice,
      orderStatus: "Pending", // ✅ matches schema field name
      trackingNumber: `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`, // optional
    });

    const savedOrder = await newOrder.save();

    const invoicePath = await generateInvoice(savedOrder);
    console.log('Invoice generated at:', invoicePath);

    await sendOrderEmail(
  savedOrder.userEmail,
  "placed",
  savedOrder,
  invoicePath
);

    // 8️⃣ Clear cart (don’t delete)
    userCart.cartedItems = [];
    userCart.totalPrice = 0;
    await userCart.save();

    // ✅ Send success response
    res.status(201).json({
      success: true,
      message: "Order placed successfully",
      order: savedOrder,
    });

  } catch (error) {
    console.error("Error creating order:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};



// ✅ Get all orders for the logged-in user
const getUserOrders = async (req, res) => {
  try {
    const userId = req.userData.id;

    const orders = await Order.find({ user: userId })
      .populate("orderItems.product", "name price image")
      .sort({ createdAt: -1 }); // newest first

    if (!orders || orders.length === 0) {
      return res.status(404).json({
        success: false,
        message: "You have no orders yet",
      });
    }

    res.status(200).json({
      success: true,
      message: "User orders retrieved successfully",
      data: orders,
    });
  } catch (error) {
    console.error("Error fetching user orders:", error);
    res.status(500).json({
      success: false,
      message: "Server error fetching orders",
      error: error.message,
    });
  }
};

// ✅ Update order status (for admin or staff)
const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params; // order id
    const { status } = req.body;

    const validStatuses = [
      "Pending",
      "Processing",
      "Shipped",
      "Delivered",
      "Cancelled",
    ];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order status",
      });
    }

    // 1️⃣ Find the order first
    const order = await Order.findById(id).populate("user", "email name");

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // 2️⃣ Update order fields
    order.orderStatus = status;
    order.isDelivered = status === "Delivered";
    order.deliveredAt = status === "Delivered" ? Date.now() : null;

    // 3️⃣ Save the order
    const updatedOrder = await order.save();

    // 4️⃣ Send email notification (optional per status)
    const emailType = getEmailTypeFromStatus(status);
    if (emailType) {
      await sendOrderEmail(
        updatedOrder.user.email,
        emailType,
        updatedOrder,
        null // no invoice needed here, just status update
      );
    }

    // 5️⃣ Send success response
    res.status(200).json({
      success: true,
      message: `Order status updated to ${status}`,
      data: updatedOrder,
    });
  } catch (error) {
    console.error("Error updating order status:", error);
    res.status(500).json({
      success: false,
      message: "Server error updating order status",
      error: error.message,
    });
  }
};


const getAllOrders = async (req, res) => {
  try {
    // You can also add pagination or filters later (e.g., by status)
    const orders = await Order.find()
      .populate("user", "name email") // show user info
      .populate("orderItems.product", "name price image") // show product info
      .sort({ createdAt: -1 }); // latest first

    if (!orders || orders.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No orders found",
      });
    }

    res.status(200).json({
      success: true,
      message: "All orders retrieved successfully",
      data: orders,
    });
  } catch (error) {
    console.error("Error fetching all orders:", error);
    res.status(500).json({
      success: false,
      message: "Server error fetching all orders",
      error: error.message,
    });
  }
};




const initializePayment = async (req, res) => {
  try {
    const { orderId } = req.body;

    const order = await Order.findById(orderId).populate("user", "email name");
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }
console.log("✅ Callback URL sent to Paystack:", `${process.env.FRONTEND_URL}/payment-success`);

    // Initialize Paystack transaction
    const response = await axios.post(
      "https://api.paystack.co/transaction/initialize",
      {
        email: order.user.email,
        amount: order.totalPrice * 100, // in kobo
        reference: `ORD-${order._id}-${Date.now()}`,
        callback_url: `${process.env.FRONTEND_URL}/payment-success`, // redirect back to your frontend
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );
    console.log("💳 Paystack Init Response:", response.data);

    const { data } = response.data;

    // Optionally save reference to the order
    order.paymentResult = {
      id: data.reference,
      status: "pending",
    };
    await order.save();

    res.status(200).json({
      success: true,
      message: "Payment initialized successfully",
      authorization_url: data.authorization_url,
      reference: data.reference,
    });
  } catch (error) {
    console.error("Error initializing payment:", error);
    res.status(500).json({
      success: false,
      message: "Failed to initialize payment",
      error: error.message,
    });
  }
};


const confirmPayment = async (req, res) => {
  try {
    const { orderId, reference } = req.body;

    if (!orderId || !reference) {
      return res.status(400).json({ message: "Order ID and payment reference required" });
    }

    console.log("🧾 Verifying payment for:", reference);

    // ✅ Fetch order with user info
    const order = await Order.findById(orderId).populate("user", "email name");
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // ✅ Verify payment with Paystack
    const verifyUrl = `https://api.paystack.co/transaction/verify/${reference}`;
    const response = await axios.get(verifyUrl, {
      headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}` },
    });

    const verification = response.data.data;
    console.log("✅ Paystack verify response:", verification);

    if (verification.status !== "success") {
      return res.status(400).json({ message: "Payment not successful" });
    }

    // ✅ Update order payment status
    order.isPaid = true;
    order.paidAt = new Date();
    order.paymentResult = {
      id: verification.id,
      status: verification.status,
      update_time: verification.transaction_date,
      email_address: verification.customer.email,
    };
    order.orderStatus = "Processing";

    await order.save();

    // ✅ Generate invoice & send email
    const invoicePath = await generateInvoice(order);
    await sendOrderEmail(
      order.user.email,
      "paid",
      order,
      invoicePath
    );

    res.status(200).json({
      success: true,
      message: "Payment verified and order updated successfully",
      order,
    });
  } catch (error) {
    console.error("Payment verification error:", error);
    res.status(500).json({
      success: false,
      message: "Error verifying payment",
      error: error.message,
    });
  }
};


// GET single order by ID
const getOrderById = async (req, res) => {
  try {
    const orderId = req.params.id;

    // Find order and populate the user info
    const order = await Order.findById(orderId)
      .populate("user", "name email"); // populate user details

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    res.status(200).json({ success: true, order });
  } catch (error) {
    console.error("Error fetching order:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch order",
      error: error.message,
    });
  }
};



module.exports = { createOrderFromCart, getUserOrders, updateOrderStatus, getAllOrders, confirmPayment, initializePayment, getOrderById, };
