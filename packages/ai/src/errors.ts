export class InvalidJsonError extends Error {
  readonly rawOutput: string;
  constructor(message: string, rawOutput: string, cause?: unknown) {
    super(message, cause !== undefined ? { cause } : undefined);
    this.name = 'InvalidJsonError';
    this.rawOutput = rawOutput;
  }
}

export class ModelRefusalError extends Error {
  constructor(
    message: string,
    readonly modelOutput: string,
  ) {
    super(message);
    this.name = 'ModelRefusalError';
  }
}
