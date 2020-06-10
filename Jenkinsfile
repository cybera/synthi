pipeline {
  agent {
    node { label 'adi' }
  }

   environment {
     TAG = """${sh(
                returnStdout: true,
                script: 'echo -n "jenkins_$(git rev-parse --short HEAD)"'
            )}"""
     AUTHOR = """${sh(
                returnStdout: true,
                script: 'echo -n "$(git log -1 --pretty="%an (%ce)")"'
            )}"""
     COMPOSE_HTTP_TIMEOUT = 300
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

    stage('Clean docker environment') {
      // Make sure any leftovers from a previous build are cleaned up
      steps {
        sh 'bin/testenv stop'
      }
    }

    stage('Build client container') {
      steps {
        sh 'docker-compose build client'
      }
    }

    stage('Build client webpack code into server directory') {
      when { anyOf { branch 'development'} }
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

    stage('Build python worker container') {
      steps {
        sh 'docker-compose build python-worker'
      }
    }

    stage('Build tika worker container') {
      steps {
        sh 'docker-compose build tika-worker'
      }
    }

    stage('Build neo4j container') {
      steps {
        sh 'docker-compose build neo4j'
      }
    }

    stage('Import testing environment configuration') {
      steps {
        configFileProvider([configFile(fileId: '476375ce-f8fb-497e-b83d-459083303bf5', targetLocation: 'config/testing.toml')]) {}
        configFileProvider([configFile(fileId: '055ed06d-c0d7-4e78-809e-e4addfb93b60', targetLocation: 'config/kubeconfig')]) {}
      }
    }

    stage('Build test container') {
      steps {
        dir("test") {
          sh 'docker-compose build'
        }
      }
    }

    stage('Bring up integration test environment') {
      steps {
        sh 'bin/testenv jenkins_start'
      }
    }

    stage('Run integration tests') {
      steps {
        sh 'bin/testenv_run'
      }
    }

    stage('Push images to dockerhub') {
      when { anyOf { branch 'development'} }
      steps {
        withCredentials([string(credentialsId: 'server-image', variable: 'ADI_SERVER_IMAGE'),
                       string(credentialsId: 'neo4j-image', variable: 'ADI_NEO4J_IMAGE')]) {
        withDockerRegistry(registry: [credentialsId: 'adidockerhub']) {
          sh 'docker push $ADI_SERVER_IMAGE:${TAG}'
          /* sh 'docker push $ADI_PYTHON_WORKER:${TAG}' */
          /* sh 'docker push $ADI_NEO4J_WORKER:${TAG}' */
          sh 'docker push $ADI_NEO4J_IMAGE:${TAG}'
          }
        }
      }
    }

    stage('Deploy new image to staging') {
      when { anyOf { branch 'development'} }
      environment {
        DOCKER_MACHINE_NAME="adi-staging"
      }

      steps {
  
      withCredentials([string(credentialsId: 'staging-docker-uri', variable: 'STAGING_DOCKER_URI'),
                       string(credentialsId: 'server-image', variable: 'ADI_SERVER_IMAGE'),
                       string(credentialsId: 'neo4j-image', variable: 'ADI_NEO4J_IMAGE')]) {
        withDockerRegistry(registry: [credentialsId: 'adidockerhub']) {
          withDockerServer(server: [uri: STAGING_DOCKER_URI, credentialsId: 'adi-staging']) {
         
          sh 'touch deploy/neo4j.env'
          sh 'docker stack deploy --with-registry-auth -c deploy/stack.yml adi'
          sh 'docker service update adi_server --image $ADI_SERVER_IMAGE:$TAG --with-registry-auth'
          sh 'docker service update adi_neo4j --image $ADI_NEO4J_IMAGE:$TAG --with-registry-auth'
          /* sh 'docker service update adi_python-worker --image $ADI_PYTHON_WORKER:$TAG --with-registry-auth' */
          /* sh 'docker service update adi_tika-worker --image $ADI_TIKA_WORKER:$TAG --with-registry-auth' */

          // Wait for container to become available
          retry(10) {
              sh 'docker exec adi_server.1.$(docker service ps adi_server -q --no-trunc | head -n1) true'
              sleep 5
          }

          // Wait for neo4j to be available
          sh 'docker exec adi_server.1.$(docker service ps adi_server -q --no-trunc | head -n1) ./wait-for-it.sh  -t 45 -h neo4j -p 7474'

          sh 'docker exec adi_server.1.$(docker service ps adi_server -q --no-trunc | head -n1) npm run migrate'
        }
       }
      }
      }
    }
  }

  post {
     always {
       // Resolve any permissions issues by taking everything back
       sh 'sudo chown jenkins.wheel -R .'
       // Bring down the integration test environment
       sh 'bin/testenv stop'
     }

      failure {
         withCredentials([string(credentialsId: 'adi-slack-channel', variable: 'ADI_SLACK_CHANNEL')]) {
          slackSend(channel: ADI_SLACK_CHANNEL, color: '#FFF4444', message: "Build ${env.BUILD_NUMBER} for ${env.AUTHOR} on branch ${env.BRANCH_NAME} failed. Logs: ${env.BUILD_URL}console")
         }
     }
  }
}
