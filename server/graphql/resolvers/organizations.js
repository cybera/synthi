import OrganizationRepository from '../../domain/repositories/organizationRepository'

export default {
  Organization: {
    organization({ context }) {
      return OrganizationRepository.getAll(context)
    },
  },
}
