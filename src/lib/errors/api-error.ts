export type ApiErrorInput = {
  code: string;
  message: string;
  requestId?: string;
  retryable?: boolean;
  status?: number;
  fieldErrors?: Record<string, string[]>;
};

export class ApiError extends Error {
  readonly code: string;
  readonly requestId: string | undefined;
  readonly retryable: boolean;
  readonly status: number | undefined;
  readonly fieldErrors: Record<string, string[]> | undefined;

  constructor(input: ApiErrorInput) {
    super(input.message);
    this.name = "ApiError";
    this.code = input.code;
    this.requestId = input.requestId;
    this.retryable = input.retryable ?? false;
    this.status = input.status;
    this.fieldErrors = input.fieldErrors;
  }
}
