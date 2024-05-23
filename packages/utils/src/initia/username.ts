export function isUsernameValid(username = ""): username is string {
  if (!username.endsWith(".init")) return false
  const withoutINIT = username.slice(0, -5)
  if (withoutINIT.length > 64) return false
  const pattern = /^[a-z0-9-]+$/
  return pattern.test(withoutINIT)
}
