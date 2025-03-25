# Voyager REST API Dokumentation

Die Voyager REST API ermöglicht den Zugriff auf die OrbitDB-Datenbanken und die Verwaltung von autorisierten Benutzern über HTTP-Anfragen. Diese API ist besonders nützlich für Webanwendungen, die mit dem Voyager-Server kommunizieren müssen.

## Starten der REST API

Die REST API wird automatisch gestartet, wenn der Voyager-Daemon gestartet wird. Standardmäßig läuft die API auf Port 3006, aber dieser kann mit der `--restport` Option geändert werden:

```bash
voyager daemon --restport 8080
```

## API-Endpunkte

### Datenbanken

#### Alle Datenbanken abrufen

```
GET /databases
```

Gibt eine Liste aller indizierten Datenbanken zurück.

**Beispielantwort:**

```json
[
  {
    "address": "/orbitdb/zdpuAqpHc4LbbkD5LGGbGQtjn6zxcFXAcdxPrEZyTJYdGxcxo/hello",
    "identities": ["04a5f2d00d98b4ee79ec1eb3a7bc4c6ba21514e9b7177c8db36f8f3bc2c41a5b"],
    "type": "keyvalue",
    "lastUpdated": "2023-05-15T12:34:56.789Z"
  },
  {
    "address": "/orbitdb/zdpuAqpHc4LbbkD5LGGbGQtjn6zxcFXAcdxPrEZyTJYdGxcxo/world",
    "identities": ["04a5f2d00d98b4ee79ec1eb3a7bc4c6ba21514e9b7177c8db36f8f3bc2c41a5b"],
    "type": "docstore",
    "lastUpdated": "2023-05-15T12:34:56.789Z"
  }
]
```

#### Datenbank-Details abrufen

```
GET /databases/:address
```

Gibt Details zu einer bestimmten Datenbank zurück, einschließlich aller Einträge.

**Parameter:**
- `address`: Die OrbitDB-Adresse der Datenbank (URL-kodiert)

**Beispielantwort:**

```json
{
  "address": "/orbitdb/zdpuAqpHc4LbbkD5LGGbGQtjn6zxcFXAcdxPrEZyTJYdGxcxo/hello",
  "identities": ["04a5f2d00d98b4ee79ec1eb3a7bc4c6ba21514e9b7177c8db36f8f3bc2c41a5b"],
  "type": "keyvalue",
  "lastUpdated": "2023-05-15T12:34:56.789Z",
  "entries": [
    {
      "key": "name",
      "value": "Alice"
    },
    {
      "key": "age",
      "value": 30
    }
  ]
}
```

#### Datenbank hinzufügen

```
POST /databases
```

Fügt eine neue Datenbank zum Voyager-Server hinzu.

**Request-Body:**

```json
{
  "address": "/orbitdb/zdpuAqpHc4LbbkD5LGGbGQtjn6zxcFXAcdxPrEZyTJYdGxcxo/hello"
}
```

**Beispielantwort:**

```json
{
  "success": true,
  "message": "Database /orbitdb/zdpuAqpHc4LbbkD5LGGbGQtjn6zxcFXAcdxPrEZyTJYdGxcxo/hello added successfully"
}
```

#### Datenbank entfernen

```
DELETE /databases/:address
```

Entfernt eine Datenbank vom Voyager-Server.

**Parameter:**
- `address`: Die OrbitDB-Adresse der Datenbank (URL-kodiert)

**Beispielantwort:**

```json
{
  "success": true,
  "message": "Database /orbitdb/zdpuAqpHc4LbbkD5LGGbGQtjn6zxcFXAcdxPrEZyTJYdGxcxo/hello removed successfully"
}
```

### Benutzer

#### Alle Benutzer abrufen

```
GET /users
```

Gibt eine Liste aller autorisierten Benutzer zurück.

**Beispielantwort:**

