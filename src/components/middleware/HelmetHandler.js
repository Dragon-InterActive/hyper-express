'use strict';

/**
 * Default Helmet configuration (secure defaults).
 */
const HELMET_DEFAULTS = {
    contentSecurityPolicy: "default-src 'self'",
    crossOriginEmbedderPolicy: 'require-corp',
    crossOriginOpenerPolicy: 'same-origin',
    crossOriginResourcePolicy: 'same-origin',
    dnsPrefetchControl: false,
    frameguard: 'sameorigin',
    hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: false,
    },
    noSniff: true,
    referrerPolicy: 'no-referrer',
    xssProtection: false,
    permissionsPolicy: 'camera=(), microphone=(), geolocation=()',
};

class HelmetHandler {
    #config;
    #cached_headers = null;

    /**
     * Creates a new HelmetHandler instance.
     * @param {Boolean|Object} options - `true` for secure defaults, or a config object.
     */
    constructor(options) {
        if (options === true) {
            this.#config = { ...HELMET_DEFAULTS };
        } else if (options && typeof options === 'object') {
            // Deep merge for hsts
            const hsts =
                options.hsts === false
                    ? false
                    : options.hsts && typeof options.hsts === 'object'
                      ? { ...HELMET_DEFAULTS.hsts, ...options.hsts }
                      : HELMET_DEFAULTS.hsts;

            this.#config = { ...HELMET_DEFAULTS, ...options, hsts };
        } else {
            this.#config = null;
        }

        // Pre-build the static headers map for performance
        if (this.#config) {
            this.#cached_headers = this._build_headers();
        }
    }

    /**
     * Whether Helmet handling is enabled.
     * @returns {Boolean}
     */
    get enabled() {
        return this.#config !== null;
    }

    /**
     * Returns the resolved Helmet configuration.
     * @returns {Object|null}
     */
    get config() {
        return this.#config;
    }

    /**
     * Builds the static security headers map from the config.
     * This is called once during construction for optimal performance.
     *
     * @private
     * @returns {Array<[string, string]>} Array of [header_name, header_value] pairs.
     */
    _build_headers() {
        const headers = [];
        const config = this.#config;

        // Content-Security-Policy
        if (config.contentSecurityPolicy) {
            const value =
                typeof config.contentSecurityPolicy === 'string'
                    ? config.contentSecurityPolicy
                    : this._build_csp(config.contentSecurityPolicy);
            headers.push(['Content-Security-Policy', value]);
        }

        // Cross-Origin-Embedder-Policy
        if (config.crossOriginEmbedderPolicy) {
            headers.push(['Cross-Origin-Embedder-Policy', config.crossOriginEmbedderPolicy]);
        }

        // Cross-Origin-Opener-Policy
        if (config.crossOriginOpenerPolicy) {
            headers.push(['Cross-Origin-Opener-Policy', config.crossOriginOpenerPolicy]);
        }

        // Cross-Origin-Resource-Policy
        if (config.crossOriginResourcePolicy) {
            headers.push(['Cross-Origin-Resource-Policy', config.crossOriginResourcePolicy]);
        }

        // X-DNS-Prefetch-Control
        headers.push(['X-DNS-Prefetch-Control', config.dnsPrefetchControl ? 'on' : 'off']);

        // X-Frame-Options
        if (config.frameguard) {
            const value = config.frameguard === true ? 'SAMEORIGIN' : config.frameguard.toUpperCase();
            headers.push(['X-Frame-Options', value]);
        }

        // Strict-Transport-Security
        if (config.hsts && config.hsts !== false) {
            let value = `max-age=${config.hsts.maxAge}`;
            if (config.hsts.includeSubDomains) value += '; includeSubDomains';
            if (config.hsts.preload) value += '; preload';
            headers.push(['Strict-Transport-Security', value]);
        }

        // X-Content-Type-Options
        if (config.noSniff) {
            headers.push(['X-Content-Type-Options', 'nosniff']);
        }

        // Referrer-Policy
        if (config.referrerPolicy) {
            headers.push(['Referrer-Policy', config.referrerPolicy]);
        }

        // X-XSS-Protection (legacy, disabled by default)
        if (config.xssProtection) {
            headers.push(['X-XSS-Protection', '1; mode=block']);
        }

        // Permissions-Policy
        if (config.permissionsPolicy) {
            headers.push(['Permissions-Policy', config.permissionsPolicy]);
        }

        return headers;
    }

    /**
     * Builds a CSP string from a directive object.
     *
     * @private
     * @param {Object} directives - Object with directive names as keys and values as strings or arrays.
     * @returns {String}
     */
    _build_csp(directives) {
        return Object.entries(directives)
            .map(([key, value]) => {
                const directive = key.replace(/([A-Z])/g, '-$1').toLowerCase();
                const sources = Array.isArray(value) ? value.join(' ') : value;
                return `${directive} ${sources}`;
            })
            .join('; ');
    }

    /**
     * Applies security headers to the response.
     *
     * @param {import('../http/Request.js')} request
     * @param {import('../http/Response.js')} response
     */
    apply(request, response) {
        if (!this.#cached_headers) return;

        for (const [name, value] of this.#cached_headers) {
            response.header(name, value);
        }
    }
}

module.exports = HelmetHandler;
