import winston from "winston";
import { env } from "@config/env";
// import Transport from "winston-transport";
// import config from ".";
// import { logs, SeverityNumber } from "@opentelemetry/api-logs";

// class OpenTelemetryTransport extends Transport {
//   private getOtelLogger: () => ReturnType<typeof logs.getLogger>;

//   constructor(opts?: Transport.TransportStreamOptions) {
//     super(opts);

//     // Get the logger after instrumentation is initialized
//     this.getOtelLogger = () => logs.getLogger("winston", "1.0.0");
//   }

//   log(info: any, callback: () => void): void {
//     setImmediate(() => {
//       this.emit("logged", info);
//     });

//     try {
//       const otelLogger = this.getOtelLogger();

//       const severityMap: Record<string, SeverityNumber> = {
//         error: SeverityNumber.ERROR,
//         warn: SeverityNumber.WARN,
//         info: SeverityNumber.INFO,
//         http: SeverityNumber.INFO,
//         verbose: SeverityNumber.DEBUG,
//         debug: SeverityNumber.DEBUG,
//         silly: SeverityNumber.TRACE,
//       };

//       otelLogger.emit({
//         severityNumber: severityMap[info.level] ?? SeverityNumber.INFO,
//         severityText: String(info.level).toUpperCase(),
//         body: info.message,
//         attributes: {
//           "log.level": info.level,
//           "service.name": config.OTEL_SERVICE_NAME,

//           ...(info.stack && {
//             "exception.stacktrace": info.stack,
//           }),

//           // Include all extra metadata
//           ...Object.keys(info)
//             .filter((key) => !["level", "message", "timestamp", "label"].includes(key))
//             .reduce<Record<string, unknown>>((acc, key) => {
//               acc[key] = info[key];
//               return acc;
//             }, {}),
//         },
//       });
//     } catch {
//       // Silently fail if OpenTelemetry is not initialized yet
//     }

//     callback();
//   }
// }

// Create Winston logger with OpenTelemetry support
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL ?? "info",
  format: winston.format.combine(
    winston.format.timestamp({
      format: "YYYY-MM-DD HH:mm:ss",
    }),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.json()
  ),
  defaultMeta: {
    service: env.APP_NAME,
  },
  transports: [
    // Console transport (dev-friendly)
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.printf(({ level, message, timestamp, ...metadata }) => {
          let msg = `${timestamp} [${level}]: ${message}`;

          if (level === "error" && Object.keys(metadata).length > 0) {
            msg += ` ${JSON.stringify(metadata)}`;
          }

          return msg;
        })
      ),
    }),

    // OpenTelemetry transport
    // new OpenTelemetryTransport({ level: "debug" }),
  ],
});

// // Morgan HTTP logger integration
// interface LoggerWithStream extends winston.Logger {
//   stream: {
//     write: (message: string) => void;
//   };
// }

// (logger as LoggerWithStream).stream = {
//   write: (message: string) => {
//     logger.info(message.trim());
//   },
// };

export default logger;
