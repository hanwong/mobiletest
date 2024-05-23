const log = {
  event: (text: string) => console.info("%c" + text, "color:wheat"),
  request: (text: string) => console.info("%c" + text, "color:slategray"),
  success: (text: string) => console.info("%c" + text, "color:lightgreen"),
  failure: (text: string) => console.info("%c" + text, "color:crimson"),
}

export default log
