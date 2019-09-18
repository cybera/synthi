import gql from 'graphql-tag'

import {
  createTransformationTemplate
} from '../../domain/contexts/transformation'

import { isMember, isOwner } from '../rules'

export const resolvers = {
  Transformation: {
    code: transformation => transformation.code(),
    virtual: transformation => (transformation.virtual ? transformation.virtual : false)
  },
  Mutation: {
    createTransformationTemplate: (_, {
      name,
      inputs,
      code,
      owner
    }, { user }) => createTransformationTemplate(name, inputs, code, owner, user)
  }
}

export const permissions = {
  Transformation: {
    '*': isOwner()
  },
  Mutation: {
    createTransformationTemplate: isMember({ organizationRef: 'owner' })
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
    inputs: [Dataset]
    outputs: [Dataset]
    code: String
    error: String
    virtual: Boolean
  }

  extend type Dataset {
    inputTransformation: Transformation
  }

  extend type Mutation {
    saveInputTransformation(uuid: String!, code:String, template:TemplateRef, inputs:[TransformationInputMapping], org:OrganizationRef): Transformation
    createTransformationTemplate(name:String!, inputs:[String], code:String, owner:OrganizationRef!): Transformation
  }
`
