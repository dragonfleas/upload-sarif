import * as core from '@actions/core'
import { validateSarif } from './util/validateSarif'
import { sendSarif } from './util/sendSarif'
import * as fs from 'fs'
import type { Sarif } from './util/types'
import { env } from './env'
import { SARIF_FILE_NOT_VALID } from './errors'
/**
 * The main function for the action.
 * @returns {Promise<void>} Resolves when the action is complete.
 */
export async function run(): Promise<void> {
  try {
    const inputs = {
      sarifFile: core.getInput('sarif_file', { required: true }),
      apiKey: core.getInput('api_key', { required: true })
    }

    core.debug(`Processing SARIF file ${inputs.sarifFile}`)
    const isValid = await validateSarif(inputs.sarifFile)

    if (!isValid) {
      throw new Error(SARIF_FILE_NOT_VALID)
    }

    const sarifContent = fs.readFileSync(inputs.sarifFile, 'utf8') as unknown as Sarif

    const sarifReturn = await sendSarif({
      endpoint: env.BASE_QUALLIO_ENDPOINT,
      sarifContent,
      apiKey: inputs.apiKey
    })

    // Set outputs for other workflow steps to use
    core.setOutput('sarif-id', sarifReturn.id)
  } catch (error) {
    if (error instanceof Error) {
      core.error(error.message)
      core.setFailed(error.message)
    }
  }
}
