import nodemailer from "nodemailer";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ message: "Method not allowed" });

  const secret = req.headers["x-backend-secret"];
  if (!secret || secret !== process.env.BACKEND_SECRET) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const { name, email, phone, eventValue, selectedNumbers, totalValue } = req.body;

    if (!name || !email || !phone || !eventValue || !selectedNumbers || !selectedNumbers.length) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Create nodemailer transporter using Gmail SMTP
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,   
        pass: process.env.EMAIL_PASS,   
      },
    });


    const mailOptions = {
      from: `"Nicket Events" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: `Event Registration Confirmation: ${eventValue}`,
      html: `
        <h3>Hi ${name},</h3>
        <p>Thanks for registering for <strong>${eventValue}</strong>.</p>
        <p><strong>Phone:</strong> ${phone}<br/>
           <strong>Selected Numbers:</strong> ${selectedNumbers.join(", ")}<br/>
           <strong>Total:</strong> ₦${Number(totalValue).toLocaleString()}</p>
        <p>See you at the event! — Nicket Team</p>
      `,
    };

    await transporter.sendMail(mailOptions);

    return res.json({ message: `Email sent to ${email}` });
  } catch (err) {
    console.error("Vercel function error:", err);
    return res.status(500).json({ message: "Failed to send email", error: err?.message || err });
  }
}
