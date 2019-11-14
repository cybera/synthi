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
    virtual: transformation => transformation.virtual(),
    canPublish: (transformation, _, { user }) => transformation.canPublish(user),
    tags: transformation => transformation.tags()
  },
  Query: {
    transformations: (_, { org, filter }) => transformations(org, filter),
    transformation: (_, { uuid, name, org }) => transformation(uuid, name, org),
  },
  Mutation: {
    createTransformationTemplate: (_, {
      name,
      description,
      inputs,
      code,
      owner,
      tagNames
    }, { user }) => createTransformationTemplate(name, description, inputs, code, owner, user, tagNames),
    updateTransformation: (_, { uuid, fields }) => updateTransformation(uuid, fields),
    deleteTransformation: (_, { uuid }) => deleteTransformation(uuid),
    publishTransformation: (_, { uuid, published }) => setPublished(uuid, published)
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
    publishTransformation: isOwner(),
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
    description: String
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
    tags: [Tag]
  }

  input TransformationUpdate {
    name: String
    description: String
    code: String
    inputs: [String]
    tagNames: [String]
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
    saveInputTransformation(uuid: String!, description: String, code:String, template:TemplateRef, inputs:[TransformationInputMapping], org:OrganizationRef): Transformation
    createTransformationTemplate(name:String!, description: String, inputs:[String], code:String, owner:OrganizationRef!, tagNames:[String]): Transformation
    updateTransformation(uuid:String!, fields:TransformationUpdate!): Transformation
    deleteTransformation(uuid: String!): Boolean
    publishTransformation(uuid: String!, published: Boolean): Transformation
  }
`
