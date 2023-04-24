import { Router } from 'express'
import bodyParser from 'body-parser'
import {
  STRIPE_ORDER_ENDPOINT_SECRET_KEY,
  STRIPE_TRIP_ENDPOINT_SECRET_KEY
} from '../../config/index'
import stripe from './gateways/Stripe'
import orderController from '../../schema/order/controller'
import tripController from '../../schema/trip/controller'
import paymentController from '../../schema/payment/controller'

/*
Doc:
https://stripe.com/docs/payments/handling-payment-events#build-your-own-webhook
*/

const router = Router()
const parser = bodyParser.raw({ type: 'application/json' })
//! payment webhook for successful payment intent
router.post('/api/v1/webhook/paymentIntent/succeeded', parser, (request, response) => {
  // router.post('/api/v1/webhook/payment/succeeded', parser, (request, response) => {
  const endpointSecret = STRIPE_ORDER_ENDPOINT_SECRET_KEY
  const sig: any = request.headers['stripe-signature']
  let event
  try {
    event = stripe.getStripe().webhooks.constructEvent(request.body, sig, endpointSecret)
  } catch (err) {
    //   console.log(`Webhook Error: ${err.message}`)
    response.status(400).send(`Webhook Error: ${err.message}`)
  }

  if (event.type === 'payment_intent.succeeded') {
    const paymentIntent = event.data.object
    //   console.log('PaymentIntent was successful!', paymentIntent)
    console.log('PaymentIntent successful ', paymentIntent.metadata)
    if (paymentIntent.metadata.orderId) {
      orderController.completeOrderPayment(paymentIntent.metadata.orderId, paymentIntent.id)
    } else if (paymentIntent.metadata.tripId) {
      paymentController.completeTripFailedPayment(paymentIntent.metadata.tripId, paymentIntent.id)
    }
    // Return a response to acknowledge receipt of the event
    response.json({ received: true })
  }
})
//! payment webhook for successful TRIP setup intent
router.post('/api/v1/webhook/payment/setupIntentSuccess', parser, (request, response) => {
  // router.post('/api/v1/webhook/payment/trip', parser, (request, response) => {
  const endpointSecret = STRIPE_TRIP_ENDPOINT_SECRET_KEY
  // Match the raw body to content type application/json
  const sig: any = request.headers['stripe-signature']
  console.log('event captured')
  console.log('request.body', request.body)
  let event
  try {
    event = stripe.getStripe().webhooks.constructEvent(request.body, sig, endpointSecret)
  } catch (err) {
    //   console.log(`Webhook Error: ${err.message}`)
    response.status(400).send(`Webhook Error: ${err.message}`)
  }

  console.log('event', event)
  if (event.type === 'setup_intent.succeeded') {
    const setupIntent = event.data.object
    //   console.log('PaymentIntent was successful!', paymentIntent)
    console.log('setupIntent confirmed : metadata :', setupIntent.metadata)
    tripController.TripPaymentInitSuccessful(
      setupIntent.metadata.tripId,
      setupIntent.payment_method,
      setupIntent.id
    )
    // Return a response to acknowledge receipt of the event
    response.json({ received: true })
  }
})

export default router
