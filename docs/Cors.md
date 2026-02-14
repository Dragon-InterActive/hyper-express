# CORS (Cross-Origin Resource Sharing)
HyperExpress provides built-in CORS support as a native Server option. This eliminates the need for external CORS middleware packages and ensures correct handling of preflight requests out of the box.
* See [`> [Server]`](./Server.md) for more information on Server constructor options.

# How To Use
CORS is configured through the Server constructor options. It can be enabled with permissive defaults or customized with a configuration object.

#### Quick Start (Permissive Defaults)
```javascript
const HyperExpress = require('hyper-express');

const app = new HyperExpress.Server({
    cors: true,
});

app.get('/api/data', (req, res) => {
    res.json({ message: 'CORS is enabled!' });
});

app.listen(3000);
```

#### Custom Configuration
```javascript
const app = new HyperExpress.Server({
    cors: {
        origin: ['https://example.com', 'https://app.example.com'],
        methods: ['GET', 'POST', 'PUT'],
        allowedHeaders: ['Content-Type', 'Authorization', 'X-Custom-Header'],
        exposedHeaders: ['X-Request-Id'],
        credentials: true,
        maxAge: 3600,
    },
});
```

# Configuration Options

| Option | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `origin` | `String` \| `String[]` \| `RegExp` \| `RegExp[]` \| `Function` | `'*'` | Allowed origin(s) for CORS requests. |
| `methods` | `String[]` | `['GET','POST','PUT','DELETE','PATCH','HEAD','OPTIONS']` | Allowed HTTP methods. |
| `allowedHeaders` | `String[]` | `['Content-Type','Authorization']` | Headers the client is allowed to send. |
| `exposedHeaders` | `String[]` | `[]` | Headers the client is allowed to read from the response. |
| `credentials` | `Boolean` | `false` | Whether to include `Access-Control-Allow-Credentials: true`. |
| `maxAge` | `Number` | `86400` | How long (in seconds) browsers should cache preflight results. |

# Origin Configuration

The `origin` option supports multiple formats for maximum flexibility.

#### Wildcard (Allow All)
```javascript
cors: {
    origin: '*',
}
```
* **Note:** When `credentials: true` is set, the wildcard `*` is automatically replaced with the actual request origin, as browsers do not allow `Access-Control-Allow-Origin: *` together with credentials.

#### Single Origin (String)
```javascript
cors: {
    origin: 'https://example.com',
}
```
* Only requests from exactly `https://example.com` will be allowed.

#### Multiple Origins (Array)
```javascript
cors: {
    origin: ['https://example.com', 'https://app.example.com', 'http://localhost:3000'],
}
```
* Requests from any of the listed origins will be allowed.

#### Pattern Matching (RegExp)
```javascript
cors: {
    origin: /\.example\.com$/,
}
```
* Any origin ending in `.example.com` will be allowed (e.g. `https://api.example.com`, `https://app.example.com`).

#### Mixed Array (String + RegExp)
```javascript
cors: {
    origin: ['http://localhost:3000', /\.example\.com$/],
}
```
* Combines exact string matching and RegExp pattern matching.

#### Dynamic Origin (Function)
```javascript
cors: {
    origin: (requestOrigin) => {
        // Return true to allow, false to deny
        return requestOrigin.endsWith('.example.com');
    },
}
```
* The function receives the request `Origin` header value and must return a boolean.

# How It Works

### Regular Requests
For every incoming request (when CORS is enabled), HyperExpress automatically sets the following response headers based on your configuration:
* `Access-Control-Allow-Origin` — The allowed origin.
* `Vary: Origin` — Set when the origin is not a wildcard `*`, so caches handle multiple origins correctly.
* `Access-Control-Expose-Headers` — Set when `exposedHeaders` is not empty.
* `Access-Control-Allow-Credentials` — Set when `credentials` is `true`.

### Preflight Requests (OPTIONS)
When a browser sends a preflight request (an `OPTIONS` request with `Origin` and `Access-Control-Request-Method` headers), HyperExpress automatically intercepts it **before** any route handlers or middlewares are executed and responds with:
* `Access-Control-Allow-Origin` — The allowed origin.
* `Access-Control-Allow-Methods` — The configured methods.
* `Access-Control-Allow-Headers` — The configured allowed headers.
* `Access-Control-Max-Age` — The configured max age.
* `Access-Control-Allow-Credentials` — If credentials are enabled.
* HTTP Status `204 No Content`.

If the request origin is not allowed, a `403 Forbidden` response is returned.

### Disabling CORS
CORS is disabled by default. To explicitly disable it:
```javascript
const app = new HyperExpress.Server({
    cors: false, // default, CORS headers will not be set
});
```
