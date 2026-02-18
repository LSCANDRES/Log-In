import { Injectable, LoggerService as NestLoggerService } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as pino from 'pino';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class LoggerService implements NestLoggerService {
  private logger: pino.Logger;

  constructor(private configService: ConfigService) {
    const logFilePath = this.configService.get<string>('LOG_FILE_PATH') || './logs/app.log';
    const logDir = path.dirname(logFilePath);

    // Ensure log directory exists
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }

    const streams: pino.StreamEntry[] = [
      // Console output (pretty)
      {
        level: 'debug',
        stream: pino.transport({
          target: 'pino-pretty',
          options: {
            colorize: true,
            translateTime: 'SYS:standard',
            ignore: 'pid,hostname',
          },
        }),
      },
      // File output (JSON for Loki/Promtail)
      {
        level: 'debug',
        stream: fs.createWriteStream(logFilePath, { flags: 'a' }),
      },
    ];

    this.logger = pino.default(
      {
        level: this.configService.get<string>('LOG_LEVEL') || 'debug',
      },
      pino.multistream(streams),
    );
  }

  log(message: string, context?: string) {
    this.logger.info({ context }, message);
  }

  error(message: string, trace?: string, context?: string) {
    this.logger.error({ context, trace }, message);
  }

  warn(message: string, context?: string) {
    this.logger.warn({ context }, message);
  }

  debug(message: string, context?: string) {
    this.logger.debug({ context }, message);
  }

  verbose(message: string, context?: string) {
    this.logger.trace({ context }, message);
  }

  // Custom auth logging methods
  logAuthEvent(
    action: string,
    data: {
      userId?: string;
      email?: string;
      ip?: string;
      userAgent?: string;
      provider?: string;
      success: boolean;
      details?: string;
    },
  ) {
    const logData = {
      context: 'AuthEvent',
      action,
      ...data,
    };

    if (data.success) {
      this.logger.info(logData, `Auth: ${action} - ${data.email || data.userId}`);
    } else {
      this.logger.warn(logData, `Auth: ${action} - ${data.email || data.userId}`);
    }
  }
}
