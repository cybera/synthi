pipeline {
  agent {
    node { label 'docker' }
  }

  environment {
    PATH = '/usr/local/bin:$PATH'
  }

  stages {
    stage('build client') {
      steps {
        sh 'docker-compose build client'
        sh 'bin/build-client'
      }
    }

    stage('build server') {
      steps {
        sh 'docker-compose build server'
      }
    }

    stage('build worker') {
      steps {
        sh 'docker-compose build python-worker'
      }
    }

    stage('build neo4j') {
      steps {
        sh 'docker-compose build neo4j'
      }
    }

    stage('push images') {
      when { branch 'development' }
      steps {
        //withCredentials([[$class: 'UsernamePasswordMultiBinding', credentialsId: 'dockerhub', usernameVariable: 'USERNAME', passwordVariable: 'PASSWORD']]) {
        withDockerRegistry(registry: [credentialsId: 'dockerhub']) {
          //sh 'docker login -u "$USERNAME" -p "$PASSWORD"'
          sh 'docker push cybera/adi-server'
          sh 'docker push cybera/adi-python-worker'
          sh 'docker push cybera/adi-neo4j'
        }
      }
    }
  }
}
