import { RequiredEnvs, checkRequiredEnvs, createEnvErrorMessage } from "./env";

describe('checkRequiredEnvs', () => {
  it('should return a record of valid required envs', () => {
    const validEnvs: Record<keyof RequiredEnvs, string> = {
      BASE_QUALLIO_ENDPOINT: 'https://api.quallio.com',
    };
    expect(checkRequiredEnvs(validEnvs)).toEqual(validEnvs);
  });

  it('should throw an error when a required env is missing', () => {
    const invalidEnvs: Record<keyof RequiredEnvs, string | undefined> = {
      BASE_QUALLIO_ENDPOINT: undefined,
    };
    expect(() => checkRequiredEnvs(invalidEnvs)).toThrow('BASE_QUALLIO_ENDPOINT is not set');
  });

  it('should handle multiple required envs', () => {
    const multipleEnvs: Record<keyof RequiredEnvs, string> = {
      BASE_QUALLIO_ENDPOINT: 'https://api.quallio.com',
      // Add more required envs here if needed
    };
    expect(checkRequiredEnvs(multipleEnvs)).toEqual(multipleEnvs);
  });
});

describe('createEnvErrorMessage', () => {
  it('should create an error message for a missing env', () => {
    const key = 'BASE_QUALLIO_ENDPOINT';
    const message = createEnvErrorMessage(key);
    expect(message).toBe(`${key} is not set`);
  });
});