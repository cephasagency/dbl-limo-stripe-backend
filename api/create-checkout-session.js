import Stripe from 'stripe';

// Initialize Stripe with your Secret Key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  // Allow CORS if needed
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method === "POST") {
    try {
      const { amount, bookingDetails } = req.body;

      // ✅ Create a Payment Intent instead of Checkout Session
      const paymentIntent = await stripe.paymentIntents.create({
        amount,
        currency: 'usd',
        description: `Chauffeur Booking - ${bookingDetails.pickup} to ${bookingDetails.dropoff}`,
        automatic_payment_methods: { enabled: true }
      });

      // Return client secret to frontend
      res.status(200).json({ clientSecret: paymentIntent.client_secret });
    } catch (err) {
      console.error("Stripe Payment Intent Error:", err);
      res.status(500).json({ error: err.message });
    }
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
}
