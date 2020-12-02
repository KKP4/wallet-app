export const config = {
  database: {
    host: getConfig("DB_HOST"),
    port: Number(getConfig("DB_PORT")),
    database: getConfig("DB_NAME"),
    user: getConfig("DB_USER"),
    password: getConfig("DB_PASS"),
  },
};

/**
 * Check that an env var is set and optionally one of allowed values.
 */
function getConfig(envKey: string, allowedValues?: string): string {
  const envValue = process.env[envKey];

  if (envValue === undefined) {
    // All configs must be explicitly set.
    console.error(`Environment variable ${envKey} is missing.`);
    throw new Error("Bad config.");
  } else {
    if (allowedValues) {
      // If allowed values are provided, make sure the env var is one of them.
      if (allowedValues.includes(envValue)) {
        return envValue;
      } else {
        throw new Error(
          `Environment variable ${envKey} is not one of allowed values. Allowed values: [ ${allowedValues} ]`
        );
      }
    } else {
      return envValue;
    }
  }
}
