export const URL =
  !process.env.NODE_ENV || process.env.NODE_ENV === "development"
    ? "http://localhost:4000"
    : "https://tan-victorious-dibbler.cyclic.app/";

