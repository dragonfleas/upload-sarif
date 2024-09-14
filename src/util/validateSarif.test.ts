import { validateSarif } from './validateSarif'
import * as path from 'path'
import * as core from '@actions/core'

jest.mock('@actions/core')

describe('validateSarif', () => {
  const mockCoreError = jest.spyOn(core, 'error')
  const mockCoreInfo = jest.spyOn(core, 'info')

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should return true for a valid SARIF file', async () => {
    const validFilePath = path.join(__dirname, 'tests', 'data', 'semgrep.sarif')
    const result = await validateSarif(validFilePath)
    expect(result).toBe(true)
    expect(mockCoreInfo).toHaveBeenCalledWith('SARIF file is valid')
  })

  it('should return false for an invalid SARIF file', async () => {
    const invalidFilePath = path.join(__dirname, 'tests', 'data', 'invalid.sarif')
    const result = await validateSarif(invalidFilePath)
    expect(result).toBe(false)
    expect(mockCoreError).toHaveBeenCalledWith(expect.stringContaining('SARIF validation failed'))
  })

  it('should return false for a file with invalid JSON', async () => {
    const invalidJsonPath = path.join(__dirname, 'tests', 'data', 'invalid_json.sarif')
    const result = await validateSarif(invalidJsonPath)
    expect(result).toBe(false)
    expect(mockCoreError).toHaveBeenCalledWith(expect.stringContaining('Error validating SARIF file'))
  })

  it('should return false for a non-existent file', async () => {
    const nonExistentPath = path.join(__dirname, 'tests', 'data', 'non_existent.sarif')
    const result = await validateSarif(nonExistentPath)
    expect(result).toBe(false)
    expect(mockCoreError).toHaveBeenCalledWith(expect.stringContaining('Error validating SARIF file'))
  })
})
