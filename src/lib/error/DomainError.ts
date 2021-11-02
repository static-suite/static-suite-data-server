/**
 * Defines a custom error that extends the Error class.
 *
 * @internal
 */
export class DomainError extends Error {
  constructor(message: string) {
    super(message);

    // Ensure the name of this error is the same as the class name.
    this.name = this.constructor.name;

    // This clips the constructor invocation from the stack trace.
    // It's not absolutely essential, but it does make the stack trace a little nicer.
    // @see https://nodejs.org/api/errors.html#errors_error_capturestacktrace_targetobject_constructoropt
    Error.captureStackTrace(this, this.constructor);
  }
}
