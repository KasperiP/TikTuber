import { colors } from "../constants/colors";

export const logger = {
  info: (message: string) => {
    console.log(
      `${colors.FgGreen}|${
        colors.FgWhite
      } ${new Date().toLocaleTimeString()} - ${colors.FgGreen}INFO${
        colors.FgWhite
      }: ${message}`
    );
  },
  error: (message: string) => {
    console.log(
      `${colors.FgRed}|${colors.FgWhite} ${new Date().toLocaleTimeString()} - ${
        colors.FgRed
      }ERROR${colors.FgWhite}: ${message}`
    );
  },
  warn: (message: string) => {
    console.log(
      `${colors.FgYellow}|${
        colors.FgWhite
      } ${new Date().toLocaleTimeString()} - ${colors.FgYellow}WARN${
        colors.FgWhite
      }: ${message}`
    );
  },
};
