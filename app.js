const stripe = require('stripe')('sk_test_***');

async function createStripeProductsAndPrices() {
  try {
    const liteProduct = await stripe.products.create({
      name: 'Lite',
      type: 'service',
    });

    await stripe.prices.create({
      product: liteProduct.id,
      unit_amount: 1000, // $10 in cents
      currency: 'usd',
      recurring: { interval: 'month' },
    });

    const eliteProduct = await stripe.products.create({
      name: 'Elite',
      type: 'service',
    });

    await stripe.prices.create({
      product: eliteProduct.id,
      unit_amount: 1499, // $14.99 in cents
      currency: 'usd',
      recurring: { interval: 'month' },
    });

    console.log('Products and prices have been created on Stripe.');
  } catch (error) {
    console.error('An error occurred:', error.message);
  }
}

// Run the function to create products and prices
createStripeProductsAndPrices();


const express = require('express');
const app = express();

app.use(express.json());
app.use(express.static('public'));

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
});

app.post('/create-checkout-session', async (req, res) => {
    const productName = 'Elite'; // Replace with the name of your product
    const price = 1499; // Replace with the price in cents (e.g., 10.00 USD)

    try {
        const products = await stripe.products.list({ active: true });
        const product = products.data.find((p) => p.name === productName);

        if (product) {
            const prices = await stripe.prices.list({ product: product.id });
            const selectedPrice = prices.data.find((p) => p.unit_amount === price);

            if (selectedPrice) {
                const session = await stripe.checkout.sessions.create({
                    payment_method_types: ['card', 'paypal', "us_bank_account"],
                    line_items: [
                        {
                            price: selectedPrice.id,
                            quantity: 1,
                        },
                    ],
                    mode: 'subscription',
                    success_url: 'https://your-website.com/success?session_id={CHECKOUT_SESSION_ID}', // Replace with your success URL
                    cancel_url: 'https://your-website.com/cancel',   // Replace with your cancel URL
                });

                // Redirect with a 303 status code
                res.redirect(303, session.url);
            } else {
                res.status(404).send('Price not found for the specified amount.');
            }
        } else {
            res.status(404).send('Product not found with the specified name.');
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});





// const stripe = require('stripe')('sk_l###');

// async function createCheckoutSession() {
//   try {
//     const session = await stripe.checkout.sessions.create({
//       payment_method_types: ['card', 'google_pay', 'paypal'],
//       subscription_data: {
//         items: [
//           {
//             price: 'price_1_lite',  // Replace with the actual Lite price ID
//           },
//           {
//             price: 'price_1_elite', // Replace with the actual Elite price ID
//           },
//         ],
//       },
//       success_url: 'https://your-website.com/success', // Replace with your success URL
//       cancel_url: 'https://your-website.com/cancel',   // Replace with your cancel URL
//       payment_intent_data: {
//         setup_future_usage: 'off_session',
//       },
//       mode: 'subscription',
//     });

//     console.log('Checkout session created:', session.id);
//   } catch (error) {
//     console.error('An error occurred:', error.message);
//   }
// }

// // Run the function to create a checkout session
// createCheckoutSession();
