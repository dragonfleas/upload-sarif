import * as core from '@actions/core'
import { validateSarif } from './util/validateSarif'

/**
 * The main function for the action.
 * @returns {Promise<void>} Resolves when the action is complete.
 */
export async function run(): Promise<void> {
  try {
    const filename: string = core.getInput('sarif_file')
    core.debug(`Processing SARIF file ${filename}`)
    const isValid = await validateSarif(filename)

    if (!isValid) {
      throw new Error('SARIF file is not valid')
    }

    // Set outputs for other workflow steps to use
    core.setOutput('sarif-id', '123')
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message)
  }
}
