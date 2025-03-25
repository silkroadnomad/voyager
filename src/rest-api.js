import express from 'express'
import cors from 'cors'
import bodyParser from 'body-parser'
import { logger } from '@libp2p/logger'
import { Voyager } from './lib/voyager.js'

const log = logger('voyager:rest-api')

export default async ({ host, port = 3006 }) => {
  const app = express()
  
  // Middleware
  app.use(cors())
  app.use(bodyParser.json())
  
  // Logging-Middleware
  app.use((req, res, next) => {
    log(`${req.method} ${req.path}`)
    next()
  })
  
  // Fehlerbehandlung
  app.use((err, req, res, next) => {
    log.error('Error:', err)
    res.status(500).json({ error: err.message })
  })
  
  // Routen für Datenbanken
  app.get('/databases', async (req, res) => {
    try {
      const entries = []
      for await (const entry of host.databases.iterator()) {
        const address = entry.key
        const identities = entry.value
        
        try {
          // Datenbank öffnen, um Metadaten zu erhalten
          const db = await host.orbitdb.open(address)
          const type = db.type
          
          // Letztes Update-Datum aus dem Log holen (falls verfügbar)
          let lastUpdated = new Date().toISOString()
          if (db.log && db.log.length > 0) {
            const lastEntry = db.log.values[db.log.length - 1]
            if (lastEntry && lastEntry.payload && lastEntry.payload.meta && lastEntry.payload.meta.timestamp) {
              lastUpdated = new Date(lastEntry.payload.meta.timestamp).toISOString()
            }
          }
          
          entries.push({
            address,
            identities,
            type,
            lastUpdated
          })
          
          await db.close()
        } catch (error) {
          log.error(`Error opening database ${address}:`, error)
          entries.push({
            address,
            identities,
            type: 'unknown',
            lastUpdated: new Date().toISOString(),
            error: error.message
          })
        }
      }
      
      res.json(entries)
    } catch (error) {
      log.error('Error listing databases:', error)
      res.status(500).json({ error: error.message })
    }
  })
  
  app.get('/databases/:address', async (req, res) => {
    try {
      const address = req.params.address
      
      // Datenbank öffnen
      const db = await host.orbitdb.open(address)
      const entries = await db.all()
      const type = db.type
      
      // Benutzer-IDs aus der "databases"-Datenbank abrufen
      const identities = await host.databases.get(address) || []
      
      // Letztes Update-Datum aus dem Log holen (falls verfügbar)
      let lastUpdated = new Date().toISOString()
      if (db.log && db.log.length > 0) {
        const lastEntry = db.log.values[db.log.length - 1]
        if (lastEntry && lastEntry.payload && lastEntry.payload.meta && lastEntry.payload.meta.timestamp) {
          lastUpdated = new Date(lastEntry.payload.meta.timestamp).toISOString()
        }
      }
      
      // Formatierte Einträge erstellen
      const formattedEntries = Object.entries(entries).map(([key, value]) => ({
        key,
        value
      }))
      
      await db.close()
      
      res.json({
        address,
        identities,
        type,
        lastUpdated,
        entries: formattedEntries
      })
    } catch (error) {
      log.error(`Error getting database ${req.params.address}:`, error)
      res.status(500).json({ error: error.message })
    }
  })
  
  app.post('/databases', async (req, res) => {
    try {
      const { address } = req.body
      
      if (!address) {
        return res.status(400).json({ error: 'Address is required' })
      }
      
      // Voyager-Client erstellen
      const voyager = await Voyager({ orbitdb: host.orbitdb, address: host.orbitdb.ipfs.libp2p.getMultiaddrs()[0] })
      
      // Datenbank hinzufügen
      const success = await voyager.add(address)
      
      if (success) {
        res.json({ success: true, message: `Database ${address} added successfully` })
      } else {
        res.status(500).json({ error: 'Failed to add database' })
      }
    } catch (error) {
      log.error('Error adding database:', error)
      res.status(500).json({ error: error.message })
    }
  })
  
  app.delete('/databases/:address', async (req, res) => {
    try {
      const address = req.params.address
      
      // Voyager-Client erstellen
      const voyager = await Voyager({ orbitdb: host.orbitdb, address: host.orbitdb.ipfs.libp2p.getMultiaddrs()[0] })
      
      // Datenbank entfernen
      const success = await voyager.remove(address)
      
      if (success) {
        res.json({ success: true, message: `Database ${address} removed successfully` })
      } else {
        res.status(500).json({ error: 'Failed to remove database' })
      }
    } catch (error) {
      log.error(`Error removing database ${req.params.address}:`, error)
      res.status(500).json({ error: error.message })
    }
  })
  
  // Routen für Benutzer
  app.get('/users', async (req, res) => {
    try {
      const users = await host.auth.list()
      
      // Formatiere die Benutzer-IDs in ein Benutzer-Objekt
      const formattedUsers = users.map(id => ({
        id,
        addedAt: new Date().toISOString() // Das tatsächliche Hinzufügedatum ist nicht verfügbar
      }))
      
      res.json(formattedUsers)
    } catch (error) {
      log.error('Error listing users:', error)
      res.status(500).json({ error: error.message })
    }
  })
  
  app.post('/users', async (req, res) => {
    try {
      const { id } = req.body
      
      if (!id) {
        return res.status(400).json({ error: 'User ID is required' })
      }
      
      const success = await host.auth.add(id)
      
      if (success) {
        res.json({ success: true, message: `User ${id} added successfully` })
      } else {
        res.status(500).json({ error: 'Failed to add user' })
      }
    } catch (error) {
      log.error('Error adding user:', error)
      res.status(500).json({ error: error.message })
    }
  })
  
  app.delete('/users/:id', async (req, res) => {
    try {
      const id = req.params.id
      
      const success = await host.auth.remove(id)
      
      if (success) {
        res.json({ success: true, message: `User ${id} removed successfully` })
      } else {
        res.status(500).json({ error: 'Failed to remove user' })
      }
    } catch (error) {
      log.error(`Error removing user ${req.params.id}:`, error)
      res.status(500).json({ error: error.message })
    }
  })
  
  // Routen für Server-Informationen
  app.get('/id', async (req, res) => {
    try {
      const id = host.orbitdb.identity.id
      res.json({ id })
    } catch (error) {
      log.error('Error getting server ID:', error)
      res.status(500).json({ error: error.message })
    }
  })
  
  app.get('/address', async (req, res) => {
    try {
      const addresses = host.orbitdb.ipfs.libp2p.getMultiaddrs().map(ma => ma.toString())
      res.json({ addresses })
    } catch (error) {
      log.error('Error getting server address:', error)
      res.status(500).json({ error: error.message })
    }
  })
  
  // Starten des Servers
  const server = app.listen(port, () => {
    log(`REST API running on port ${port}`)
  })
  
  // Funktion zum Stoppen des Servers
  const stop = async () => {
    return new Promise((resolve) => {
      server.close(() => {
        log('REST API stopped')
        resolve()
      })
    })
  }
  
  return {
    stop
  }
}