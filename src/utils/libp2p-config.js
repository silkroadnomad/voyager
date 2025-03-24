import { identify, identifyPush } from '@libp2p/identify'
import { noise } from '@chainsafe/libp2p-noise'
import { yamux } from '@chainsafe/libp2p-yamux'
import { tcp } from '@libp2p/tcp'
import { webSockets } from '@libp2p/websockets'
import { gossipsub } from '@chainsafe/libp2p-gossipsub'
import { keychain } from '@libp2p/keychain'
import { autoTLS } from '@ipshipyard/libp2p-auto-tls'
import { kadDHT, removePrivateAddressesMapper } from '@libp2p/kad-dht'
import { autoNAT } from '@libp2p/autonat'
import { bootstrap } from '@libp2p/bootstrap'

export const config = ({ privateKey, port, websocketPort, datastore, metrics, staging } = {}) => {
  const conf = {
    datastore: datastore,
    metrics: metrics,
    addresses: {
      listen: [
        `/ip4/0.0.0.0/tcp/${port || 0}`,
        `/ip4/0.0.0.0/tcp/${websocketPort || 0}/ws`,
        `/ip6/::/tcp/${port || 0}`,
        `/ip6/::/tcp/${websocketPort || 0}/ws`
      ],
      appendAnnounce: [
        `/ip4/37.27.185.96/tcp/${port || 0}`,
        `/ip4/37.27.185.96/tcp/${websocketPort || 0}/ws`,
      ]
    },
    transports: [
      tcp(),
      webSockets()
    ],
    connectionEncrypters: [
      noise()
    ],
    streamMuxers: [
      yamux()
    ],
    connectionGater: {
      denyDialMultiaddr: () => false // allow dialling of private addresses.
    },
     peerDiscovery: [
      bootstrap: bootstrap({
        list: [
          '/dnsaddr/bootstrap.libp2p.io/p2p/QmNnooDu7bfjPFoTZYxMNLWUQJyrVwtbZg5gBMjTezGAJN',
          '/dnsaddr/bootstrap.libp2p.io/p2p/QmbLHAnMoJPWSCR5Zhtx6BHJX9KiKNN6tpvbUcqanj75Nb',
          '/dnsaddr/bootstrap.libp2p.io/p2p/QmcZf59bWwK5XFi76CZX8cbJ4BhTzzA3gU1ZjYZcYW3dwt',
          '/dnsaddr/va1.bootstrap.libp2p.io/p2p/12D3KooWKnDdG3iXw9eTFijk3EWSunZcFi54Zka4wmtqtt6rPxc8',
          '/ip4/104.131.131.82/tcp/4001/p2p/QmaCpDMGvV2BGHeYERUEnRQAwe3N8SzbUtfsmvsqQLuvuJ'
        ]
      })
       /* mdns() */
     ],
    services: {
      autoNAT: autoNAT(),
      aminoDHT: kadDHT({
        protocol: '/ipfs/kad/1.0.0',
        peerInfoMapper: removePrivateAddressesMapper
      }),
      identify: identify(),
      identifyPush: identifyPush(),
      keychain: keychain(),
      // requests a certificate and makes it available to libp2p, trusts that
      // `libp2p.direct` will answer DNS requests successfully
      autoTLS: autoTLS({
        autoConfirmAddress: true,
        ...(staging ? {
          acmeDirectory: 'https://acme-staging-v02.api.letsencrypt.org/directory'
        } : {})
      }),
      pubsub: gossipsub({
        emitSelf: true,
        scoreThresholds: {
          graylistThreshold: -80000000000
        }
      })
    }
  }

  if (privateKey) {
    conf.privateKey = privateKey
  }

  return conf
}
