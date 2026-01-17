import Handlebars from "handlebars";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import { buttonStyles } from "./helpers/button.helper";
import { formatDate } from "./helpers/date.helper";
import { formatCurrency } from "./helpers/currency.helper";
import { existsSync, readdirSync, readFileSync } from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const TEMPLATES_DIR = path.join(__dirname, "../mail_templates");

const registerHelpers = () => {
  Handlebars.registerHelper("buttonVariant", (variant: keyof typeof buttonStyles) => {
    return buttonStyles[variant] || buttonStyles.primary;
  });
  Handlebars.registerHelper("formatDate", (date: Date) => formatDate(date));
  Handlebars.registerHelper("formatCurrency", (amount: number, currency: string) =>
    formatCurrency(amount, currency)
  );
};

const loadTemplate = (templatePath: string) => {
  const tempPath = path.join(TEMPLATES_DIR, `${templatePath}.hbs`);
  if (!existsSync(tempPath)) {
    throw new Error(`Template file not found: ${tempPath}`);
  }
  const templateContent = readFileSync(tempPath, "utf-8");
  return Handlebars.compile(templateContent);
};

const registerPartials = () => {
  const partialsDir = path.join(TEMPLATES_DIR, "partials");
  if (!existsSync(partialsDir)) throw new Error(`Partials directory not found: ${partialsDir}`);
  const partialFiles = readdirSync(partialsDir);
  partialFiles.forEach((file) => {
    if (file.endsWith(".hbs")) {
      const partialName = path.basename(file, ".hbs");
      const partialPath = path.join(partialsDir, file);
      const partialContent = readFileSync(partialPath, "utf-8");
      Handlebars.registerPartial(partialName, partialContent);
    }
  });
};

export const initializeTemplates = () => {
  registerPartials();
  registerHelpers();
};

export const renderTemplate = (templatePath: string, layoutPath: string, context: any): string => {
  const contentTemplate = loadTemplate(templatePath);
  const contentHtml = contentTemplate(context);
  const layoutTemplate = loadTemplate(`layouts/${layoutPath}`);
  return layoutTemplate({ ...context, body: contentHtml });
};

initializeTemplates();

export default renderTemplate;
