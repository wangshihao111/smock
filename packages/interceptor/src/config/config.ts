export const API_HOST =
  process.env.NODE_ENV === "development"
    ? "http://localhost:10011"
    : `${window.location.protocol}//${window.location.host}`;
