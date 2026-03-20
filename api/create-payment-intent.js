import Stripe from 'stripe';

// REEMPLAZA ESTA LLAVE CON TU "Secret key" REAL DE STRIPE (Empieza con sk_test_...)
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || 'sk_test_51SsyuyJx3w1bRrWKoCkPw9SHafw7SvqWlzjs4gbXTPsm7jdw7XG2KWzn53LVzTPnWTZNivmDeG59sKYwA4u0rFH5000WdZgGmy';

const stripe = new Stripe(STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  console.log('--- Incoming Request to /api/create-payment-intent ---');
  console.log('Method:', req.method);
  console.log('Body:', req.body);

  // Configuración de CORS para permitir peticiones desde Vite (localhost:5173)
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { paymentMethodId, amount } = req.body;

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount * 100, 
      currency: 'mxn',
      payment_method: paymentMethodId,
      confirm: true,
      automatic_payment_methods: {
        enabled: true,
        allow_redirects: 'never'
      },
    });

    res.status(200).json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      status: paymentIntent.status
    });
  } catch (error) {
    console.error('Stripe error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}
