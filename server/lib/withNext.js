import { zip, slice, filter } from 'lodash'

// The given function should take 2 parameters, which will represent
// the current item and the one following it. Any items that don't
// have a current and next will be removed from the list. Example:
//
// > withNext([1,2,3,4], (i, next) => console.log(`${i} => ${next}`))
//
// 1 => 2
// 2 => 3
// 3 => 4
export default function withNext(list, func) {
  if (list.length < 2) {
    throw Error('Expect list to have at least 2 elements')
  }

  const zipped = zip(list, slice(list, 1))
  const pairs = filter(zipped, pair => pair.length === 2 && pair[1])

  return pairs.map(([item1, item2]) => func(item1, item2))
}
