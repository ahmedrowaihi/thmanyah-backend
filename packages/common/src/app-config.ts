import {
  INestApplication,
  ValidationPipe,
  VersioningType,
} from "@nestjs/common";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { apiReference } from "@scalar/nestjs-api-reference";
import helmet from "helmet";
import {
  HttpExceptionFilter,
  LoggingInterceptor,
  RequestIdInterceptor,
  ResponseSanitizerInterceptor,
} from ".";
import { NextFunction, Request, Response } from "express";

export interface AppConfigOptions {
  title: string;
  description: string;
  version: string;
  tag: string;
  tagDescription: string;
  serverUrl: string;
  serverDescription: string;
  port: number;
  corsOrigins?: string[];
  allowedHeaders?: string[];
  interceptors?: any[];
}

/**
 * Attach security headers to the application
 * @param app - The Nest application instance
 */
export function attachSecurity(
  app: INestApplication,
  excludePaths: `/${string}`[] = []
): void {
  app.use(helmet());

  // Disable CSP for Scalar API Reference
  if (excludePaths.length > 0) {
    excludePaths.forEach((path) => {
      app.use(path, (_: Request, res: Response, next: NextFunction) => {
        res.removeHeader("Content-Security-Policy");
        next();
      });
    });
  }
}

/**
 * Attach CORS to the application
 * @param app - The Nest application instance
 * @param origins - The origins to allow CORS from
 * @param allowedHeaders - The headers to allow
 */
export function attachCors(
  app: INestApplication,
  origins: string[] = [
    "http://localhost:3000", // Frontend development
    "http://localhost:3001", // CMS API
    "http://localhost:3002", // Discovery API
  ],
  allowedHeaders: string[] = [
    "Content-Type",
    "Authorization",
    "X-Requested-With",
    "x-request-id",
  ]
): void {
  app.enableCors({
    origin: origins,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: allowedHeaders,
    credentials: true,
    maxAge: 86400, // 24 hours
  });
}

/**
 * Attach versioning to the application
 * @param app - The Nest application instance
 */
export function attachVersioning(app: INestApplication): void {
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: "1",
  });
}

/**
 * Attach pipes to the application
 * @param app - The Nest application instance
 */
export function attachPipes(app: INestApplication): void {
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    })
  );
}

/**
 * Attach interceptors to the application
 * @param app - The Nest application instance
 * @param additionalInterceptors - Additional interceptors to attach
 */
export function attachInterceptors(
  app: INestApplication,
  additionalInterceptors: any[] = []
): void {
  const defaultInterceptors = [
    new RequestIdInterceptor(),
    new LoggingInterceptor(),
    new ResponseSanitizerInterceptor(),
  ];

  app.useGlobalInterceptors(...defaultInterceptors, ...additionalInterceptors);
}

/**
 * Attach filters to the application
 * @param app - The Nest application instance
 */
export function attachFilters(app: INestApplication): void {
  app.useGlobalFilters(new HttpExceptionFilter());
}

/**
 * Attach documentation to the application
 * @param app - The Nest application instance
 * @param options - The application configuration options
 */
export function attachDocs(
  app: INestApplication,
  options: AppConfigOptions
): void {
  // OpenAPI configuration
  const swaggerConfig = new DocumentBuilder()
    .setTitle(options.title)
    .setDescription(options.description)
    .setVersion(options.version)
    .addTag(options.tag, options.tagDescription)
    .addServer(options.serverUrl, options.serverDescription)
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);

  // Serve OpenAPI JSON
  SwaggerModule.setup("openapi", app, document, {
    jsonDocumentUrl: "openapi.json",
  });

  // Scalar API Reference
  app.use(
    "/reference",
    apiReference({
      content: document,
      theme: "default",
    })
  );
}

/**
 * Log startup information
 * @param options - The application configuration options
 */
export function logStartupInfo(options: AppConfigOptions): void {
  const { title, port } = options;
  const emoji = title.includes("CMS") ? "🚀" : "🔍";

  console.log(`${emoji} ${title} running on http://localhost:${port}`);
  console.log(
    `📚 Scalar API Reference available at http://localhost:${port}/reference`
  );
  console.log(
    `📄 OpenAPI JSON available at http://localhost:${port}/openapi.json`
  );
}

/**
 * Configure the application
 * @param app - The Nest application instance
 * @param options - The application configuration options
 * @param additionalInterceptors - Additional interceptors to attach
 */
export function configureApp(
  app: INestApplication,
  options: AppConfigOptions,
  additionalInterceptors: any[] = []
): void {
  // Attach all app configurations
  attachSecurity(app, ["/reference"]);
  attachCors(app, options.corsOrigins, options.allowedHeaders);
  attachVersioning(app);
  attachPipes(app);
  attachInterceptors(app, additionalInterceptors);
  attachFilters(app);
  attachDocs(app, options);
}
