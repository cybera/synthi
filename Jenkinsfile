pipeline {
  agent {
    node { label 'docker' }
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
        configFileProvider([configFile(fileId: '476375ce-f8fb-497e-b83d-459083303bf5', targetLocation: 'config/testing.toml')]) {
        }
      }
    }

    stage('Build test container') {
      steps {
        dir("test") {
          sh 'docker-compose build'
        }
      }
    }

    stage('Update test deps') {
      steps {
        sh 'bin/update-test-deps'
      }
    }

    stage('Bring up integration test environment') {
      steps {
        sh 'bin/testenv start'
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
        withDockerRegistry(registry: [credentialsId: 'adidockerhub']) {
          sh 'docker push cybera/adi-server:${TAG}'
          sh 'docker push cybera/adi-python-worker:${TAG}'
          sh 'docker push cybera/adi-tika-worker:${TAG}'
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
          sh 'touch deploy/neo4j.env'
          sh 'docker stack deploy --with-registry-auth -c deploy/stack.yml adi'
          sh 'docker service update adi_server --image cybera/adi-server:$TAG --with-registry-auth'
          sh 'docker service update adi_neo4j --image cybera/adi-neo4j:$TAG --with-registry-auth'
          sh 'docker service update adi_python-worker --image cybera/adi-python-worker:$TAG --with-registry-auth'
          sh 'docker service update adi_tika-worker --image cybera/adi-tika-worker:$TAG --with-registry-auth'

          // Wait for container to become available
          retry(10) {
              sh 'docker exec adi_python-worker.1.$(docker service ps adi_python-worker -q --no-trunc | head -n1) true'
              sleep 5
          }

          // Wait for neo4j to be available
          sh 'docker exec adi_python-worker.1.$(docker service ps adi_python-worker -q --no-trunc | head -n1) /wait-for-it.sh  -t 45 -h neo4j -p 7474'

          sh 'docker exec adi_python-worker.1.$(docker service ps adi_python-worker -q --no-trunc | head -n1) ./run_migrations.py'
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
         slackSend(channel:'#adi-cybera', color: '#FFF4444', message: "Build ${env.BUILD_NUMBER} for ${env.AUTHOR} on branch ${env.BRANCH_NAME} failed. Logs: ${env.BUILD_URL}console")
     }
  }
}
