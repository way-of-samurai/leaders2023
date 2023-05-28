export function linearConversion(oldRange, newRange, value) {
  const oldDiff = (oldRange[1] - oldRange[0])
  const newDiff = (newRange[1] - newRange[0])
  return ((value - oldRange[0]) * newDiff / oldDiff) + newRange[0]
}

export function groupBy(arr, fn) {
  return arr.reduce((group, e) => {
    const attr = fn(e)
    group[attr] = group[attr] ?? []
    group[attr].push(e)
    return group
  }, {})
}
