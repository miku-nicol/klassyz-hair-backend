const mongoose = require("mongoose");
const Product = require("../product/product.schema")



// 🟢 Add new product
const createProduct = async (req, res) => {
  try {
    const image = req.file ? req.file.filename : null
    console.log("🔑>>", image)
    const {
        name,
        description,
        price,
        category,
        length,
        texture,
        color
    } = req.body;

    if (!name || !description || !price || !category || !length || !texture || !color) {
        return res.status(400).json({
            error: "All fields (name, description, price,category, length, texture, color) are required"
        });
    }

    const newProduct = new Product({
       ...req.body,
       image: image ? `uploads/${image}` : null,

    });

    await newProduct.save();

    
    res.status(201).json({
        message: " Product created successfully",
        data: newProduct,
    });
  } catch (error) {
    console.error("❌ Error creating product", error.message);
    res.status(400).json({ message: error.message });
  }
};

// 🟢 Get all products
const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find();

    if(!products){
        return res.status(400).json({
            success: false,
            message: "No product found"
        })
    }
    res.status(200).json({
        success: true,
        data: products,
    });
  } catch (error) {
    res.status(500).json({ 
        message: "Failed to retreive item" });
  }
};

// 🟢 Get a single product by ID
const getProductById = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
  return res.status(400).json({ success: false, message: "Invalid product ID" });
}

    const product = await Product.findById(req.params.id);

    if (!product) return res.status(404).json({ message: "Product not found" });
    res.status(200).json({
        data: product,
    });
  } catch (error) {
    res.status(500).json({ 
        message: "Failed to retreive product",
        error: error.message
    });
  }
};

// 🟢 Update product
const updateProduct = async (req, res) => {
  try {
    const updated = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) 
        return res.status(404).json({
     message: "Product not found, can not update" 
    });
    res.status(200).json({
        success: true,
        message: "Product updated successfully",
        updated,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// 🟢 Delete product
const deleteProduct = async (req, res) => {
  try {
    const deleted = await Product.findByIdAndDelete(req.params.id);

    if (!deleted) 
        return res.status(404).json({ 
    message: "Product not found" 
});

    res.status(200).json({ 
        success: true,
        message: "Product deleted successfully" ,
    });
  } catch (error) {
    res.status(500).json({
         message: "Can not delete item at the moment" ,
         error: error.message
        });
  }
};



// 🧿 Create a new accessory
const createAccessory = async (req, res) => {
  try {
    const { name, description, price, color, stockQuantity, discount } = req.body;

    // Validate
    if (!name || !price) {
      return res.status(400).json({ message: "Name and price are required" });
    }

    const image = req.file ? `/uploads/${req.file.filename}` : null;

    const accessory = await Product.create({
      name,
      description,
      price,
      color,
      stockQuantity,
      discount,
      image,
      category: "accessories", // ✅ fixed category
      isAvailable: true,
    });

    res.status(201).json({
      success: true,
      message: "Accessory created successfully",
      product: accessory,
    });
  } catch (error) {
    console.error("Error creating accessory:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create accessory",
      error: error.message,
    });
  }
};

// 🧿 Get all accessories
const getAccessories = async (req, res) => {
  try {
    const accessories = await Product.find({ category: "accessories" }).sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      count: accessories.length,
      products: accessories,
    });
  } catch (error) {
    console.error("Error fetching accessories:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch accessories",
      error: error.message,
    });
  }
};

// 🧿 Get one accessory by ID
const getAccessoryById = async (req, res) => {
  try {
    const accessory = await Product.findById(req.params.id);
    if (!accessory || accessory.category !== "accessories") {
      return res.status(404).json({ message: "Accessory not found" });
    }

    res.status(200).json({ success: true, product: accessory });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching accessory",
      error: error.message,
    });
  }
};









module.exports = {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  createAccessory,
  getAccessories,
  getAccessoryById,
};
