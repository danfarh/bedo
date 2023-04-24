// database request
import PassengerCanceledTrip from './schema'
import ServiceBase from '../../utils/serviceBase'

export default new (class service extends ServiceBase {
  async findByPassengerId(id) {
    return PassengerCanceledTrip.findOne({ passenger: id }).exec()
  }

  async save(data) {
    await PassengerCanceledTrip.create(data)
  }

  async update(data) {
    const passengerCanceledTrip: any = await PassengerCanceledTrip.findOne({
      passenger: data.passengerId
    })
    if (passengerCanceledTrip) {
      const { trips } = passengerCanceledTrip
      trips.push({
        reasonId: data.reasonId || null,
        reason: data.reason || null
      })
      passengerCanceledTrip.save()
    }
  }
})(PassengerCanceledTrip)
