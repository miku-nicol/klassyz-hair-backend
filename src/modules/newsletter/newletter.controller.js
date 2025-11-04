const Newsletter = require("../newsletter/newletter.schema");
const dns = require("dns").promises;

const subscribe = async (req, res) => {
  try {
    const { email } = req.body;

    // 1️⃣ Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      return res.status(400).json({ message: "Invalid email format." });
    }

    // 2️⃣ Extract domain from email
    const domain = email.split("@")[1];

    // 3️⃣ Verify domain has MX record
    try {
      const records = await dns.resolveMx(domain);
      if (!records || records.length === 0) {
        return res.status(400).json({ message: "Invalid email domain." });
      }
    } catch {
      return res.status(400).json({ message: "Email domain does not exist." });
    }

    // 4️⃣ Check if already subscribed
    const existing = await Newsletter.findOne({ email });
    if (existing) {
      return res
        .status(409)
        .json({ message: "This email is already subscribed." });
    }

    // 5️⃣ Save new subscriber
    const newSub = new Newsletter({ email });
    await newSub.save();

    return res
      .status(200)
      .json({ success: true, message: "Subscribed successfully!" });
  } catch (error) {
    console.error("Subscription error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error. Please try again later.",
    });
  }
};

module.exports = { subscribe };
