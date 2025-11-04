const express= require("express");
const app = express();
const path = require("path");
const cors = require("cors");
const connectDB = require("./Database/dbConnection");
const { userRouter } = require("./src/modules/users/user.router");
const { productRouter } = require("./src/modules/product/product.router");
const { cartRouter } = require("./src/modules/cart/cart.routes");
const { shippingRouter } = require("./src/modules/shippingRate/shipping.router");
const { orderRouter } = require("./src/modules/orders/order.router");
const { newsRouter } = require("./src/modules/newsletter/newletter.router");

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

require("dotenv").config();


app.get("/", (req, res) =>{
    res.end("LOADING....");
});

app.use("/api/v1/user", userRouter )
app.use("/api/v1/product", productRouter)
app.use("/api/v1/cart", cartRouter)
app.use("/api/v1/shipping", shippingRouter)
app.use("/api/v1/orders", orderRouter)
app.use("/api/v1/newsletter", newsRouter);


console.log("🌍 FRONTEND_URL:", process.env.FRONTEND_URL);


connectDB();

const PORT = process.env.PORT;

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
})
