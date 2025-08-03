// pages/api/create-checkout-session.js
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const { amount, bookingDetails } = req.body;

      // Make sure amount is valid
      if (!amount || amount < 50) {
        return res.status(400).json({ error: 'Invalid payment amount.' });
      }

      // Create PaymentIntent for inline payments
      const paymentIntent = await stripe.paymentIntents.create({
        amount,
        currency: 'usd',
        automatic_payment_methods: { enabled: true },
        metadata: bookingDetails || {}
      });

      return res.status(200).json({ clientSecret: paymentIntent.client_secret });

    } catch (err) {
      console.error('Stripe PaymentIntent error:', err);
      return res.status(500).json({ error: err.message });
    }
  } else {
    res.setHeader('Allow', 'POST');
    return res.status(405).end('Method Not Allowed');
  }
}
