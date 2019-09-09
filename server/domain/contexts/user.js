import { User } from '../models'

export async function fullUser({ uuid }) {
  const user = await User.getByUuid(uuid)
  return user
}

export async function regenerateAPIKey({ uuid }) {
  const user = await User.getByUuid(uuid)
  await user.regenerateAPIKey()
  return user
}
