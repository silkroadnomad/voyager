import { join } from 'path'
import { createLibp2p } from 'libp2p'
import { createHelia } from 'helia'
import { createOrbitDB, Identities, KeyStore } from '@orbitdb/core'
import { LevelBlockstore } from 'blockstore-level'
import { LevelDatastore } from 'datastore-level'
import { pipe } from 'it-pipe'
import Host from './lib/host.js'
import { voyagerRPCProtocol } from './rpc/protocol.js'
import { handleCommand } from './rpc/index.js'
import { Access } from './lib/authorization.js'
import { config as libp2pConfig } from './utils/libp2p-config.js'
import { rpc as rpcId, appPath, rpcPath, app, host as hostId, hostPath } from './utils/id.js'
import { saveConfig } from './utils/config-manager.js'
import { logger, enable } from '@libp2p/logger'
import { prometheusMetrics } from '@libp2p/prometheus-metrics'
import { startMetricsServer } from './metrics-server.js'
import { WebSocketsSecure } from '@multiformats/multiaddr-matcher'
import restApi from './rest-api.js' // Neu: REST-API importieren

const createRPCIdentity = async ({ id, directory }) => {
  const keystore = await KeyStore({ path: join(rpcPath(directory), 'keystore') })
  const identities = await Identities({ keystore })
  const identity = await identities.createIdentity({ id })
  const keyPair = await keystore.getKey(id)
  await keystore.close()
  return {
    id: identity.id,
    hash: identity.hash,
    publicKey: identity.publicKey,
    keyPair
  }
}

export default async ({ options }) => {
  options = options || {}

  const log = logger('voyager:daemon')
  console.log('options.verbose:', options.verbose)
  if (options.verbose > 0) {
    enable('voyager:daemon' + (options.verbose > 1 ? '*' : ':error'))
    enable('libp2p:' + (options.verbose > 2 ? '*' : ':error'))
    enable('helia:' + (options.verbose > 3 ? '*' : ':error'))
    enable('orbitdb:' + (options.verbose > 4 ? '*' : ':error'))
  }

  const defaultAccess = options.allow ? Access.ALLOW : Access.DENY

  options.verbose = options.verbose || 0
  options.port = options.port || 0
  options.wsport = options.wsport || 0
  options.restport = options.restport || 3006 // Neu: REST-API-Port

  log('app:', app)
  log('host:', hostId)
  log('rpc:', rpcId)

  const appDirectory = appPath(options.directory)
  const hostDirectory = hostPath(options.directory)

  log('directory:', hostDirectory)

  const blockstore = new LevelBlockstore(join(hostDirectory, '/', 'ipfs', '/', 'blocks'))
  const datastore = new LevelDatastore(join(hostDirectory, '/', 'ipfs', '/', 'data'))

  const authorizedRPCIdentity = await createRPCIdentity({ id: rpcId, directory: options.directory })
  const libp2p = await createLibp2p(libp2pConfig({ 
    privateKey: authorizedRPCIdentity.keyPair, 
    port: options.port, 
    websocketPort: options.wsport, 
    datastore: datastore, 
    metrics: prometheusMetrics(),
    staging: options.staging,
    ip4: options.ip4,
    ip6: options.ip6
  }))

  console.log('peerid:', libp2p.peerId.toString())

  libp2p.addEventListener('certificate:provision', () => {
    console.log('A TLS certificate was provisioned')
  
    const interval = setInterval(() => {
      const mas = libp2p
        .getMultiaddrs()
        .filter(ma => WebSocketsSecure.exactMatch(ma) && ma.toString().includes('/sni/'))
        .map(ma => ma.toString())
  
      if (mas.length > 0) {
        console.log('addresses:')
        console.log(mas.join('\n'))
        clearInterval(interval)
      }
    }, 1_000)
  })

  const addresses = libp2p.getMultiaddrs().map(e => e.toString())
  for (const addr of addresses) {
    console.log(addr)
  }
  for (const addr of addresses) {
    log('listening on', addr)
  }

  const ipfs = await createHelia({ libp2p, datastore, blockstore })
  const orbitdb = await createOrbitDB({ ipfs, directory: hostDirectory, id: hostId })
  const host = await Host({ defaultAccess, verbose: options.verbose, orbitdb })

  const rpcConfig = {
    address: host.orbitdb.ipfs.libp2p.getMultiaddrs().shift(), // get 127.0.0.1 address
    identities: [authorizedRPCIdentity]
  }

  // do not store the privateKey outside of the keyStore
  delete rpcConfig.identities[0].keyPair

  await saveConfig({ path: appDirectory, config: rpcConfig })

  const handleRPCMessages = async ({ stream }) => {
    await pipe(stream, handleCommand(rpcConfig, host), stream)
  }

  await host.orbitdb.ipfs.libp2p.handle(voyagerRPCProtocol, handleRPCMessages)

  // Neu: REST-API starten
  const api = await restApi({ host, port: options.restport })
  log(`REST API started on port ${options.restport}`)

  if (options.metrics) {
    await startMetricsServer()
    log('Prometheus metrics server enabled')
  }

  process.on('SIGINT', async () => {
    // Neu: REST-API stoppen
    await api.stop()
    await host.stop()
    await blockstore.close()
    await datastore.close()
    process.exit(0)
  })

  console.log('Voyager started')
}
