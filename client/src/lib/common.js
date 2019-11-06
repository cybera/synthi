import { compose } from 'ramda'

export { compose }

// Provide a nicer, human readable string for a number of bytes. Taken from:
// https://stackoverflow.com/questions/15900485/correct-way-to-convert-size-in-bytes-to-kb-mb-gb-in-javascript
export function formatBytes(bytes, decimals = 2) {
  if (bytes === null) return '?'
  if (bytes === 0) return '0 Bytes'

  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']

  const i = Math.floor(Math.log(bytes) / Math.log(k))

  const numberStr = parseFloat((bytes / (k ** i)).toFixed(dm))
  return `${numberStr} ${sizes[i]}`
}
