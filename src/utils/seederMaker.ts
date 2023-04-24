type seederMakerType = (custom?: Object | Number, count?: Number) => Promise<Array<Object>>
type getSeedDataType = (custom?: any) => Promise<Object>

export default function(Model: any, getSeedData: getSeedDataType): seederMakerType {
  return async (custom: Object | Number = {}, count: Number = 1): Promise<Array<any>> => {
    let docsCount = count
    let customProps = custom
    if (typeof custom === 'number') {
      docsCount = custom
      customProps = {}
    }

    const promises: Array<Promise<any>> = []
    for (let i = 0; i < docsCount; i++) {
      const seedData = await getSeedData(customProps)
      const data = {
        ...seedData,
        ...customProps
      }
      promises.push(Model.create(data))
    }
    const created: Array<Object> = await Promise.all(promises)

    return created
  }
}
