import * as core from '@actions/core'
import { Sarif, type QuallioReturn } from './types';

interface SendSarifOptions {
  endpoint: string;
  sarifContent: Sarif;
  apiKey: string;
}

const createHeaders = (apiKey: SendSarifOptions['apiKey']): HeadersInit => {
  return new Headers({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${apiKey}`
  })
}

const method = 'POST';

/**
 * Sends a SARIF file to a specified endpoint.
 *
 * @param {Object} options - The options for sending the SARIF file.
 * @param {string} options.endpoint - The URL endpoint to send the SARIF file to.
 * @param {Sarif} options.sarifContent - The content of the SARIF file as a string.
 * @param {string} options.apiKey - The API key for authentication.
 * @returns {Promise<void>} A promise that resolves when the SARIF file is successfully sent.
 * @throws {Error} If there's an error sending the SARIF file.
 */
export async function sendSarif({
  endpoint,
  sarifContent,
  apiKey
}: SendSarifOptions): Promise<QuallioReturn> {
  try {
    const response = await fetch(endpoint, {
      method,
      headers: createHeaders(apiKey),
      body: JSON.stringify({ sarif: sarifContent })
    });

    if (!response.ok) {
      core.debug(JSON.stringify(await response.json()))
      core.setFailed(`Failed to submit SARIF file: ${response.statusText}`)
    }

    const res = await response.json().catch(() => {
      throw new Error('Failed to parse response');
    }) as unknown as QuallioReturn;

    if (res.error) {
      core.setFailed(res.error);
      throw new Error(res.error);
    }

    return res;
  } catch (error) {
    core.setFailed(`Error sending SARIF file: ${String(error)}`);
    throw error
  }
}
