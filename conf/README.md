# Configuration

This folder is intended to contain various configuration files for the project.

## Metrics and REST API

### Using our provided grafana dashboard with prometheus and grafana

From inside this directory, you can run the following command to start up a grafana and prometheus instance with some default dashboards and datasources set up.

```sh
sudo chown -R 472:472 ./grafana #make use grafana has permission
docker compose -f docker-compose.yml up -d
```

Then visit <http://localhost:9191/d/helia-http-gateway-default/helia-http-gateway-default-dashboard?orgId=1&refresh=5s> and login with the default credentials (admin:admin). The prometheus datasource and the dashboard should be automatically set up.

If you want to generate some metrics quickly, you can run `npm run debug:until-death` and you should start seeing metrics in the dashboard for the results of querying the gateway for the websites listed by <https://probelab.io/websites/>

If you need to reset the grafana database for whatever reason, you can try this command: `cd config && docker compose down && rm grafana/grafana.db  && docker compose rm -fsv && docker compose up -d`

### REST API Endpoints

The REST API can be enabled using the `--rest` (or `-r`) flag when starting Voyager. By default, it runs on the same port as the metrics server (default: 9090).

Available endpoints:

#### GET /pinned-databases
Returns a list of all pinned databases with their metadata.

Response format:
```json
[
  {
    "address": "database-address",
    "name": "database-name",
    "type": "database-type",
    "accessController": "access-controller-type",
    "entries": []
  }
]
```

#### GET /database-history?address=<db-address>
Returns the history of operations for a specific database.

Query parameters:
- `address`: (required) The address of the database to query

Response format:
```json
{
  "address": "database-address",
  "name": "database-name",
  "type": "database-type",
  "accessController": "access-controller-type",
  "history": [
    {
      "hash": "entry-hash",
      "id": "entry-id",
      "payload": "entry-payload",
      "identity": "entry-identity",
      "timestamp": "entry-timestamp",
      "next": "next-entry",
      "v": "version"
    }
  ]
}
```

#### DELETE /database?address=<db-address>
Deletes a database. This endpoint requires both the `--rest` and `--allow-rest-delete` flags to be enabled.

Query parameters:
- `address`: (required) The address of the database to delete

Response format:
```json
{
  "message": "Database <address> successfully deleted"
}
```

### Command Line Options

To enable these features, use the following command line options when starting Voyager:

- `--metrics` or `-m [port]`: Enable Prometheus metrics server (default port: 9090)
- `--rest` or `-r`: Enable REST API endpoints
- `--allow-rest-delete`: Allow database deletion via REST API (requires `--rest`)

Example:
```sh
# Enable both metrics and REST API with deletion allowed
voyager daemon -m 9090 -r --allow-rest-delete

# Enable only REST API without deletion
voyager daemon -r

# Enable only metrics
voyager daemon -m
```

This documentation:
1. Maintains the existing metrics/Grafana setup information
2. Adds a comprehensive REST API section
3. Documents all available endpoints with their request/response formats
4. Includes command line options and usage examples
5. Provides clear information about the security implications of the delete endpoint

The documentation is structured to help users understand both the metrics functionality and the new REST API capabilities, while maintaining the existing useful information about Grafana setup.
