import Stripe from 'stripe'
import { ApolloError } from 'apollo-server-express'
import driverService from '../../../schema/driver/service'
import shopService from '../../../schema/shop/service'

import { STRIPE_SECRET_KEY } from '../../../config/index'
/*
 Documentation for the process :
https://stripe.com/docs/payments/intents#setup-intent
*/
class StripeClass {
  stripe: Stripe

  constructor() {
    this.stripe = new Stripe(STRIPE_SECRET_KEY, { apiVersion: '2020-03-02', typescript: true })
  }

  getStripe() {
    return this.stripe
  }

  async createCustomer(name, balance, email, phone, metadata: Stripe.Metadata = {}): Promise<any> {
    const customer = await this.stripe.customers.create({ name, balance, email, phone, metadata })
    console.log('customer created : ', customer)
    return customer
  }

  async getCustomer(id) {
    const customer = await this.stripe.customers.retrieve(id)
    // NOTE:customer.default_source
    return customer
  }

  async paymentIntent(amount, currency = 'cad', metadata: Stripe.Metadata = {}) {
    amount = Math.trunc(amount)
    const Intent = await this.stripe.paymentIntents.create({
      amount,
      currency,
      // Verify your integration in this guide by including this parameter
      metadata: { integration_check: 'accept_a_payment', ...metadata }
    })
    return Intent
  }

  async setupIntent(customerId, metadata = {}) {
    const Intent = await this.stripe.setupIntents.create({
      customer: customerId,
      payment_method_types: ['card'],
      usage: 'off_session',
      // confirm: true,
      metadata
    })
    return Intent
  }

  async getSetupIntent(intentId) {
    const Intent = await this.stripe.setupIntents.retrieve(intentId)
    return Intent
  }

  async updateSetupIntent(intentId, data) {
    const intent = await this.stripe.setupIntents.update(intentId, { metadata: data })
    return intent
  }

  async getCustomerPaymentMethods(customerId) {
    const paymentMethods = await this.stripe.paymentMethods.list({
      customer: customerId,
      type: 'card'
    })
    console.log('paymentMethods get', paymentMethods)
    return paymentMethods.data
  }

  async getPaymentIntent(paymentIntentId) {
    const paymentIntent = await this.stripe.paymentIntents.retrieve(paymentIntentId)
    return paymentIntent
  }

  /*  
    in transaction
    paymentIntent: 'pi_......'
    transactionId: 'ch_......'
  */
  async refund(transactionId, paymentIntent) {
    const paymentIntentRegex = new RegExp('^pi_')
    const chargeRegex = new RegExp('^ch_')
    let id
    if (transactionId) {
      if (paymentIntentRegex.test(transactionId)) id = { payment_intent: transactionId }
      if (chargeRegex.test(transactionId)) id = { charge: transactionId }
    }
    if (paymentIntent) {
      if (paymentIntentRegex.test(paymentIntent)) id = { payment_intent: paymentIntent }
      if (chargeRegex.test(paymentIntent)) id = { charge: paymentIntent }
    }
    try {
      return await this.stripe.refunds.create(id)
    } catch (err) {
      return { error: err }
    }
  }

  async reverseTransfer(transfer) {
    try {
      return await this.stripe.transfers.createReversal(transfer)
    } catch (err) {
      return { error: err }
    }
  }

  async charge(customer, method, amount, currency = 'cad', metadata: Stripe.Metadata = {}) {
    amount = Math.trunc(amount)
    try {
      await this.stripe.paymentMethods.attach(method, { customer })
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount,
        currency,
        customer,
        payment_method: method,
        off_session: true,
        confirm: true,
        metadata
      })
      return paymentIntent
    } catch (err) {
      console.log('err in charge: ', err)
      return { err }
    }
  }

  async authorize(code, user) {
    const response: any = await this.stripe.oauth
      .token({ grant_type: 'authorization_code', code })
      .catch(err => {
        return { err }
      })
    console.log('response from oauth', response)
    const connectedAccountId = response.stripe_user_id
    this.saveAccountId(connectedAccountId, user.roles, user)
    const more = {
      redirect: user.roles === 'DRIVER',
      redirectUrl: 'bedodriver://payment/success/'
    }
    return { success: true, ...more }
  }

  async transfer(destination, amount, currency = 'cad', metadata: Stripe.Metadata = {}) {
    amount = Math.trunc(amount)
    const transfer = await this.stripe.transfers
      .create({ amount, currency, destination, metadata })
      .catch(err => {
        throw new ApolloError(err.message, '400')
      })
    return transfer
  }

  async getBalance() {
    const balance = await this.stripe.balance.retrieve().catch(err => {
      return { err }
    })
    return balance
  }

  async saveAccountId(connectedAccountId, role, user) {
    // Save the connected account ID from the response to your database.
    console.log(`AccountId : ${connectedAccountId}, role : ${role}, user : ${user} `)
    if (role === 'SHOP_ADMIN') {
      await shopService.findOneAndUpdate(
        { _id: user.shop },
        { stripeAccountId: connectedAccountId }
      )
    } else if (role === 'DRIVER') {
      await driverService.findOneAndUpdate(
        { _id: user.userId },
        { stripeAccountId: connectedAccountId }
      )
    }
  }
}
export default new StripeClass()
