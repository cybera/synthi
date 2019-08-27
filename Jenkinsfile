pipeline {
  agent {
    node { label 'docker' }
  }

   environment {
     TAG = """${sh(
                returnStdout: true,
                script: 'echo -n "jenkins_$(git rev-parse --short HEAD)"'
            )}"""
   }

  stages {

    stage('Steal docker sock') {
      // This is a bit of a hack, because jcloud-created jenkins users aren't
      // in the docker group. Since they're reliably in the wheel group though,
      // this seems safe.
      steps {
          sh 'sudo chown root.wheel /var/run/docker.sock'
      }
    }

    stage('Build client webpack code into server directory') {
      steps {
        sh 'bin/build-client'
        sh 'sudo chown -R jenkins client/dist'
      }
    }

    stage('Build server container') {
      steps {
        sh 'docker-compose build server'
      }
    }

    stage('Build worker container') {
      steps {
        sh 'docker-compose build python-worker'
      }
    }

    stage('Build neo4j container') {
      steps {
        sh 'docker-compose build neo4j'
      }
    }

    stage('Push images to dockerhub') {
      when { anyOf { branch 'development'} }
      steps {
        withDockerRegistry(registry: [credentialsId: 'adidockerhub']) {
          sh 'docker push cybera/adi-server:${TAG}'
          sh 'docker push cybera/adi-python-worker:${TAG}'
          sh 'docker push cybera/adi-neo4j:${TAG}'
        }
      }
    }

    stage('Deploy new image to staging') {
      when { anyOf { branch 'development'} }
      environment {
        DOCKER_MACHINE_NAME="adi-staging"
      }

      steps {
       withDockerRegistry(registry: [credentialsId: 'adidockerhub']) {
        withDockerServer(server: [uri: 'tcp://staging.adi2.data.cybera.ca:2376', credentialsId: 'adi-staging']) {
          sh 'docker service update adi_server --image cybera/adi-server:$TAG --with-registry-auth'
          sh 'docker service update adi_neo4j --image cybera/adi-neo4j:$TAG --with-registry-auth'
          sh 'docker service update adi_python-worker --image cybera/adi-python-worker:$TAG --with-registry-auth'

        }
       }
      }
    }
  }
}
