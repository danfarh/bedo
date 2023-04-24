import { Router } from 'express'
import stripe from './gateways/Stripe'
import authenticate from './athenticateMiddleware'
import tripPayment from './tripPayment'
import orderPayment from './orderPayment'
import orderController from '../../schema/order/controller'
import paymentController from '../../schema/payment/controller'
import tripController from '../../schema/trip/controller'

const router = Router()
//! ShopAdmins and Drivers authorize and create stripe account using this route
router.get('/connect/oauth', authenticate, async (req: any, res) => {
  const { code, state } = req.query
  const { user } = req
  const result = await stripe.authorize(code, user)
  res.send(result)
})

//! alternative routes for these webhooks: if they didnt work disable the webhook in stripe developer panel and use these
// //! payment webhook for successful payment intent
router.post('/api/v1/alter/webhook/paymentIntent/Success', authenticate, (req, res) => {
  console.log('route paymentIntent/Success called')
  console.log('req.body,req.body')
  const { metadata, paymentIntent } = req.body
  if (metadata.orderId) {
    orderController.completeOrderPayment(metadata.orderId, paymentIntent)
  } else if (paymentIntent.metadata.tripId) {
    paymentController.completeTripFailedPayment(metadata.tripId, paymentIntent)
  }
  //   // Return a response to acknowledge receipt of the event
  res.json({ received: true })
})
// //! payment webhook for successful TRIP setup intent
router.post('/api/v1/alter/webhook/payment/setupIntentSuccess', authenticate, (req, res) => {
  console.log('route payment/setupIntentSuccess called')
  console.log('req.body,req.body')
  const { tripId, paymentMethod } = req.body
  tripController.TripPaymentInitSuccessful(tripId, paymentMethod, paymentMethod)
  res.send({ received: true })
})

router.use('', orderPayment)
router.use('', tripPayment)

export default router
