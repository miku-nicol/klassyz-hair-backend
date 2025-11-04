const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

const generateInvoice = async (order) => {
  const invoicesDir = path.join(__dirname, "../../invoices");
  const invoicePath = path.join(invoicesDir, `invoice-${order._id}.pdf`);

  // ✅ Ensure invoices folder exists
  if (!fs.existsSync(invoicesDir)) {
    fs.mkdirSync(invoicesDir, { recursive: true });
  }

  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50 });
    const stream = fs.createWriteStream(invoicePath);

    doc.pipe(stream);

    // 🪄 Header
    doc
      .fontSize(20)
      .text("KLASSYZ HAIRPLUGG", { align: "center" })
      .moveDown(0.5)
      .fontSize(10)
      .text("Premium Human Hair | Wigs | Bundles", { align: "center" })
      .moveDown(1);

    doc
      .fontSize(14)
      .text(`Invoice #INV-${Date.now()}`, { align: "left" })
      .text(`Order ID: ${order._id}`)
      .text(`Date: ${new Date(order.createdAt).toLocaleDateString()}`)
      .moveDown(1);

    // 👩🏽 Customer Info
    doc
      .fontSize(12)
      .text("Customer Details", { underline: true })
      .moveDown(0.3)
      .text(`Name: ${order.shippingAddress.fullName}`)
      .text(`Phone: ${order.shippingAddress.phone}`)
      .moveDown(0.5);

    // 📦 Shipping Address
    doc
      .fontSize(12)
      .text("Shipping Address", { underline: true })
      .moveDown(0.3)
      .text(`${order.shippingAddress.address}`)
      .text(`${order.shippingAddress.city}, ${order.shippingAddress.state}`)
      .text(`${order.shippingAddress.country}`)
      .moveDown(1);

    // 🧺 Order Items
    doc.fontSize(12).text("Order Summary", { underline: true }).moveDown(0.5);
    doc.text("Product             Qty     Price     Total");
    doc.text("----------------------------------------------");

    order.orderItems.forEach((item) => {
      const total = item.price * item.quantity;
      doc.text(
        `${item.name.padEnd(20)} ${item.quantity
          .toString()
          .padEnd(5)} ₦${item.price.toLocaleString()}  ₦${total.toLocaleString()}`
      );
    });

    doc.moveDown(1);
    doc.text("----------------------------------------------");
    doc
      .text(`Items Total: ₦${order.itemsPrice.toLocaleString()}`)
      .text(`Shipping: ₦${order.shippingPrice.toLocaleString()}`)
      .moveDown(0.5)
      .font("Helvetica-Bold")
      .text(`Total: ₦${order.totalPrice.toLocaleString()}`, { align: "right" })
      .font("Helvetica")
      .moveDown(1);

    // 💳 Payment Info
    doc
      .fontSize(12)
      .text("Payment Details", { underline: true })
      .moveDown(0.3)
      .text(`Method: ${order.paymentMethod}`)
      .text(`Status: ${order.isPaid ? "Paid ✅" : "Pending ⏳"}`)
      .moveDown(1);

    // 🧾 Footer
    doc
      .fontSize(10)
      .text("Thank you for shopping with Klassyz Hairplugg!", {
        align: "center",
      })
      .text("www.klassyzhairplugg.com", { align: "center" });

    // 🔚 Finish PDF writing
    doc.end();

    stream.on("finish", () => {
      console.log(`✅ Invoice generated at: ${invoicePath}`);
      resolve(invoicePath); // ✅ Only resolve after PDF is fully written
    });

    stream.on("error", (err) => {
      console.error("❌ Error generating invoice:", err.message);
      reject(err);
    });
  });
};

module.exports = { generateInvoice };
