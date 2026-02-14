'use strict';

/**
 * Default Validation configuration.
 */
const VALIDATION_DEFAULTS = {
    targets: [], // empty = all (body, query, params)
    abortEarly: 'dev',
    stripUnknown: true,
    errorFormat: 'flat',
};

/**
 * All available validation targets.
 */
const ALL_TARGETS = ['body', 'query', 'params'];

class ValidationHandler {
    #config;

    /**
     * Creates a new ValidationHandler instance.
     * @param {Boolean|Object} options - `true` for defaults, or a config object.
     */
    constructor(options) {
        if (options === true) {
            this.#config = { ...VALIDATION_DEFAULTS };
        } else if (options && typeof options === 'object') {
            this.#config = { ...VALIDATION_DEFAULTS, ...options };
        } else {
            this.#config = null;
        }

        // Verify that Zod is available when validation is enabled
        if (this.#config) {
            try {
                require('zod');
            } catch (error) {
                throw new Error(
                    'HyperExpress: Validation requires the "zod" package. Please install it: npm install zod'
                );
            }
        }
    }

    /**
     * Whether validation is enabled globally.
     * @returns {Boolean}
     */
    get enabled() {
        return this.#config !== null;
    }

    /**
     * Returns the resolved validation configuration.
     * @returns {Object|null}
     */
    get config() {
        return this.#config;
    }

    /**
     * Determines whether to abort early based on the config setting and NODE_ENV.
     *
     * @private
     * @returns {{ abort: Boolean, collect: Boolean }}
     */
    _resolve_abort_mode() {
        const mode = this.#config.abortEarly;
        const is_production = process.env.NODE_ENV === 'production';

        switch (mode) {
            case true:
                return { abort: true, collect: false };
            case false:
                return { abort: false, collect: true };
            case 'dev':
                return { abort: is_production, collect: !is_production };
            case 'true_collect':
                return { abort: true, collect: true };
            default:
                return { abort: true, collect: false };
        }
    }

    /**
     * Validates request data against the provided schemas for a route.
     *
     * @param {import('../http/Request.js')} request - The HyperExpress request.
     * @param {Object} schemas - Object with `body`, `query`, and/or `params` Zod schemas.
     * @returns {{ success: Boolean, data: Object|null, errors: Object|null }}
     */
    validate(request, schemas) {
        if (!this.#config || !schemas) {
            return { success: true, data: null, errors: null };
        }

        const { abort, collect } = this._resolve_abort_mode();
        const targets = this.#config.targets.length > 0 ? this.#config.targets : ALL_TARGETS;
        const strip = this.#config.stripUnknown;
        const flat = this.#config.errorFormat === 'flat';

        const validated = {};
        const errors = {};
        let has_errors = false;

        for (const target of targets) {
            // Skip targets that have no schema defined
            const schema = schemas[target];
            if (!schema) continue;

            // Retrieve the raw data from the request
            const raw_data = this._get_target_data(request, target);

            // Run Zod validation
            const result = schema.safeParse(raw_data);

            if (result.success) {
                // Apply stripUnknown: if enabled, use the parsed data (Zod strips by default with .strict() opt-in)
                validated[target] = strip ? result.data : { ...raw_data, ...result.data };
            } else {
                has_errors = true;
                errors[target] = flat ? this._format_flat(result.error) : this._format_nested(result.error);

                // If abort early and not collecting, stop at first target failure
                if (abort && !collect) {
                    return {
                        success: false,
                        data: Object.keys(validated).length > 0 ? validated : null,
                        errors,
                    };
                }
            }
        }

        if (has_errors) {
            return {
                success: false,
                data: Object.keys(validated).length > 0 ? validated : null,
                errors,
            };
        }

        return {
            success: true,
            data: validated,
            errors: null,
        };
    }

    /**
     * Retrieves the raw data for a given validation target from the request.
     *
     * @private
     * @param {import('../http/Request.js')} request
     * @param {String} target - 'body', 'query', or 'params'
     * @returns {Object}
     */
    _get_target_data(request, target) {
        switch (target) {
            case 'body':
                // Body is pre-parsed by the validation middleware via request.json()
                return request._body_json || request.body || {};
            case 'query':
                return request.query_parameters || {};
            case 'params':
                return request.path_parameters || {};
            default:
                return {};
        }
    }

    /**
     * Formats Zod errors as a flat array of error objects.
     *
     * @private
     * @param {import('zod').ZodError} error
     * @returns {Array<{ path: String, message: String }>}
     */
    _format_flat(error) {
        return error.issues.map((issue) => ({
            path: issue.path.join('.'),
            message: issue.message,
            code: issue.code,
        }));
    }

    /**
     * Formats Zod errors as a nested object matching the schema structure.
     *
     * @private
     * @param {import('zod').ZodError} error
     * @returns {Object}
     */
    _format_nested(error) {
        const nested = {};
        for (const issue of error.issues) {
            let current = nested;
            for (let i = 0; i < issue.path.length; i++) {
                const key = issue.path[i];
                if (i === issue.path.length - 1) {
                    current[key] = {
                        message: issue.message,
                        code: issue.code,
                    };
                } else {
                    if (!current[key] || typeof current[key] !== 'object') current[key] = {};
                    current = current[key];
                }
            }
        }
        return nested;
    }
}

module.exports = ValidationHandler;
