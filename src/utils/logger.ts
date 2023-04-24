const { APP_DEBUG } = process.env
export default function log(name: String, value: any) {
  if (APP_DEBUG) {
    const Value = String(value)
    console.log(`${name}  :  ${Value}`)
  }
}
