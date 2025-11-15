const blacklist = new Set()

export function addTokenJtiToBlacklist(jti) {
  if (jti) blacklist.add(jti)
}

export function isTokenJtiBlacklisted(jti) {
  return jti ? blacklist.has(jti) : false
}

