import gql from 'graphql-tag'
import { or } from 'graphql-shield'

import {
  createTransformationTemplate,
  updateTransformation,
  deleteTransformation,
  transformations,
  transformation,
  setPublished,
} from '../../domain/contexts/transformation'

import { isMember, isOwner, isPublished } from '../rules'

export const resolvers = {
  Transformation: {
    code: transformation => transformation.code(),
    virtual: transformation => (transformation.virtual ? transformation.virtual : false),
    canPublish: (transformation, _, { user }) => transformation.canPublish(user)
  },
  Query: {
    transformations: (_, { org, filter }) => transformations(org, filter),
    transformation: (_, { uuid, name, org }) => transformation(uuid, name, org),
  },
  Mutation: {
    createTransformationTemplate: (_, {
      name,
      inputs,
      code,
      owner
    }, { user }) => createTransformationTemplate(name, inputs, code, owner, user),
    updateTransformation: (_, { uuid, fields }) => updateTransformation(uuid, fields),
    deleteTransformation: (_, { uuid }) => deleteTransformation(uuid),
    setPublished: (_, { uuid, published }) => setPublished(uuid, published)
  }
}

export const permissions = {
  Transformation: {
    '*': or(isOwner(), isPublished())
  },
  Query: {
    transformations: isMember({ organizationRef: 'org' }),
    transformation: or(isMember({ organizationRef: 'org' }), isOwner())
  },
  Mutation: {
    createTransformationTemplate: isMember({ organizationRef: 'owner' }),
    updateTransformation: isOwner(),
    deleteTransformation: isOwner(),
    setPublished: isOwner(),
  }
}

export const typeDefs = gql`
  input TemplateRef {
    name: String,
    uuid: String,
    id: Int
  }

  input TransformationInputMapping {
    alias: String!,
    dataset: DatasetRef!
  }

  type Transformation {
    id: Int
    uuid: String!
    name: String
    script: String
    inputs: [String]
    outputs: [String]
    code: String
    error: String
    virtual: Boolean
    published: Boolean
    ownerName: String
    fullName: String
    canPublish: Boolean
  }

  input TransformationUpdate {
    name: String
    code: String
    inputs: [String]
  }

  input TransformationFilter {
    publishedOnly: Boolean
    includeShared: Boolean
  }

  extend type Dataset {
    inputTransformation: Transformation
  }

  extend type Query {
    transformations(org: OrganizationRef!, filter: TransformationFilter = {
      publishedOnly: false,
      includeShared: true
    }): [Transformation]
    transformation(uuid: String, name: String, org: OrganizationRef): Transformation
  }

  extend type Mutation {
    saveInputTransformation(uuid: String!, code:String, template:TemplateRef, inputs:[TransformationInputMapping], org:OrganizationRef): Transformation
    createTransformationTemplate(name:String!, inputs:[String], code:String, owner:OrganizationRef!): Transformation
    updateTransformation(uuid:String!, fields:TransformationUpdate!): Transformation
    deleteTransformation(uuid: String!): Boolean
    setPublished(uuid: String!, published: Boolean): Transformation
  }
`
