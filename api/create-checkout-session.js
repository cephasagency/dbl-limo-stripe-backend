import Stripe from 'stripe';

// Use your real Stripe Secret Key (sk_live_... or sk_test_...)
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  // Allow CORS from any origin
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'POST') {
    try {
      const { amount, bookingDetails } = req.body;

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        mode: 'payment',
        line_items: [{
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'Chauffeur Booking',
              description: `${bookingDetails.pickup} → ${bookingDetails.dropoff}`
            },
            unit_amount: amount
          },
          quantity: 1
        }],
        success_url: 'https://www.dbllimo.com/payment-success',
        cancel_url: 'https://www.dbllimo.com/payment-cancel'
      });

      return res.status(200).json({ url: session.url });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  } else {
    res.status(405).end('Method Not Allowed');
  }
}
