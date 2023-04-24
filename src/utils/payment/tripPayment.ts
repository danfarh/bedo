import { Router } from 'express'
import stripe from './gateways/Stripe'
import authenticate from './athenticateMiddleware'
import tripService from '../../schema/trip/service'
import UserService from '../../schema/user/service'
import paymentController from '../../schema/payment/controller'

const router = Router()
//! User to get client secret key: used for start of trip to get permission for future payment
router.get('/api/v1/payment/user/ClientSecret', authenticate, async (req: any, res) => {
  try {
    if (req.user.roles !== 'USER') {
      return res
        .status(400)
        .send({ error: { raw: { message: 'you do not have permission for this action' } } })
    }
    const user = await UserService.findOne({ _id: req.user.userId })
    const Intent: any = await stripe.setupIntent(user.stripeCustomerId)
    console.log('Intent : ', Intent)
    console.log('client_secret  :', Intent.client_secret)
    return res.send({ client_secret: Intent.client_secret })
  } catch (err) {
    return res.send({ error: err })
  }
})

//! User to get client secret key for Trip
router.get('/api/v1/payment/trip/:tripId', authenticate, async (req: any, res) => {
  if (req.user.roles !== 'USER') {
    return res
      .status(400)
      .send({ error: { raw: { message: 'you do not have permission for this action' } } })
  }
  const { tripId } = req.params
  const trip = await tripService.findById(tripId)
  if (!trip) {
    return res.status(400).send({ error: { raw: { message: 'trip does not exists' } } })
  }
  if (trip.passenger.toString() !== req.user.userId.toString()) {
    console.log('req.user.userId : ', req.user.userId)
    console.log('trip.passenger : ', trip.passenger)
    return res.status(400).send({ error: { raw: { message: 'trip is not related to you' } } })
  }
  const user: any = UserService.findById(trip.passenger)
  const paid = await paymentController.checkIfPaymentIsPaid(trip.payment)
  if (paid)
    return res.status(400).send({ error: { raw: { message: 'trip has already been paid' } } })
  try {
    const Intent: any = await stripe.setupIntent(user.stripeCustomerId, { tripId })
    console.log('Intent created, client_secret  :', Intent.client_secret)
    return res.send({ client_secret: Intent.client_secret })
  } catch (err) {
    return res.send({ error: err })
  }
})

//! HANDLE Failed Trip Payment
//! User to get client secret key to pay trip that had a failed payment
router.get('/api/v1/pay/trip/:tripId', authenticate, async (req: any, res) => {
  if (req.user.roles !== 'USER') {
    return res
      .status(400)
      .send({ error: { raw: { message: 'you do not have permission for this action' } } })
  }
  const { tripId } = req.params
  const trip = await tripService.findById(tripId)
  if (!trip) {
    return res.status(400).send({ error: { raw: { message: 'trip does not exists' } } })
  }
  const paid = await paymentController.checkIfPaymentIsPaid(trip.payment)
  if (paid)
    return res.status(400).send({ error: { raw: { message: 'trip has already been paid' } } })
  console.log('tripId : ', tripId)
  try {
    const Intent: any = await stripe.paymentIntent(trip.cost * 100, 'cad', { tripId })
    console.log('Intent : ', Intent)
    console.log('client_secret  :', Intent.client_secret)
    return res.send({ client_secret: Intent.client_secret })
  } catch (err) {
    return res.send({ error: err })
  }
})

export default router
