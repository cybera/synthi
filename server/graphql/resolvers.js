import { merge } from 'lodash'
import { shield } from 'graphql-shield'
import { AuthenticationError } from 'apollo-server-express'
import hash from 'object-hash'
import { Base } from '../domain/models'

import * as dataset from './resolvers/dataset'
import plotsResolvers from './resolvers/plots'
import transformationsResolvers from './resolvers/transformations'
import datasetMetadataResolvers from './resolvers/datasetMetadata'
import columnResolvers from './resolvers/column'
import generalResolvers from './resolvers/general'
import userResolvers from './resolvers/user'

export const resolvers = merge(
  userResolvers,
  generalResolvers,
  dataset.resolvers,
  columnResolvers,
  datasetMetadataResolvers,
  plotsResolvers,
  transformationsResolvers
)

/*
  graphql-shield uses the 'object-hash' npm package by default, but with
  no options specified. When it gets the 'parent' parameter passed into
  it (which happens when putting a rule on a type field), it trips up with
  an error, which causes all manner of havoc:

  Error: Unknown object type "module"

  Since we have uuids on every domain object, which actually represent the
  uniqueness of the object, using the 'replacer' option to swap the uuid
  for the object we can't hash seems best. But there are also cases, like
  file uploads, where we get things like promises in our arguments, which
  also cause these errors. We should be safe to turn on the ignoreUnknown
  option to catch these. There is some danger that this will hide another
  unknown type that is crucial for computing a unique hash, but even when
  we didn't use a replacer, we were getting unique hashes, so this should
  be a very rare event. Of course, if you're reading this really closely,
  it might have turned out to be not so rare. In that case, just turn off
  the ignoreUnknown flag and see what's happening. I originally had to set
  breakpoints in graphql-shield itself, but since these errors seem to be
  triggered by the object-hash module, it's probably easier to track down
  what exact new thing is tripping it up by trying to use it directly.

  If the problem is resolved in some other way, we can go back to using
  graphql-shield's default hash function, as we're actually using th
  exact same default function here, just wrapping it so we can pass
  the options we need to. That said, object-hash could just set
  ignoreUnknown by default, so this custom hash may be in for the long
  haul.
*/
const replacer = value => ((value instanceof Base) ? value.uuid : value)
const hashFunction = obj => hash(obj, { replacer, ignoreUnknown: true })

export const permissions = shield(merge(
  dataset.permissions,
), {
  fallbackError: new AuthenticationError('Operation not allowed on this resource'),
  hashFunction
})
