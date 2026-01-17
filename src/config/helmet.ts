import helmet from "helmet";
const helmetMiddleware = helmet({
  hidePoweredBy: true,
  frameguard: { action: "deny" },
  noSniff: true,
  xssFilter: true,
  referrerPolicy: { policy: "no-referrer" },
});

export default helmetMiddleware;