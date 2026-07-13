import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        dusk: {
          top: "#F2C879",
          mid: "#C97B4A",
          deep: "#4A2A45",
        },
        night: {
          DEFAULT: "#221A2E",
          deep: "#16111F",
        },
        cream: {
          DEFAULT: "#FBF1E1",
          dim: "#E9DCC4",
        },
        ember: "#C4562E",
        gold: "#E8A54B",
        sage: "#93A583",
      },
    },
  },
};

export default config;