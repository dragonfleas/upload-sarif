/**
 * Unit tests for the action's main functionality, src/main.ts
 */

import * as core from '@actions/core'
import * as main from '../main'
import * as fs from 'fs'
import * as path from 'path'
import { sendSarif } from '../util/sendSarif'
import type { QuallioReturn } from '../util/types'

jest.mock('../util/sendSarif', () => ({
  sendSarif: jest.fn()
}))

const mockSendSarif = sendSarif as jest.MockedFunction<typeof sendSarif>

describe('action', () => {
  let debugMock: jest.SpiedFunction<typeof core.debug>
  let errorMock: jest.SpiedFunction<typeof core.error>
  let getInputMock: jest.SpiedFunction<typeof core.getInput>
  let setFailedMock: jest.SpiedFunction<typeof core.setFailed>
  let setOutputMock: jest.SpiedFunction<typeof core.setOutput>

  beforeEach(() => {
    jest.resetAllMocks()

    debugMock = jest.spyOn(core, 'debug').mockImplementation()
    errorMock = jest.spyOn(core, 'error').mockImplementation()
    getInputMock = jest.spyOn(core, 'getInput').mockImplementation()
    setFailedMock = jest.spyOn(core, 'setFailed').mockImplementation()
    setOutputMock = jest.spyOn(core, 'setOutput').mockImplementation()
  })

  it('processes the SARIF file and returns a sarif-id', async () => {
    const mockSarifContent = JSON.stringify({ version: '2.1.0', runs: [] })
    const mockSarifPath = path.join(__dirname, 'mock-sarif.sarif')
    fs.writeFileSync(mockSarifPath, mockSarifContent)

    getInputMock.mockReturnValueOnce(mockSarifPath).mockReturnValueOnce('test-api-key')

    const mockQuallioReturn: QuallioReturn = {
      id: '1234567890',
      scanLink: 'https://example.com/scans/1234567890'
    }
    mockSendSarif.mockResolvedValueOnce(mockQuallioReturn)

    await main.run()

    expect(debugMock).toHaveBeenCalledWith(`Processing SARIF file ${mockSarifPath}`)
    expect(setOutputMock).toHaveBeenCalledWith('sarif-id', mockQuallioReturn.id)
    expect(errorMock).not.toHaveBeenCalled()
    expect(setFailedMock).not.toHaveBeenCalled()

    fs.unlinkSync(mockSarifPath)
  })

  it('sets a failed status when SARIF file is not valid', async () => {
    getInputMock.mockReturnValueOnce('non-existent-file.sarif')

    await main.run()

    expect(setFailedMock).toHaveBeenCalledWith('SARIF file is not valid')
    expect(errorMock).toHaveBeenCalledWith('SARIF file is not valid')
  })
})
