export const env = {
  apiUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api',
  nodeEnv: process.env.NODE_ENV || 'development',
  isDev: process.env.NODE_ENV === 'development',
};

