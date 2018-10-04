import 'dotenv/config'

import neo4jConnection from '../../neo4j/connection'
import DatasetRepository from './datasetRepository'
import UserRepository from './userRepository'

const context = {}

beforeAll(async () => {
  context.user = await UserRepository.create({ username: 'foo', password: 'bar' })
})

afterAll(async () => {
  await UserRepository.delete(context.user.id)
  return neo4jConnection.close()
})

test('create dataset', async () => {
  const data = {
    name: 'test',
    path: 'file.csv',
    computed: false,
    generating: false
  }

  const dataset = await DatasetRepository.create(context, data)

  expect(dataset).not.toBeNull()
  expect(dataset).not.toBeUndefined()
  expect(dataset.id).toBeGreaterThanOrEqual(0)
  expect(dataset.name).toEqual('test')
  expect(dataset.path).toEqual('file.csv')
  expect(dataset.computed).toEqual(false)
  expect(dataset.generating).toEqual(false)
  expect(dataset.owner).not.toBeNull()
  expect(dataset.owner).not.toBeUndefined()
  expect(dataset.owner.id).toEqual(context.user.id)

  return DatasetRepository.delete(context, dataset)
})
