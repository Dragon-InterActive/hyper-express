'use strict';

/**
 * Default CORS configuration (permissive).
 */
const CORS_DEFAULTS = {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    exposedHeaders: [],
    credentials: false,
    maxAge: 86400,
};

class CorsHandler {
    #config;

    /**
     * Creates a new CorsHandler instance.
     * @param {Boolean|Object} options - `true` for permissive defaults, or a config object.
     */
    constructor(options) {
        if (options === true) {
            this.#config = { ...CORS_DEFAULTS };
        } else if (options && typeof options === 'object') {
            this.#config = { ...CORS_DEFAULTS, ...options };
        } else {
            this.#config = null;
        }
    }

    /**
     * Whether CORS handling is enabled.
     * @returns {Boolean}
     */
    get enabled() {
        return this.#config !== null;
    }

    /**
     * Returns the resolved CORS configuration.
     * @returns {Object|null}
     */
    get config() {
        return this.#config;
    }

    /**
     * Resolves the allowed origin for a given request origin.
     *
     * @param {String} requestOrigin - The Origin header from the incoming request.
     * @returns {String|null} The origin to set in Access-Control-Allow-Origin, or null if not allowed.
     */
    _resolve_origin(requestOrigin) {
        const origin = this.#config.origin;

        // Wildcard allows all origins
        if (origin === '*') {
            // When credentials are enabled, we must reflect the request origin instead of '*'
            return this.#config.credentials && requestOrigin ? requestOrigin : '*';
        }

        // String origin must match exactly
        if (typeof origin === 'string') {
            return origin === requestOrigin ? origin : null;
        }

        // RegExp origin test
        if (origin instanceof RegExp) {
            return origin.test(requestOrigin) ? requestOrigin : null;
        }

        // Array of allowed origins
        if (Array.isArray(origin)) {
            for (const allowed of origin) {
                if (typeof allowed === 'string' && allowed === requestOrigin) return requestOrigin;
                if (allowed instanceof RegExp && allowed.test(requestOrigin)) return requestOrigin;
            }
            return null;
        }

        // Function-based origin resolver
        if (typeof origin === 'function') {
            const result = origin(requestOrigin);
            return result ? requestOrigin : null;
        }

        return null;
    }

    /**
     * Applies CORS headers to the response for a normal (non-preflight) request.
     *
     * @param {import('../http/Request.js')} request
     * @param {import('../http/Response.js')} response
     */
    apply(request, response) {
        if (!this.#config) return;

        const requestOrigin = request.headers['origin'] || '';
        const allowedOrigin = this._resolve_origin(requestOrigin);

        // If origin is not allowed, skip CORS headers entirely
        if (!allowedOrigin) return;

        response.header('Access-Control-Allow-Origin', allowedOrigin);

        // Vary on Origin when not using wildcard
        if (allowedOrigin !== '*') {
            response.header('Vary', 'Origin');
        }

        // Expose headers
        if (this.#config.exposedHeaders.length > 0) {
            response.header('Access-Control-Expose-Headers', this.#config.exposedHeaders.join(', '));
        }

        // Credentials
        if (this.#config.credentials) {
            response.header('Access-Control-Allow-Credentials', 'true');
        }
    }

    /**
     * Handles a CORS preflight (OPTIONS) request.
     * Returns `true` if the request was a preflight and has been fully handled.
     *
     * @param {import('../http/Request.js')} request
     * @param {import('../http/Response.js')} response
     * @returns {Boolean} Whether the preflight was handled.
     */
    preflight(request, response) {
        if (!this.#config) return false;

        // A preflight must be an OPTIONS request with an Origin and Access-Control-Request-Method header
        const requestOrigin = request.headers['origin'];
        const requestMethod = request.headers['access-control-request-method'];
        if (!requestOrigin || !requestMethod) return false;

        const allowedOrigin = this._resolve_origin(requestOrigin);
        if (!allowedOrigin) {
            // Origin not allowed, respond with 403
            response.status(403).send();
            return true;
        }

        response.header('Access-Control-Allow-Origin', allowedOrigin);

        if (allowedOrigin !== '*') {
            response.header('Vary', 'Origin');
        }

        // Allowed methods
        response.header('Access-Control-Allow-Methods', this.#config.methods.join(', '));

        // Allowed headers - reflect requested headers if configured as wildcard, otherwise use config
        const requestHeaders = request.headers['access-control-request-headers'];
        if (requestHeaders) {
            response.header('Access-Control-Allow-Headers', this.#config.allowedHeaders.join(', '));
        }

        // Max age
        if (this.#config.maxAge) {
            response.header('Access-Control-Max-Age', String(this.#config.maxAge));
        }

        // Credentials
        if (this.#config.credentials) {
            response.header('Access-Control-Allow-Credentials', 'true');
        }

        // Respond with 204 No Content
        response.status(204).send();
        return true;
    }
}

module.exports = CorsHandler;
