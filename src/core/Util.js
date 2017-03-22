function hashCode (str) {
  let hash = 0
  let i
  let chr
  let len
  if (str.length === 0) return hash
  for (i = 0, len = str.length; i < len; i++) {
    chr = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + chr
    hash |= 0 // Convert to 32bit integer
  }
  return hash
}

const bubbleShapes = {
  signin: '&#xf090;',
  signout: '&#xf08b;',
  certificate: '&#xf0a3;',
  circleFill: '&#xf111;',
  circle: '&#xf10c;',
  notchCircle: '&#xf1ce;',
  thinCircle: '&#xf1db;',
  dotCircle: '&#xf192;',
  cog: '&#xf013;',
  dashboard: '&#xf0e4;',
  db: '&#xf1c0;',
  desktop: '&#xf108;',
  squareFill: '&#xf0c8;',
  sun: '&#xf185;',
  square: '&#xf096;',
  star: '&#xf005;',
  spinner: '&#xf110;',
  sheld: '&#xf132;',
  network: '&#xf0e8;',
  tv: '&#xf26c;',
  window: '&#xf2d0;',
  cloud: '&#xf0c2;',
  cogs: '&#xf085;',
  compass: '&#xf14e;',
  warning: '&#xf071;',
  alarmFill: '&#xf0f3;',
  deleted: '&#xf05e;',
  asterisk: '&#xf069;'
}

export {
  hashCode,
  bubbleShapes,
}
