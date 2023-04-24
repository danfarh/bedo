import { Router } from 'express'
import stripe from './gateways/Stripe'
import authenticate from './athenticateMiddleware'
import orderService from '../../schema/order/service'
import paymentController from '../../schema/payment/controller'

const router = Router()
//! User to get client secret key for Order
router.get('/api/v1/payment/order/:orderId', authenticate, async (req: any, res) => {
  if (req.user.roles !== 'USER') {
    return res
      .status(400)
      .send({ error: { raw: { message: 'you do not have permission for this action' } } })
  }
  const { orderId } = req.params
  const order = await orderService.findById(orderId)
  if (!order) {
    return res.status(400).send({ error: { raw: { message: 'order does not exists' } } })
  }
  const paid = await paymentController.checkIfPaymentIsPaid(order.payment)
  if (paid)
    return res.status(400).send({ error: { raw: { message: 'order has already been paid' } } })
  try {
    const Intent: any = await stripe.paymentIntent(order.total * 100, 'cad', { orderId })
    console.log('Intent : ', Intent)
    console.log('client_secret  :', Intent.client_secret)
    return res.send({ client_secret: Intent.client_secret })
  } catch (err) {
    return res.send({ error: err })
  }
})
export default router
