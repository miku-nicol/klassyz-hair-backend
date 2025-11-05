const Cart = require("./cart.schema");
const Product = require("../product/product.schema");

const addItemToCart = async (req, res) => {
  try {
    console.log("req.userData:", req.userData);

    
// 🔒 Ensure user is authenticated before continuing
     if (!req.userData || !req.userData.id) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: Please log in to add items to cart.",
      });
    }

    const cartOwner = req.userData.id;
    const { cartedItems } = req.body;

    if (!cartedItems || !Array.isArray(cartedItems) || cartedItems.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Please provide at least one item to add to cart.",
      });
    }

    const allItemIds = cartedItems.map((item) => item.itemId);
    const fullItems = await Product.find({ _id: { $in: allItemIds } });

    if (fullItems.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No valid products found for given item IDs.",
      });
    }

    const calculatedItems = cartedItems
      .map((item) => {
        const matchedProduct = fullItems.find(
          (p) => p._id.toString() === item.itemId
        );
        if (!matchedProduct) return null;

        return {
          productId: matchedProduct._id,
          name: matchedProduct.name,
          price: matchedProduct.price,
          quantity: item.quantity,
          totalItemPrice: matchedProduct.price * item.quantity,
          image: matchedProduct.image.replace(/^http:\/\/localhost:9000/, "")

        };
      })
      .filter(Boolean);

    const totalPrice = calculatedItems.reduce(
      (sum, item) => sum + item.totalItemPrice,
      0
    );

    let userCart = await Cart.findOne({ owner: cartOwner });

    if (userCart) {
      calculatedItems.forEach((newItem) => {
        const existingItem = userCart.cartedItems.find(
          (i) => i.productId.toString() === newItem.productId.toString()
        );

        if (existingItem) {
          existingItem.quantity += newItem.quantity;
          existingItem.totalItemPrice =
            existingItem.quantity * existingItem.price;
        } else {
          userCart.cartedItems.push(newItem);
        }
      });

      userCart.totalPrice = userCart.cartedItems.reduce(
        (sum, item) => sum + item.totalItemPrice,
        0
      );

      await userCart.save();
      return res.status(200).json({
        success: true,
        message: "Cart updated successfully",
        data: userCart,
      });
    }

    const newCart = new Cart({
      owner: cartOwner,
      cartedItems: calculatedItems,
      totalPrice,
    });

    const savedCart = await newCart.save();

    res.status(201).json({
      success: true,
      message: "Cart created successfully",
      data: savedCart,
    });
  } catch (error) {
    console.error("❌ Error adding to cart:", error.message);
    res.status(500).json({
      success: false,
      message: "Server error while adding to cart",
      error: error.message,
    });
  }
};



// 📦 Get cart by user
const getUserCart = async (req, res) => {
  try {
    const cartOwner = req.userData.id;
    const userCart = await Cart.findOne({ owner: cartOwner });

    if (!userCart) {
      return res.status(200).json({
    success: true,
    data: { cartedItems: [], totalPrice: 0 },
  });
    }

    res.status(200).json({
      success: true,
      data: userCart,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error retrieving cart",
      error: error.message,
    });
  }
};

// ❌ Remove item from cart
const removeItemFromCart = async (req, res) => {
  try {
    const cartOwner = req.userData.id;
    const { productId } = req.params;

    let userCart = await Cart.findOne({ owner: cartOwner });

    if (!userCart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found",
      });
    }

    userCart.cartedItems = userCart.cartedItems.filter(
      (item) => item.productId.toString() !== productId
    );

    userCart.totalPrice = userCart.cartedItems.reduce(
      (sum, item) => sum + item.totalItemPrice,
      0
    );

    await userCart.save();

    res.status(200).json({
      success: true,
      message: "Item removed successfully",
      data: userCart,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error removing item from cart",
      error: error.message,
    });
  }
};

const clearCart = async (req, res) => {
  try {
    const cartOwner = req.userData.id;

    const userCart = await Cart.findOne({ owner: cartOwner });

    if (!userCart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found",
      });
    }

    userCart.cartedItems = [];
    userCart.totalPrice = 0;

    await userCart.save();

    res.status(200).json({
      success: true,
      message: "Cart cleared successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error clearing cart",
      error: error.message,
    });
  }
};

// ✅ Update quantity of a cart item
const updateCartQuantity = async (req, res) => {
  try {
    const cartOwner = req.userData.id;
    const { productId, action } = req.body; // "increase" or "decrease"

    const userCart = await Cart.findOne({ owner: cartOwner });
    if (!userCart) {
      return res.status(404).json({ success: false, message: "Cart not found." });
    }

    const cartItem = userCart.cartedItems.find(
      (item) => item.productId.toString() === productId
    );

    if (!cartItem) {
      return res.status(404).json({ success: false, message: "Item not found in cart." });
    }

    if (action === "increase") {
      cartItem.quantity += 1;
    } else if (action === "decrease" && cartItem.quantity > 1) {
      cartItem.quantity -= 1;
    }

    // Recalculate totalItemPrice
    cartItem.totalItemPrice = cartItem.price * cartItem.quantity;

    // Recalculate totalPrice
    userCart.totalPrice = userCart.cartedItems.reduce(
      (sum, i) => sum + i.totalItemPrice,
      0
    );

    await userCart.save();

    res.status(200).json({
      success: true,
      message: "Cart item quantity updated successfully",
      data: userCart,
    });
  } catch (err) {
    console.error("❌ Error updating quantity:", err.message);
    res.status(500).json({
      success: false,
      message: "Server error updating quantity",
      error: err.message,
    });
  }
};


module.exports = { addItemToCart, getUserCart, removeItemFromCart, clearCart, updateCartQuantity };
