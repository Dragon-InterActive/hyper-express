# @masternemo/hyper-express
### Community Fork — High Performance Node.js Webserver
#### Powered by [`uWebSockets.js`](https://github.com/uNetworking/uWebSockets.js/)

<div align="left">

[![NPM version](https://img.shields.io/npm/v/@masternemo/hyper-express.svg?style=flat)](https://www.npmjs.com/package/@masternemo/hyper-express)
[![NPM downloads](https://img.shields.io/npm/dm/@masternemo/hyper-express.svg?style=flat)](https://www.npmjs.com/package/@masternemo/hyper-express)
[![GitHub issues](https://img.shields.io/github/issues/Dragon-InterActive/hyper-express)](https://github.com/Dragon-InterActive/hyper-express/issues)
[![GitHub stars](https://img.shields.io/github/stars/Dragon-InterActive/hyper-express)](https://github.com/Dragon-InterActive/hyper-express/stargazers)
[![GitHub license](https://img.shields.io/github/license/Dragon-InterActive/hyper-express)](https://github.com/Dragon-InterActive/hyper-express/blob/master/LICENSE)

</div>

## About This Fork
This is an actively maintained **community fork** of [kartikk221/hyper-express](https://github.com/kartikk221/hyper-express), which has not received updates since late 2024. This fork includes:

- **Bug Fixes** from unmerged community Pull Requests
- **Built-in CORS** — Native cross-origin handling as a Server option
- **Built-in Helmet** — Security headers out of the box with zero per-request overhead
- **Built-in Zod Validation** — Schema-based request validation for body, query & params
- **Updated Dependencies** — uWebSockets.js v20.57.0 with Node.js v24 support

This package is a **drop-in replacement** for `hyper-express`. Simply change your install and import — no code changes required. The built-in middleware features are opt-in and disabled by default.

## Quick Start
```javascript
const HyperExpress = require('@masternemo/hyper-express');

const app = new HyperExpress.Server({
    cors: true,       // Built-in CORS with permissive defaults
    helmet: true,     // Built-in security headers
    validation: true, // Built-in Zod validation (requires: npm i zod)
});

app.get('/', (req, res) => {
    res.json({ hello: 'world' });
});

app.listen(3000).then(() => console.log('Server running on port 3000'));
```

## Installation
```
npm i @masternemo/hyper-express
```

### Migrating from hyper-express
Replace your existing dependency:
```
npm uninstall hyper-express
npm i @masternemo/hyper-express
```

Update your imports:
```javascript
// Before
const HyperExpress = require('hyper-express');

// After
const HyperExpress = require('@masternemo/hyper-express');
```

All existing code will continue to work without changes.

## What's Different From the Original?
| Feature | hyper-express (original) | @masternemo/hyper-express |
| :--- | :---: | :---: |
| Active maintenance | ❌ (since late 2024) | ✅ |
| Community bug fixes | ❌ (unmerged PRs) | ✅ |
| Node.js v24 support | ❌ | ✅ |
| Built-in CORS | ❌ | ✅ |
| Built-in Security Headers | ❌ | ✅ |
| Built-in Request Validation | ❌ | ✅ |
| Express.js compatibility | ✅ | ✅ |

## Motivation
HyperExpress aims to be a simple yet performant HTTP & Websocket Server. Combined with the power of uWebsockets.js, a Node.js binding of uSockets written in C++, HyperExpress allows developers to unlock higher throughput for their web applications with their existing hardware. This can allow many web applications to become much more performant on optimized data serving endpoints without having to scale hardware.

Some of the prominent highlights are:
- Simplified HTTP & Websocket API
- Server-Sent Events Support
- Multipart File Uploading Support
- Modular Routers & Middlewares Support
- Multiple Host/Domain Support Over SSL
- Limited Express.js API Compatibility Through Shared Methods/Properties
- Built-in CORS, Helmet & Zod Validation

See [`> [Benchmarks]`](https://web-frameworks-benchmark.netlify.app/result?l=javascript) for **performance metrics** against other webservers in real world deployments.

## Documentation
- See [`> [Examples & Snippets]`](./docs/Examples.md) for small and **easy-to-use snippets** with HyperExpress.
- See [`> [Server]`](./docs/Server.md) for creating a webserver and working with the **Server** component.
- See [`> [Router]`](./docs/Router.md) for working with the modular **Router** component.
- See [`> [Request]`](./docs/Request.md) for working with the **Request** component made available through handlers.
- See [`> [Response]`](./docs/Response.md) for working with the **Response** component made available through handlers.
- See [`> [Websocket]`](./docs/Websocket.md) for working with **Websockets** in HyperExpress.
- See [`> [Middlewares]`](./docs/Middlewares.md) for working with global and route-specific **Middlewares** in HyperExpress.
- See [`> [Cors]`](./docs/Cors.md) for configuring built-in **CORS** handling in HyperExpress.
- See [`> [Helmet]`](./docs/Helmet.md) for configuring built-in **Security Headers** in HyperExpress.
- See [`> [Validation]`](./docs/Validation.md) for configuring built-in **Zod-based Request Validation** in HyperExpress.
- See [`> [SSEventStream]`](./docs/SSEventStream.md) for working with **Server-Sent Events** based streaming in HyperExpress.
- See [`> [MultipartField]`](./docs/MultipartField.md) for working with multipart requests and **File Uploading** in HyperExpress.
- See [`> [SessionEngine]`](https://github.com/kartikk221/hyper-express-session) for working with cookie based web **Sessions** in HyperExpress.
- See [`> [LiveDirectory]`](./docs/LiveDirectory.md) for implementing **static file/asset** serving functionality into HyperExpress.
- See [`> [HostManager]`](./docs/HostManager.md) for supporting requests over **multiple hostnames** in HyperExpress.

## Encountering Problems?
- HyperExpress is mostly compatible with `Express` but not **100%** therefore you may encounter some middlewares not working out of the box. In this scenario, you must either write your own polyfill or omit the middleware to continue.
- The uWebsockets.js version header is disabled by default. You may opt-out of this behavior by setting an environment variable called `KEEP_UWS_HEADER` to a truthy value such as `1` or `true`.
- Still having problems? Open an [`> [Issue]`](https://github.com/Dragon-InterActive/hyper-express/issues) with details about what led up to the problem including error traces, route information etc etc.

## Testing Changes
To run HyperExpress functionality tests locally on your machine, you must follow the steps below.
1. Clone the HyperExpress repository to your machine.
2. Initialize and pull any submodule(s) which are used throughout the tests.
3. Run `npm install` in the root directory.
4. Run `npm install` in the `/tests` directory.
5. Run `npm test` to run all tests with your local changes.

## Credits
This fork is based on the original work by [Kartik Kumar](https://github.com/kartikk221) and the [hyper-express](https://github.com/kartikk221/hyper-express) community. Bug fixes included in this fork were contributed by community members including [fawzyOz](https://github.com/kartikk221/hyper-express/pull/332) and [RatchetS2](https://github.com/kartikk221/hyper-express/pull/341).

## License
[MIT](./LICENSE)
