export class ServiceUnavailableError extends Error {
  constructor(message = 'Service Unavailable') {
    super(message);
    this.name = 'ServiceUnavailableError';
  }
}
