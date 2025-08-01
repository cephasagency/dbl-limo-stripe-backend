import Stripe from 'stripe';

// Initialize Stripe with your Secret Key from environment variables
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  // Allow CORS so Wix can call your API
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method === "POST") {
    try {
      const { amount, bookingDetails } = req.body;

      if (!amount || amount <= 0) {
        return res.status(400).json({ error: "Invalid amount" });
      }

      // Create a Payment Intent (used for Stripe Payment Element)
      const paymentIntent = await stripe.paymentIntents.create({
        amount, // amount in cents
        currency: 'usd',
        description: `Chauffeur Booking - ${bookingDetails.pickup} to ${bookingDetails.dropoff}`,
        automatic_payment_methods: { enabled: true }
      });

      // ✅ Return the clientSecret to the frontend
      return res.status(200).json({ clientSecret: paymentIntent.client_secret });

    } catch (err) {
      console.error("Stripe Payment Intent Error:", err);
      return res.status(500).json({ error: err.message });
    }
  } else {
    // Method not allowed
    return res.status(405).json({ error: "Method not allowed" });
  }
}
