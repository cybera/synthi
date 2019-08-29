export default {
  Organization: {
    organization({ context }) {
      return context.user.orgs()
    },
  },
}
