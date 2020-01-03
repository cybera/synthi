import * as k8s from '@kubernetes/client-node'

import { Task } from '../domain/models'

const kc = new k8s.KubeConfig()
kc.loadFromFile('/home/cameron/devel/adi/server/config/kubeconfig')

const k8sApi = kc.makeApiClient(k8s.BatchV1Api)

class JobConfig {
  image: string
  command: string[]
  args?: string[]
  message?: {[key: string]: any}
}

function msgToEnv(msg: {[key: string]: any}, prefix = '_'): k8s.V1EnvVar[] {
  return Object.keys(msg).flatMap((key) => {
    const value = msg[key]

    if (typeof value === 'object') {
      return msgToEnv(value, `${prefix}${key}_`)
    }

    const ev = new k8s.V1EnvVar()
    ev.name = `ADI_PARAMS${prefix}${key}`
    ev.value = String(value)
    return ev
  })
}

function runJob(config: JobConfig): void {
  const container = new k8s.V1Container()
  container.name = 'worker'
  container.image = config.image
  container.command = config.command
  container.args = config.args
  if (config.message) {
    container.env = msgToEnv(config.message)
  }

  const podSpec = new k8s.V1PodSpec()
  podSpec.containers = [container]
  podSpec.restartPolicy = 'Never'

  const podTemplateSpec = new k8s.V1PodTemplateSpec()
  podTemplateSpec.spec = podSpec

  const jobSpec = new k8s.V1JobSpec()
  jobSpec.template = podTemplateSpec
  jobSpec.backoffLimit = 0

  const metadata = new k8s.V1ObjectMeta()
  metadata.generateName = 'cameron-'

  const job = new k8s.V1Job()
  job.spec = jobSpec
  job.metadata = metadata
  job.apiVersion = 'batch/v1'
  job.kind = 'Job'

  k8sApi.createNamespacedJob('default', job).catch(e => console.log(e))
}

runJob({ image: 'continuumio/miniconda', command: ['python'], args: ['-c', 'print("hello world")'] })
