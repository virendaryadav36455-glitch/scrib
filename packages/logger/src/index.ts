import winston from "winston";

type LoggerLevel = "error" | "info" | "debug";
const nodeEnv = process.env.NODE_ENV ?? "development";

const level: LoggerLevel =
  (process.env.LOGGER_LEVEL as LoggerLevel | undefined) ??
  (nodeEnv === "development" ? "debug" : "error");

const isDevelopment = nodeEnv === "development";

const format = isDevelopment
  ? winston.format.combine(
      winston.format.colorize(),
      winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
      winston.format.printf(({ timestamp, level, message, ...meta }) => {
        const metaString = Object.keys(meta).length
          ? `\n${JSON.stringify(meta, null, 2)}`
          : "";
        return `${timestamp} [${level}]: ${message}${metaString}`;
      }),
    )
  : winston.format.combine(winston.format.timestamp(), winston.format.json());

export const logger = winston.createLogger({
  level: level,
  format: format,
  transports: [new winston.transports.Console()],
});
