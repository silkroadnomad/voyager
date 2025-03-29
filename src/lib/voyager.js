import { pipe } from 'it-pipe'
import all from 'it-all'
import { Requests, Responses, RequestMessage, parseMessage } from './messages/index.js'
import { voyagerProtocol } from './protocol.js'

// utils
const toArray = (v) => Array.isArray(v) ? v : [v]
const getSubarray = (e) => e.subarray()
const getType = (e) => e.type
const isOk = (e) => e === Responses.OK

export default async ({ orbitdb, address }) => {
  const request = async (type, addresses) => {
    return await RequestMessage(type, addresses, orbitdb.identity)
  }

  const parseResponse = async (source) => {
    const res = await all(source)
    const ok = res.map(getSubarray).map(parseMessage).map(getType).every(isOk)
    return ok
  }

  const add = async (addresses) => {
    try {
      const addDBs = () => [request(Requests.ADD, toArray(addresses))]
      const stream = await orbitdb.ipfs.libp2p.dialProtocol(address, voyagerProtocol, { runOnLimitedConnection: true })
      const added = await pipe(addDBs, stream, parseResponse)
      return added
    } catch (error) {
      console.warn('Failed to add db to voyager:', error.message)
      return false
    }
  }

  const remove = async (addresses) => {
    try {
      const removeDBs = () => [request(Requests.REMOVE, toArray(addresses))]
      const stream = await orbitdb.ipfs.libp2p.dialProtocol(address, voyagerProtocol, { runOnLimitedConnection: true })
      const removed = await pipe(removeDBs, stream, parseResponse)
      return removed
    } catch (error) {
      console.warn('Failed to remove db from voyager:', error.message)
      return false
    }
  }

  return {
    orbitdb,
    add,
    remove
  }
}
