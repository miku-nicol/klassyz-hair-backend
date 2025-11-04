exports.emailTemplates = {
  placed: {
    subject: "🧾 Your Order Has Been Received – KLASSYZ HAIRPLUGG",
    html: (order) => `
      <h2 style="color:#d63384;">Thank you for your order, ${order?.user?.name || "Customer"}!</h2>
      <p>We’ve received your order <strong>${order.trackingNumber}</strong>.</p>
      <p><strong>Order Summary:</strong></p>
      <ul>
        ${order.orderItems.map(item => `
          <li>${item.name} - ₦${item.price} × ${item.quantity}</li>
        `).join("")}
      </ul>
      <p><strong>Total:</strong> ₦${order.totalPrice.toLocaleString()}</p>
      <p><strong>Shipping to:</strong> ${order.shippingAddress.fullName}, ${order.shippingAddress.city}, ${order.shippingAddress.state}</p>
      <p>We’ll notify you when it’s processed. 💖</p>
    `,
  },

  paid: {
    subject: "💳 Payment Successful – Your KLASSYZ Order Is Being Processed",
    html: (order) => `
      <h2 style="color:#d63384;">Payment Confirmed!</h2>
      <p>Your payment for <strong>${order.trackingNumber}</strong> was successful.</p>
      <p>Amount Paid: ₦${order.totalPrice.toLocaleString()}</p>
      <p>Payment Reference: ${order.paymentResult?.id || "N/A"}</p>
      <p>We’re now processing your order. 💅</p>
    `,
  },

  orderConfirmation: {
    subject: "✅ Your Order Has Been Confirmed - KLASSYZ HAIRPLUGG",
    html: (order) => `
      <div style="font-family: Arial, sans-serif; color: #333;">
        <h2 style="color: #d63384;">Hi ${order.user?.name || "Customer"},</h2>
        <p>We’re excited to let you know that your order <strong>${order.trackingNumber}</strong> has been confirmed and is now being processed!</p>

        <h3>🛍️ Order Summary:</h3>
        <ul style="padding-left: 15px;">
          ${order.orderItems
            .map(
              (item) =>
                `<li>${item.name} - ₦${item.price} × ${item.quantity}</li>`
            )
            .join("")}
        </ul>

        <p><strong>Total:</strong> ₦${order.totalPrice.toLocaleString()}</p>
        <p><strong>Shipping to:</strong> ${order.shippingAddress.fullName}, ${order.shippingAddress.address}, ${order.shippingAddress.city}, ${order.shippingAddress.state}</p>

        <p style="margin-top: 20px;">We’ll notify you once it’s shipped. 💖</p>
      </div>
    `,
  },

  shipped: {
    subject: "🚚 Your Order Has Been Shipped - KLASSYZ HAIRPLUGG",
    html: (order) => `
      <div style="font-family: Arial, sans-serif; color: #333;">
        <h2 style="color: #d63384;">Good news, ${order.user?.name || "Customer"}!</h2>
        <p>Your order <strong>${order.trackingNumber}</strong> is on its way! 🎉</p>

        <h3>📦 Shipping Details:</h3>
        <p><strong>Destination:</strong> ${order.shippingAddress.fullName}, ${order.shippingAddress.address}, ${order.shippingAddress.city}, ${order.shippingAddress.state}</p>
        <p><strong>Courier:</strong> Our trusted delivery partner</p>

        <p style="margin-top: 20px;">You can expect delivery soon. Thank you for shopping with <strong>KLASSYZ HAIRPLUGG</strong>! 💅</p>
      </div>
    `,
  },

  delivered: {
    subject: "🎁 Order Delivered - KLASSYZ HAIRPLUGG",
    html: (order) => `
      <div style="font-family: Arial, sans-serif; color: #333;">
        <h2 style="color: #d63384;">Yay, ${order.user?.name || "Customer"}! 💖</h2>
        <p>Your order <strong>${order.trackingNumber}</strong> has been successfully delivered.</p>

        <h3>💅 We hope you love your purchase!</h3>
        <p>We’d appreciate it if you could leave a review or share your experience on our website or social media.</p>

        <p style="margin-top: 20px;">Thank you for shopping with <strong>KLASSYZ HAIRPLUGG</strong> — your beauty, your confidence! 💖</p>
      </div>
    `,
  },

  cancelled: {
    subject: "⚠️ Order Cancelled - KLASSYZ HAIRPLUGG",
    html: (order) => `
      <div style="font-family: Arial, sans-serif; color: #333;">
        <h2 style="color: #d63384;">Hello ${order.user?.name || "Customer"},</h2>
        <p>We’re sorry to inform you that your order <strong>${order.trackingNumber}</strong> has been cancelled.</p>

        <p>If this was a mistake or if you wish to reorder, please contact our support team or visit our website to place a new order.</p>

        <p style="margin-top: 20px;">We hope to serve you again soon 💖</p>
      </div>
    `,
  },
};
