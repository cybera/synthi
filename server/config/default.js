const defer = require('config/defer').deferConfig

module.exports = {
  storage: {
    type: 'object',
    object: {
      creds: {
        provider: 'openstack',
        username: undefined,
        password: undefined,
        region: undefined,
        tenantName: undefined,
        authUrl: undefined
      },
      uploadContainer: 'adi'
    }
  },
  neo4j: {
    protocol: 'bolt',
    host: 'neo4j',
    port: 7687,
    username: undefined,
    password: undefined,
    url: defer(function() { 
      return `${this.neo4j.protocol}://${this.neo4j.host}:${this.neo4j.port}`
    })
  }
}
