/**
 * Unit tests for the action's main functionality, src/main.ts
 *
 * These should be run as if the action was called from a workflow.
 * Specifically, the inputs listed in `action.yml` should be set as environment
 * variables following the pattern `INPUT_<INPUT_NAME>`.
 */

import * as core from '@actions/core'
import * as main from '../src/main'
import * as fs from 'fs'
import * as path from 'path'
import type { QuallioReturn } from '../src/util/types'

// Mock the action's main function
const runMock = jest.spyOn(main, 'run')

// Mock the fetch function
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({ id: '1234567890', scanLink: 'https://localhost:3000/scans/1234567890' }),
  })
) as jest.Mock;

// Mock the GitHub Actions core library
let debugMock: jest.SpiedFunction<typeof core.debug>
let errorMock: jest.SpiedFunction<typeof core.error>
let getInputMock: jest.SpiedFunction<typeof core.getInput>
let setFailedMock: jest.SpiedFunction<typeof core.setFailed>
let setOutputMock: jest.SpiedFunction<typeof core.setOutput>

process.env.BASE_QUALLIO_ENDPOINT = 'example.com'

describe('action', () => {
  beforeEach(() => {
    jest.clearAllMocks()

    debugMock = jest.spyOn(core, 'debug').mockImplementation()
    errorMock = jest.spyOn(core, 'error').mockImplementation()
    getInputMock = jest.spyOn(core, 'getInput').mockImplementation()
    setFailedMock = jest.spyOn(core, 'setFailed').mockImplementation()
    setOutputMock = jest.spyOn(core, 'setOutput').mockImplementation()
  })

  it('processes the SARIF file and returns a stubbed sarif-id', async () => {
    // Create a mock SARIF file
    const mockSarifContent = JSON.stringify({ version: '2.1.0', runs: [] })
    const mockSarifPath = path.join(__dirname, 'mock-sarif.sarif')

    jest.mock('../src/util/sendSarif', () => ({
      sendSarif: jest.fn().mockResolvedValueOnce({
        id: '1234567890',
        scanLink: 'https://localhost:3000/scans/1234567890'
      } as QuallioReturn)
    }));
    fs.writeFileSync(mockSarifPath, mockSarifContent)

    // Set the action's inputs as return values from core.getInput()
    getInputMock.mockImplementation(name => {
      switch (name) {
        case 'sarif_file':
          return mockSarifPath
        case 'api_key':
          return 'test-api-key'
        default:
          return ''
      }
    })

    await main.run()
    expect(runMock).toHaveReturned()
    // Verify that all of the core library functions were called correctly
    expect(debugMock).toHaveBeenCalledWith(
      `Processing SARIF file ${mockSarifPath}`
    )
    expect(setOutputMock).toHaveBeenCalledWith('sarif-id', '1234567890')
    expect(errorMock).not.toHaveBeenCalled()
    expect(setFailedMock).not.toHaveBeenCalled()

    // Clean up the mock SARIF file
    fs.unlinkSync(mockSarifPath)
  })

  it('sets a failed status when SARIF file is not found', async () => {
    // Set the action's inputs as return values from core.getInput()
    getInputMock.mockImplementation(name => {
      switch (name) {
        case 'sarif_file':
          return 'non-existent-file.sarif'
        default:
          return ''
      }
    })

    await main.run()
    expect(runMock).toHaveReturned()

    // Verify that all of the core library functions were called correctly
    expect(setFailedMock).toHaveBeenCalledWith(
      expect.stringContaining('SARIF file is not valid')
    )
    expect(errorMock).toHaveBeenCalledWith('SARIF file is not valid')
  })

  it('sets a failed status when the BASE_QUALLIO_ENDPOINT is not set', async () => {
    const originalEndpoint = process.env.BASE_QUALLIO_ENDPOINT;
    delete process.env.BASE_QUALLIO_ENDPOINT;

    await main.run();

    expect(setFailedMock).toHaveBeenCalledWith(
      expect.stringContaining('BASE_QUALLIO_ENDPOINT is not set')
    );
    expect(errorMock).toHaveBeenCalledWith('BASE_QUALLIO_ENDPOINT is not set');
  })
})