```json
[
  {
    "id": "04a5f2d00d98b4ee79ec1eb3a7bc4c6ba21514e9b7177c8db36f8f3bc2c41a5b",
    "addedAt": "2023-05-15T12:34:56.789Z"
  },
  {
    "id": "04b5f2d00d98b4ee79ec1eb3a7bc4c6ba21514e9b7177c8db36f8f3bc2c41a5c",
    "addedAt": "2023-05-15T12:34:56.789Z"
  }
]
```

#### Benutzer hinzufügen

```
POST /users
```

Fügt einen neuen autorisierten Benutzer hinzu.

**Request-Body:**

```json
{
  "id": "04a5f2d00d98b4ee79ec1eb3a7bc4c6ba21514e9b7177c8db36f8f3bc2c41a5b"
}
```

**Beispielantwort:**

```json
{
  "success": true,
  "message": "User 04a5f2d00d98b4ee79ec1eb3a7bc4c6ba21514e9b7177c8db36f8f3bc2c41a5b added successfully"
}
```

#### Benutzer entfernen

```
DELETE /users/:id
```

Entfernt einen autorisierten Benutzer.

**Parameter:**
- `id`: Die ID des Benutzers (URL-kodiert)

**Beispielantwort:**

```json
{
  "success": true,
  "message": "User 04a5f2d00d98b4ee79ec1eb3a7bc4c6ba21514e9b7177c8db36f8f3bc2c41a5b removed successfully"
}
```

### Server-Informationen

#### Server-ID abrufen

```
GET /id
```

Gibt die ID des Voyager-Servers zurück.

**Beispielantwort:**

```json
{
  "id": "04a5f2d00d98b4ee79ec1eb3a7bc4c6ba21514e9b7177c8db36f8f3bc2c41a5b"
}
```

#### Server-Adressen abrufen

```
GET /address
```

Gibt die Netzwerkadressen des Voyager-Servers zurück.

**Beispielantwort:**

```json
{
  "addresses": [
    "/ip4/127.0.0.1/tcp/4002/p2p/12D3KooWPjceQrSwdWXPyLLeABRXmuqt69Rg3sBYbU1Nft9HyQ6X",
    "/ip4/192.168.1.100/tcp/4002/p2p/12D3KooWPjceQrSwdWXPyLLeABRXmuqt69Rg3sBYbU1Nft9HyQ6X"
  ]
}
```

## Fehlerbehandlung

Alle API-Endpunkte geben im Fehlerfall einen HTTP-Statuscode ungleich 200 zurück, zusammen mit einer JSON-Antwort, die eine Fehlermeldung enthält:

```json
{
  "error": "Failed to add database"
}
```

## Beispiele

### cURL-Beispiele

#### Alle Datenbanken abrufen

```bash
curl -X GET http://localhost:3006/databases
```

#### Datenbank hinzufügen

```bash
curl -X POST http://localhost:3006/databases \
  -H "Content-Type: application/json" \
  -d '{"address": "/orbitdb/zdpuAqpHc4LbbkD5LGGbGQtjn6zxcFXAcdxPrEZyTJYdGxcxo/hello"}'
```

#### Benutzer hinzufügen

```bash
curl -X POST http://localhost:3006/users \
  -H "Content-Type: application/json" \
  -d '{"id": "04a5f2d00d98b4ee79ec1eb3a7bc4c6ba21514e9b7177c8db36f8f3bc2c41a5b"}'
```

### JavaScript-Beispiele

#### Alle Datenbanken abrufen

```javascript
async function getDatabases() {
  const response = await fetch('http://localhost:3006/databases');
  const databases = await response.json();
  console.log(databases);
}
```

#### Datenbank hinzufügen

```javascript
async function addDatabase(address) {
  const response = await fetch('http://localhost:3006/databases', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ address })
  });
  const result = await response.json();
  console.log(result);
}
```

## Sicherheitshinweise

Die REST API bietet derzeit keine Authentifizierung oder Autorisierung. Es wird empfohlen, die API nur in vertrauenswürdigen Netzwerken zu verwenden oder zusätzliche Sicherheitsmaßnahmen wie einen Reverse-Proxy mit Authentifizierung zu implementieren.