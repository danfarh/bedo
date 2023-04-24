export default function env(key: string, defaultValue: any) {
  let value = process.env[key]

  // if value is undefined, null or empty string
  if (!value) {
    if (defaultValue) return defaultValue
    return value
  }

  // cast null
  if (value == 'null') {
    return null
  }

  // cast boolean
  if (['true', 'false'].includes(value)) {
    return value == 'true'
  }

  // cast numbers
  if (/^[\d]*\.?[\d]*$/.test(value)) {
    return Number(value)
  }

  return value
}
