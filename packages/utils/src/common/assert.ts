export function defined<T>(value: T | null | undefined, message?: string): asserts value is T {
  if (value === undefined || value === null) {
    throw new Error(message || "value is undefined")
  }
}

export function required<T>(value: T | null | undefined, message?: string): T {
  defined(value, message)
  return value
}
