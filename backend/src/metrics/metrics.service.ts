import { Injectable, OnModuleInit } from '@nestjs/common';
import * as client from 'prom-client';

@Injectable()
export class MetricsService implements OnModuleInit {
  // ==================== REGISTRO ====================
  private readonly registry: client.Registry;

  // ==================== CONTADORES (suben y no bajan) ====================

  // Logins totales (por resultado y provider)
  readonly loginTotal: client.Counter<string>;

  // Registros totales
  readonly registerTotal: client.Counter<string>;

  // Logouts totales
  readonly logoutTotal: client.Counter<string>;

  // Verificaciones de email
  readonly emailVerificationTotal: client.Counter<string>;

  // Refresh de tokens
  readonly tokenRefreshTotal: client.Counter<string>;

  // ==================== HISTOGRAMAS (miden duración) ====================

  // Duración de requests HTTP
  readonly httpRequestDuration: client.Histogram<string>;

  // ==================== GAUGES (suben y bajan) ====================

  // Usuarios activos en este momento (con sesión válida)
  readonly activeUsersGauge: client.Gauge<string>;

  constructor() {
    this.registry = new client.Registry();

    // Métricas por defecto de Node.js (CPU, memoria, event loop, etc.)
    client.collectDefaultMetrics({ register: this.registry });

    // ---- LOGIN ----
    this.loginTotal = new client.Counter({
      name: 'auth_login_total',
      help: 'Total number of login attempts',
      labelNames: ['result', 'provider'],
      registers: [this.registry],
    });

    // ---- REGISTER ----
    this.registerTotal = new client.Counter({
      name: 'auth_register_total',
      help: 'Total number of registration attempts',
      labelNames: ['result', 'provider'],
      registers: [this.registry],
    });

    // ---- LOGOUT ----
    this.logoutTotal = new client.Counter({
      name: 'auth_logout_total',
      help: 'Total number of logouts',
      registers: [this.registry],
    });

    // ---- EMAIL VERIFICATION ----
    this.emailVerificationTotal = new client.Counter({
      name: 'auth_email_verification_total',
      help: 'Total email verifications',
      labelNames: ['result'],
      registers: [this.registry],
    });

    // ---- TOKEN REFRESH ----
    this.tokenRefreshTotal = new client.Counter({
      name: 'auth_token_refresh_total',
      help: 'Total token refresh attempts',
      labelNames: ['result'],
      registers: [this.registry],
    });

    // ---- HTTP DURATION ----
    this.httpRequestDuration = new client.Histogram({
      name: 'http_request_duration_seconds',
      help: 'Duration of HTTP requests in seconds',
      labelNames: ['method', 'route', 'status_code'],
      buckets: [0.01, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10],
      registers: [this.registry],
    });

    // ---- ACTIVE USERS ----
    this.activeUsersGauge = new client.Gauge({
      name: 'auth_active_users',
      help: 'Number of currently active users',
      registers: [this.registry],
    });
  }

  onModuleInit() {
    // Registry listo al iniciar
  }

  // Devuelve todas las métricas en formato Prometheus
  async getMetrics(): Promise<string> {
    return this.registry.metrics();
  }

  // Content-Type que espera Prometheus
  getContentType(): string {
    return this.registry.contentType;
  }
}
