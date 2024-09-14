import * as fs from 'fs'
import * as core from '@actions/core'
import sarifSchema from '../schema/sarif-schema-2.1.0.json'
import ajv from '../modules/ajv'

/**
 * Validates a SARIF file against the SARIF schema.
 * @param {string} filePath - The path to the SARIF file.
 * @returns {Promise<boolean>} A promise that resolves to true if the file is valid, false otherwise.
 */
export async function validateSarif(filePath: string): Promise<boolean> {
  try {
    const sarifContent: string = await fs.promises.readFile(filePath, 'utf8')
    const sarifJson: unknown = JSON.parse(sarifContent)

    const validate = ajv.compile<typeof sarifSchema>(sarifSchema)

    if (!validate(sarifJson)) {
      core.debug(`SARIF validation failed: ${JSON.stringify(validate.errors)}`)
      return false
    } else {
      core.info('SARIF file is valid')
      return true
    }
  } catch (error) {
    if (error instanceof Error) {
      core.debug(`Error validating SARIF file: ${error.message}`)
      return false
    }
    core.debug(`Error validating SARIF file: ${String(error)}`)
    return false
  }
}
