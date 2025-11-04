const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const newsletterSchema = new Schema(
    {
        email: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            lowercase: true,

        },

        subscribedAt: {
            type: Date,
            default: Date.now,
        },
    },
    { timestamps: true } 
)

module.exports = mongoose.model("Newsletter", newsletterSchema);