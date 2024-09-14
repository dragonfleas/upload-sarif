import { sendSarif } from './sendSarif';
import * as core from '@actions/core';
import { Sarif, QuallioReturn } from './types';

// Mock the global fetch
const originalFetch = global.fetch;
jest.spyOn(global, 'fetch');

// Mock @actions/core
jest.mock('@actions/core');

describe('sendSarif', () => {
  const mockSarifContent: Sarif = { version: '2.1.0', runs: [], type: 'object', required: [] };
  const mockOptions = {
    endpoint: 'https://api.example.com/ingest-sarif',
    sarifContent: mockSarifContent,
    apiKey: 'test-api-key'
  };

  beforeEach(() => {
    jest.resetAllMocks();
  });

  afterAll(() => {
    global.fetch = originalFetch;
  });

  it('should send SARIF content successfully', async () => {
    const mockResponse: QuallioReturn = { scanLink: 'https://api.example.com/sarif/123', id: '12345' };
    (global.fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce({
      ok: true,
      json: jest.fn().mockResolvedValue(mockResponse)
    } as unknown as Response);

    const result = await sendSarif(mockOptions);

    expect(global.fetch).toHaveBeenCalledWith(
      'https://api.example.com/ingest-sarif',
      {
        method: 'POST',
        headers: new Headers({
          'Content-Type': 'application/json',
          'Authorization': 'Bearer test-api-key'
        }),
        body: JSON.stringify({ sarif: mockSarifContent })
      }
    );
    expect(result).toEqual(mockResponse);
  });

  it('should handle non-ok response', async () => {
    (global.fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce({
      ok: false,
      statusText: 'Bad Request',
      json: jest.fn().mockResolvedValue({ error: 'Invalid SARIF' })
    } as unknown as Response);

    await expect(sendSarif(mockOptions)).rejects.toThrow('Invalid SARIF');

    expect(core.setFailed).toHaveBeenCalledWith('Invalid SARIF');
  });

  it('should handle non-JSON response', async () => {
    (global.fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce({
      ok: true,
      json: jest.fn().mockRejectedValue('INVALID_JSON'),
      body: jest.fn().mockResolvedValue('INVALID_JSON')
    } as unknown as Response);

    await expect(sendSarif(mockOptions)).rejects.toThrow('Failed to parse response');
  });

  it('should throw an error if the api key is invalid', async () => {
    const mockResponse = {
      error: 'Invalid API key'
    } as unknown as QuallioReturn;

    (global.fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce({
      ok: true,
      json: jest.fn().mockResolvedValue(mockResponse),
      body: jest.fn().mockResolvedValue(mockResponse)
    } as unknown as Response);

    await expect(sendSarif(mockOptions)).rejects.toThrow('Invalid API key');
  });

  it('should throw an error when the request fails', async () => {
    (global.fetch as jest.MockedFunction<typeof fetch>).mockRejectedValueOnce(new Error('Network error'));

    await expect(sendSarif(mockOptions)).rejects.toThrow('Network error');
    expect(core.setFailed).toHaveBeenCalledWith('Error sending SARIF file: Error: Network error');
  });
});