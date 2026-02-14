# Helmet (Security Headers)
HyperExpress provides built-in security headers as a native Server option. This eliminates the need for the external `helmet` package and applies best-practice HTTP security headers to every response with zero per-request overhead thanks to pre-cached header values.
* See [`> [Server]`](./Server.md) for more information on Server constructor options.

# How To Use
Helmet is configured through the Server constructor options. It can be enabled with secure defaults or customized with a configuration object.

#### Quick Start (Secure Defaults)
```javascript
const HyperExpress = require('hyper-express');

const app = new HyperExpress.Server({
    helmet: true,
});

app.get('/', (req, res) => {
    res.send('Secured with Helmet!');
});

app.listen(3000);
```

#### Custom Configuration
```javascript
const app = new HyperExpress.Server({
    helmet: {
        frameguard: 'deny',
        hsts: { maxAge: 63072000, preload: true },
        referrerPolicy: 'strict-origin-when-cross-origin',
        permissionsPolicy: 'camera=(), microphone=(), payment=()',
    },
});
```

# Configuration Options

| Option | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `contentSecurityPolicy` | `String` \| `Object` \| `false` | `"default-src 'self'"` | Content-Security-Policy header value. |
| `crossOriginEmbedderPolicy` | `String` \| `false` | `'require-corp'` | Cross-Origin-Embedder-Policy header value. |
| `crossOriginOpenerPolicy` | `String` \| `false` | `'same-origin'` | Cross-Origin-Opener-Policy header value. |
| `crossOriginResourcePolicy` | `String` \| `false` | `'same-origin'` | Cross-Origin-Resource-Policy header value. |
| `dnsPrefetchControl` | `Boolean` | `false` | Controls `X-DNS-Prefetch-Control` header. `true` = `on`, `false` = `off`. |
| `frameguard` | `String` \| `false` | `'sameorigin'` | `X-Frame-Options` header value. Accepted: `'sameorigin'`, `'deny'`. |
| `hsts` | `Object` \| `false` | `{ maxAge: 31536000, includeSubDomains: true, preload: false }` | Strict-Transport-Security configuration. |
| `noSniff` | `Boolean` | `true` | Adds `X-Content-Type-Options: nosniff` when `true`. |
| `referrerPolicy` | `String` \| `false` | `'no-referrer'` | Referrer-Policy header value. |
| `xssProtection` | `Boolean` | `false` | Adds `X-XSS-Protection: 1; mode=block` when `true`. Disabled by default as modern browsers no longer need it. |
| `permissionsPolicy` | `String` \| `false` | `'camera=(), microphone=(), geolocation=()'` | Permissions-Policy header value. |

# Option Details

### contentSecurityPolicy
Controls which resources the browser is allowed to load. Can be provided as a string or as a directive object.

#### String Format
```javascript
helmet: {
    contentSecurityPolicy: "default-src 'self'; script-src 'self' https://cdn.example.com",
}
```

#### Object Format
```javascript
helmet: {
    contentSecurityPolicy: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", 'https://cdn.example.com'],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", 'data:', 'https:'],
    },
}
```
* Keys are written in camelCase and automatically converted to the correct directive format (e.g. `scriptSrc` → `script-src`).
* Values can be a string or an array of strings.

#### Disable
```javascript
helmet: {
    contentSecurityPolicy: false,
}
```

### hsts (Strict-Transport-Security)
Tells browsers to only access the site over HTTPS.

| Property | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `maxAge` | `Number` | `31536000` (1 year) | Time in seconds the browser should remember to only use HTTPS. |
| `includeSubDomains` | `Boolean` | `true` | Apply HSTS to all subdomains. |
| `preload` | `Boolean` | `false` | Allow inclusion in browser HSTS preload lists. |

```javascript
helmet: {
    hsts: {
        maxAge: 63072000,       // 2 years
        includeSubDomains: true,
        preload: true,
    },
}
```

#### Disable HSTS
```javascript
helmet: {
    hsts: false,
}
```

### frameguard (X-Frame-Options)
Controls whether the page can be embedded in `<iframe>`, `<frame>`, `<embed>` or `<object>` elements.

| Value | Description |
| :--- | :--- |
| `'sameorigin'` | Allow framing only from the same origin. |
| `'deny'` | Disallow all framing. |
| `false` | Do not set the header. |

### referrerPolicy
Controls how much referrer information is sent with requests.

| Value | Description |
| :--- | :--- |
| `'no-referrer'` | Never send referrer information. **(Default)** |
| `'no-referrer-when-downgrade'` | Send full URL for same-security, nothing for downgrades. |
| `'origin'` | Only send the origin (scheme + host + port). |
| `'origin-when-cross-origin'` | Full URL for same-origin, origin only for cross-origin. |
| `'same-origin'` | Send full URL for same-origin, nothing for cross-origin. |
| `'strict-origin'` | Send origin for same-security, nothing for downgrades. |
| `'strict-origin-when-cross-origin'` | Full URL same-origin, origin cross-origin, nothing on downgrade. |
| `'unsafe-url'` | Always send full URL (not recommended). |

### permissionsPolicy
Controls which browser features the page is allowed to use.

```javascript
helmet: {
    permissionsPolicy: 'camera=(), microphone=(), geolocation=(), payment=(self)',
}
```
* Each directive follows the format `feature=(allowlist)`.
* Empty `()` means the feature is disabled entirely.
* `(self)` allows usage on the current origin only.
* `(*)` allows usage on any origin.

# Default Headers
With `helmet: true`, every response will include these headers:

```
Content-Security-Policy: default-src 'self'
Cross-Origin-Embedder-Policy: require-corp
Cross-Origin-Opener-Policy: same-origin
Cross-Origin-Resource-Policy: same-origin
X-DNS-Prefetch-Control: off
X-Frame-Options: SAMEORIGIN
Strict-Transport-Security: max-age=31536000; includeSubDomains
X-Content-Type-Options: nosniff
Referrer-Policy: no-referrer
Permissions-Policy: camera=(), microphone=(), geolocation=()
```

# Performance
All security headers are pre-computed once during Server construction and cached as an array of key-value pairs. This means applying Helmet has **zero parsing or computation overhead** per request — it simply iterates over the cached pairs and sets them on the response.

# Disabling Helmet
Helmet is disabled by default. To explicitly disable it:
```javascript
const app = new HyperExpress.Server({
    helmet: false, // default, no security headers are added
});
```

To disable individual headers, set them to `false`:
```javascript
const app = new HyperExpress.Server({
    helmet: {
        contentSecurityPolicy: false,
        hsts: false,
        frameguard: false,
    },
});
```
