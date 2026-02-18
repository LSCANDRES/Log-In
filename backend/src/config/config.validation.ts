// Simple config validation (no extra deps needed)
export const configValidationSchema = {
  validate: (config: Record<string, any>) => {
    const required = ['DATABASE_URL', 'JWT_SECRET', 'JWT_REFRESH_SECRET'];
    const missing = required.filter((key) => !config[key]);
    if (missing.length > 0) {
      return {
        error: new Error(`Missing env variables: ${missing.join(', ')}`),
        value: config,
      };
    }
    return { value: config };
  },
};
