pipeline {
  agent {
    node { label 'docker' }
  }

  stages {
    stage('build client') {
      steps {
        sh 'sudo docker-compose build client'
        sh 'bin/build-client'
      }
    }

    stage('build server') {
      steps {
        sh 'sudo docker-compose build server'
      }
    }

    stage('build worker') {
      steps {
        sh 'sudo docker-compose build python-worker'
      }
    }

    stage('build neo4j') {
      steps {
        sh 'sudo docker-compose build neo4j'
      }
    }

    stage('push images') {
      when { branch 'development' }
      steps {
        //withCredentials([[$class: 'UsernamePasswordMultiBinding', credentialsId: 'dockerhub', usernameVariable: 'USERNAME', passwordVariable: 'PASSWORD']]) {
        withDockerRegistry(registry: [credentialsId: 'dockerhub']) {
          //sh 'sudo docker login -u "$USERNAME" -p "$PASSWORD"'
          sh 'sudo docker push cybera/adi-server'
          sh 'sudo docker push cybera/adi-python-worker'
          sh 'sudo docker push cybera/adi-neo4j'
        }
      }
    }
  }
}
