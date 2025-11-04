const Shipping = require("./shipping.schema");

// ➕ Add Shipping Rate
const addShipping = async (req, res) => {
  try {
    const { state, price, estimatedDays } = req.body;

    if (!state || !price) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    const newRate = new Shipping({ state, price, estimatedDays });
    await newRate.save();

    res.status(201).json({
      success: true,
      message: "Shipping rate added successfully",
      data: newRate,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error adding shipping rate",
      error: error.message,
    });
  }
};

// 📜 Get All Shipping Rates
const getShipping = async (req, res) => {
  try {
    const rates = await Shipping.find().sort({ state: 1 });
    res.status(200).json({
      success: true,
      data: rates,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching shipping rates",
      error: error.message,
    });
  }
};

// ✏️ Update Shipping Rate
const updateShippingRate = async (req, res) => {
  try {
    const { id } = req.params;
    const { price, estimatedDays } = req.body;

    const updatedRate = await Shipping.findByIdAndUpdate(
      id,
      { price, estimatedDays },
      { new: true }
    );

    if (!updatedRate) {
      return res.status(404).json({ message: "Shipping rate not found" });
    }

    res.status(200).json({
      success: true,
      message: "Shipping rate updated successfully",
      data: updatedRate,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error updating shipping rate",
      error: error.message,
    });
  }
};

// ❌ Delete Shipping Rate
const deleteShippingRate = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Shipping.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({ message: "Shipping rate not found" });
    }

    res.status(200).json({
      success: true,
      message: "Shipping rate deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error deleting shipping rate",
      error: error.message,
    });
  }
};

module.exports = {
  addShipping,
  getShipping,
  updateShippingRate,
  deleteShippingRate,
};
