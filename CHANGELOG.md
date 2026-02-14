## 6.18.0

First release as `@masternemo/hyper-express` — an actively maintained community fork of [hyper-express](https://github.com/kartikk221/hyper-express).

### Package

* Published as `@masternemo/hyper-express` on npm
* Author set to `HyperExpress Community` with original author Kartik Kumar credited as contributor
* All repository URLs point to [Dragon-InterActive/hyper-express](https://github.com/Dragon-InterActive/hyper-express)
* Version upgrade uWebsockets.js from v20.51.0 to v20.57.0 to support Node.js v24
* Updated ES-Version to ES2024

### Bug Fixes

Integrated unmerged community Pull Requests from the original repository:

* **query setter** — pulled by fawzyOz (<https://github.com/kartikk221/hyper-express/pull/332>)
  * Affected files: src/components/compatibility/ExpressRequest.js, src/components/http/Request.js
* **request.accept* bug** — pulled by RatchetS2 (<https://github.com/kartikk221/hyper-express/pull/341>)
  * Affected files: src/components/compatibility/ExpressRequest.js

### Built-in CORS Support

Native CORS handling as Server option with permissive defaults. Supports string, array, RegExp and function-based origin matching, automatic preflight (OPTIONS) handling and configurable credentials, methods, headers and maxAge.

* New file: `src/components/middleware/CorsHandler.js`
* Affected files: src/components/Server.js, index.js
* See [Cors Documentation](./docs/Cors.md)

### Built-in Helmet (Security Headers)

Native security headers as Server option with secure defaults. Headers are pre-cached at construction time for zero-overhead per request. Includes Content-Security-Policy, HSTS, X-Frame-Options, Referrer-Policy, Permissions-Policy and more.

* New file: `src/components/middleware/HelmetHandler.js`
* Affected files: src/components/Server.js, index.js
* See [Helmet Documentation](./docs/Helmet.md)

### Built-in Zod Validation

Native request validation as Server option with Zod schema support. Validation schemas are defined per-route via the `validate` option for `body`, `query` and `params`. Validated data is accessible via `req.validated`. Supports configurable abort modes (`true`, `false`, `dev`, `true_collect`), `stripUnknown` and `flat`/`nested` error formats.

Zod is declared as an optional peerDependency (`^3.0.0 || ^4.0.0`) and only required when validation is enabled.

* New file: `src/components/middleware/ValidationHandler.js`
* Affected files: src/components/Server.js, src/components/router/Route.js, src/components/http/Request.js, index.js, package.json
* See [Validation Documentation](./docs/Validation.md)

### Usage

```js
const HyperExpress = require('@masternemo/hyper-express');

const app = new HyperExpress.Server({
  cors: true,        // or { origin: ['http://localhost:3000'], credentials: true }
  helmet: true,      // or { frameguard: 'deny', hsts: { preload: true } }
  validation: true,  // or { abortEarly: 'dev', stripUnknown: true }
});
```

### Base

* Forked from <https://github.com/kartikk221/hyper-express> (v6.17.3)
