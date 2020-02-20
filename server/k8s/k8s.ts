import * as k8s from '@kubernetes/client-node'
import config from 'config'

const kc = new k8s.KubeConfig()
kc.loadFromFile('/usr/src/app/config/kubeconfig')

const k8sApi = kc.makeApiClient(k8s.BatchV1Api)

export default function runTask(message: any): any {
  const baseUrl = config.get('server.baseUrl')

  const container = new k8s.V1Container()
  container.name = 'worker'
  container.image = config.get(`k8s.images.${message.task}`)
  container.command = ['/usr/src/app/main.py']
  container.args = [JSON.stringify({ callback: `${baseUrl}/updateTask`, ...message })]
  // We don't want minikube trying to pull the production image in development
  // because it will fail if not logged in to docker hub and if it is logged in,
  // it will overwrite the development image.
  container.imagePullPolicy = 'IfNotPresent'

  const podSpec = new k8s.V1PodSpec()
  podSpec.containers = [container]
  podSpec.restartPolicy = 'Never'

  try {
    const secret = new k8s.V1LocalObjectReference()
    secret.name = config.get('k8s.imagePullSecret')
    podSpec.imagePullSecrets = [secret]
  } catch {}

  const podTemplateSpec = new k8s.V1PodTemplateSpec()
  podTemplateSpec.spec = podSpec

  const jobSpec = new k8s.V1JobSpec()
  jobSpec.template = podTemplateSpec
  jobSpec.backoffLimit = 0

  const metadata = new k8s.V1ObjectMeta()
  metadata.generateName = 'adi-'

  const job = new k8s.V1Job()
  job.spec = jobSpec
  job.metadata = metadata
  job.apiVersion = 'batch/v1'
  job.kind = 'Job'

  return k8sApi.createNamespacedJob('default', job)
}
