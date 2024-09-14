import Ajv from 'ajv'
import addFormats from "ajv-formats"

const ajv = new Ajv({
  unicodeRegExp: false,
  allErrors: true
})
addFormats(ajv)

export default ajv