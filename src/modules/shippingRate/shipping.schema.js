const mogoose = require("mongoose");

const Schema = mogoose.Schema;

const shippingRateSchema = new Schema(
    {
        state:{
            type: String,
            require: true,
            unique: true,
            trim: true,
        },
        price: {
            type: Number,
            require: true,
            min: 0,
        },
        estimatedDays:{
            type: Number,
            default: 3,
        },

    },
);

module.exports = mogoose.model("ShippingRate", shippingRateSchema);