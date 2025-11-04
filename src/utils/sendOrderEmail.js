const { emailTemplates } = require("./emailTemplates");
const transporter = require("./email"); // <-- new Gmail transporter
const path = require("path");
const fs = require("fs");

const sendOrderEmail = async (to, type, order, invoicePath = null) => {
  try {
    const template = emailTemplates[type];
    if (!template) throw new Error(`Invalid email type: ${type}`);

    // 🧾 Attach invoice if exists
    const attachments = invoicePath
      ? [
          {
            filename: path.basename(invoicePath),
            path: invoicePath, // Nodemailer can attach from path directly
          },
        ]
      : [];

    // ✅ Send email to the buyer
    await transporter.sendMail({
      from: `"KLASSYZ HAIRPLUGG" <${process.env.EMAIL_USER}>`,
      to,
      subject: template.subject,
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.5; color: #333;">
          ${template.html(order)}
          <p style="margin-top:20px; font-size:14px; color:#888;">
            This message was sent by KLASSYZ HAIRPLUGG 💖
          </p>
        </div>
      `,
      attachments,
    });

    console.log(`✅ ${type.toUpperCase()} email sent to ${to}`);

    // ✅ Also notify admin/seller when order is placed or paid
    if (["placed", "paid"].includes(type)) {
      await transporter.sendMail({
        from: `"KLASSYZ HAIRPLUGG" <${process.env.EMAIL_USER}>`,
        to: process.env.ADMIN_EMAIL || process.env.EMAIL_USER,
        subject: `📢 New Order Notification: ${order.trackingNumber}`,
        html: `
          <h3>New Order Received!</h3>
          <p><strong>Customer:</strong> ${order.user?.name || "Unknown"}</p>
          <p><strong>Total:</strong> ₦${order.totalPrice.toLocaleString()}</p>
          <p><strong>Payment Method:</strong> ${order.paymentMethod}</p>
          <p><strong>Status:</strong> ${order.orderStatus}</p>
          <p><strong>Shipping:</strong> ${order.shippingAddress.fullName}, 
             ${order.shippingAddress.city}, ${order.shippingAddress.state}</p>
          <p><strong>Tracking Number:</strong> ${order.trackingNumber}</p>
          <p>Check your admin dashboard for full details.</p>
        `,
        attachments,
      });

      console.log(`📬 Admin notified of ${type} order`);
    }
  } catch (error) {
    console.error(`❌ Error sending ${type} email:`, error.message);
  }
};

// 🧠 Helper for mapping status → email type
const getEmailTypeFromStatus = (status) => {
  switch (status) {
    case "Pending":
      return "placed";
    case "Processing":
      return "paid";
    case "Shipped":
      return "shipped";
    case "Delivered":
      return "delivered";
    case "Cancelled":
      return "cancelled";
    default:
      return null;
  }
};

module.exports = { sendOrderEmail, getEmailTypeFromStatus };
