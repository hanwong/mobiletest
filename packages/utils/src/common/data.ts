export type InputType = string | Buffer | Uint8Array

export default class Data {
  private data: Buffer

  constructor(input: InputType) {
    this.data = this.convertInputToBuffer(input)
  }

  private convertInputToBuffer(input: InputType): Buffer {
    if (input instanceof Buffer || input instanceof Uint8Array) {
      return Buffer.from(input)
    }

    if (typeof input === "string") {
      return this.handleStringInput(input)
    }

    throw new Error("Unsupported input type")
  }

  private handleStringInput(input: string): Buffer {
    if (input.startsWith("0x")) {
      return this.convertHexToBuffer(input.slice(2))
    }
    if (this.isValidHex(input)) {
      return this.convertHexToBuffer(input)
    }
    if (this.isBase64(input)) {
      return Buffer.from(input, "base64")
    }
    return Buffer.from(input, "utf8")
  }

  private convertHexToBuffer(hexString: string): Buffer {
    return Buffer.from(hexString, "hex")
  }

  private isValidHex(hexString: string): boolean {
    return /^[0-9a-fA-F]*$/i.test(hexString) && hexString.length % 2 === 0
  }

  private isBase64(str: string): boolean {
    const notBase64 = /[^A-Z0-9+/=]/i
    const len = str.length
    if (!len || len % 4 !== 0 || notBase64.test(str)) {
      return false
    }
    const firstPaddingChar = str.indexOf("=")
    return (
      firstPaddingChar === -1 || firstPaddingChar === len - 1 || (firstPaddingChar === len - 2 && str[len - 1] === "=")
    )
  }

  get buffer(): Buffer {
    return this.data
  }

  get hex(): string {
    return this.data.toString("hex")
  }

  get prefixedHex(): string {
    return "0x" + this.hex
  }

  get base64(): string {
    return this.data.toString("base64")
  }

  get utf8(): string {
    return this.data.toString("utf8")
  }
}
