import * as k8s from '@kubernetes/client-node'
import config from 'config'

import { Message } from '../domain/models/task'

const kc = new k8s.KubeConfig()
kc.loadFromFile('/home/cameron/devel/adi/server/config/kubeconfig')

const k8sApi = kc.makeApiClient(k8s.BatchV1Api)

function runTask(message: Message): any {
  const container = new k8s.V1Container()
  container.name = 'worker'
  container.image = config.get(`k8s.images.${message.type}`)
  container.args = [JSON.stringify(message)]

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

  return k8sApi.createNamespacedJob('default', job).catch(e => console.log(e))
}

runTask({ type: 'import_csv', task: 'hi', taskid: 'id', status: 'hello', message: 'wassup' }).catch((e:any) => console.log(e))
