export interface RequiredEnvs {
  BASE_QUALLIO_ENDPOINT: string;
}

export interface OptionalEnvs {
  QUALLIO_API_KEY: string;
}

const requiredEnvs = {
  BASE_QUALLIO_ENDPOINT: process.env.BASE_QUALLIO_ENDPOINT,
};

const optionalEnvs = {
  QUALLIO_API_KEY: process.env.QUALLIO_API_KEY,
};

export function createEnvErrorMessage(key: keyof RequiredEnvs): string {
  return `${key.toUpperCase()} is not set`;
}

export function checkRequiredEnvs(envs: Record<keyof RequiredEnvs, string | undefined>): Record<keyof RequiredEnvs, string> {
  const checkedEnvs: Partial<Record<keyof RequiredEnvs, string>> = {};

  Object.entries(envs).forEach(([key, value]) => {
    if (!value) {
      const errorMessage = createEnvErrorMessage(key as keyof RequiredEnvs);
      throw new Error(errorMessage);
    }
    checkedEnvs[key as keyof RequiredEnvs] = value;
  });

  return checkedEnvs as Record<keyof RequiredEnvs, string>;
}

export const env = {
  ...checkRequiredEnvs(requiredEnvs),
  ...optionalEnvs
} as const as RequiredEnvs & OptionalEnvs;