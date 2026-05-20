export const WS_ENDPOINT: string =
  (import.meta.env.VITE_WS_ENDPOINT as string | undefined) ??
  'wss://0l4abmzfu0.execute-api.us-west-2.amazonaws.com/prod';
