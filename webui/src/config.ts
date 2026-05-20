export const WS_ENDPOINT: string =
  (import.meta.env.VITE_WS_ENDPOINT as string | undefined) ??
  'wss://default.execute-api.us-west-2.amazonaws.com/prod';
