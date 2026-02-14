# Validation (Zod-Based Request Validation)
HyperExpress provides built-in request validation powered by [Zod](https://zod.dev). Schemas can be defined per-route for `body`, `query` and `params`, with validated data accessible through `req.validated`. This eliminates boilerplate validation code and ensures consistent error responses across your application.

**Note:** Zod is an optional peer dependency. Install it with `npm install zod` before enabling validation.
* See [`> [Server]`](./Server.md) for more information on Server constructor options.
* See [`> [Router]`](./Router.md) for more information on route options.

# How To Use

### 1. Install Zod
```bash
npm install zod
```

### 2. Enable Validation in Server Options
```javascript
const HyperExpress = require('hyper-express');

const app = new HyperExpress.Server({
    validation: true,
});
```

### 3. Define Schemas and Attach Them to Routes
```javascript
const { z } = require('zod');

const CreateUserSchema = z.object({
    name: z.string().min(2).max(100),
    email: z.string().email(),
    age: z.number().int().min(18).optional(),
    role: z.enum(['admin', 'user', 'moderator']).default('user'),
});

app.post('/users', {
    validate: {
        body: CreateUserSchema,
    },
}, (req, res) => {
    // req.validated.body contains the validated and typed data
    const user = req.validated.body;
    res.json({ created: user });
});
```

# Configuration Options
Validation is configured through the Server constructor options. Pass `true` for defaults or an object for custom configuration.

| Option | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `targets` | `String[]` | `[]` | Which targets to validate. Empty array means all (`body`, `query`, `params`). |
| `abortEarly` | `Boolean` \| `String` | `'dev'` | Controls error collection behavior. |
| `stripUnknown` | `Boolean` | `true` | Remove fields not defined in the schema from validated data. |
| `errorFormat` | `String` | `'flat'` | Error response format: `'flat'` or `'nested'`. |

#### Example with All Options
```javascript
const app = new HyperExpress.Server({
    validation: {
        targets: [],            // validate all targets (body, query, params)
        abortEarly: 'dev',      // collect all errors in development, abort in production
        stripUnknown: true,     // remove unknown fields
        errorFormat: 'flat',    // flat error array format
    },
});
```

# Option Details

### targets
Controls which request parts are validated when a schema is provided.

| Value | Description |
| :--- | :--- |
| `[]` (empty) | Validate all targets that have a schema defined. **(Default)** |
| `['body']` | Only validate the request body, even if `query` or `params` schemas exist. |
| `['body', 'query']` | Validate body and query, skip params. |
| `['body', 'query', 'params']` | Explicitly validate all three (same as empty array). |

### abortEarly
Controls how validation errors are handled.

| Value | Behavior |
| :--- | :--- |
| `true` | Stop at the first validation target that fails. Only return errors for that target. |
| `false` | Validate all targets and collect all errors before responding. |
| `'dev'` | **Development** (`NODE_ENV !== 'production'`): collect all errors. **Production** (`NODE_ENV === 'production'`): abort at first failure. **(Default)** |
| `'true_collect'` | Abort at the first failure (respond with only that error), but internally log/collect all errors. Useful for monitoring. |

#### Example: Behavior of `abortEarly` Modes
Given a request with invalid `body`, `query` and `params`:

| Mode | Errors Returned | Behavior |
| :--- | :--- | :--- |
| `true` | `{ body: [...] }` | Stopped after body failed. |
| `false` | `{ body: [...], query: [...], params: [...] }` | All targets validated. |
| `'dev'` (development) | `{ body: [...], query: [...], params: [...] }` | All targets validated. |
| `'dev'` (production) | `{ body: [...] }` | Stopped after body failed. |
| `'true_collect'` | `{ body: [...] }` | Stopped after body, but all were checked internally. |

### stripUnknown
When `true`, fields not defined in the Zod schema are automatically removed from `req.validated`. This prevents unexpected data from passing through.

```javascript
// Schema only defines 'name' and 'email'
const schema = z.object({ name: z.string(), email: z.string().email() });

// Request body: { name: 'Max', email: 'max@example.com', isAdmin: true }
// req.validated.body: { name: 'Max', email: 'max@example.com' }
// 'isAdmin' is stripped
```

### errorFormat

#### `'flat'` (Default)
Returns errors as a flat array per target:
```json
{
    "code": "VALIDATION_ERROR",
    "errors": {
        "body": [
            { "path": "email", "message": "Invalid email address", "code": "invalid_format" },
            { "path": "age", "message": "Too small: expected number to be >=18", "code": "too_small" }
        ]
    }
}
```

#### `'nested'`
Returns errors as a nested object matching the schema structure:
```json
{
    "code": "VALIDATION_ERROR",
    "errors": {
        "body": {
            "email": { "message": "Invalid email address", "code": "invalid_format" },
            "age": { "message": "Too small: expected number to be >=18", "code": "too_small" }
        }
    }
}
```

# Route Schema Definition
Schemas are attached to routes through the `validate` option in the route options object. You can define schemas for `body`, `query` and `params` independently.

#### Body Validation
```javascript
const CreateProductSchema = z.object({
    name: z.string().min(1).max(200),
    price: z.number().positive(),
    category: z.enum(['electronics', 'clothing', 'food']),
    tags: z.array(z.string()).optional(),
});

app.post('/products', {
    validate: { body: CreateProductSchema },
}, (req, res) => {
    res.json({ product: req.validated.body });
});
```

#### Query Validation
```javascript
const PaginationSchema = z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
    sort: z.enum(['asc', 'desc']).default('desc'),
    search: z.string().optional(),
});

app.get('/products', {
    validate: { query: PaginationSchema },
}, (req, res) => {
    const { page, limit, sort, search } = req.validated.query;
    res.json({ page, limit, sort, search });
});
```
* **Note:** Query parameters are always strings from the URL. Use `z.coerce.number()` to automatically convert string values to numbers.

#### Params Validation
```javascript
const ProductIdSchema = z.object({
    id: z.string().uuid(),
});

app.get('/products/:id', {
    validate: { params: ProductIdSchema },
}, (req, res) => {
    res.json({ id: req.validated.params.id });
});
```

#### Combined Validation (Body + Query + Params)
```javascript
const UpdateProductSchema = z.object({
    name: z.string().min(1).max(200).optional(),
    price: z.number().positive().optional(),
});

const ProductIdSchema = z.object({
    id: z.string().uuid(),
});

const FieldsSchema = z.object({
    fields: z.string().optional(), // e.g. ?fields=name,price
});

app.put('/products/:id', {
    validate: {
        body: UpdateProductSchema,
        params: ProductIdSchema,
        query: FieldsSchema,
    },
}, (req, res) => {
    const { id } = req.validated.params;
    const updates = req.validated.body;
    const { fields } = req.validated.query;
    res.json({ id, updates, fields });
});
```

# Accessing Validated Data
Validated data is available on `req.validated` after the validation middleware runs. This object only contains targets that had schemas defined.

| Property | Type | Description |
| :--- | :--- | :--- |
| `req.validated.body` | `Object` | Validated request body (only present if a `body` schema was defined). |
| `req.validated.query` | `Object` | Validated query parameters (only present if a `query` schema was defined). |
| `req.validated.params` | `Object` | Validated route parameters (only present if a `params` schema was defined). |

* **Note:** `req.validated` is `null` if no validation schemas are defined for the route.
* **Note:** The original unvalidated data is still accessible via `req.json()`, `req.query_parameters` and `req.path_parameters`.

# Error Responses
When validation fails, HyperExpress automatically responds with HTTP `400 Bad Request` and a JSON error body:

```json
{
    "code": "VALIDATION_ERROR",
    "errors": {
        "body": [
            { "path": "name", "message": "Required", "code": "invalid_type" },
            { "path": "email", "message": "Invalid email address", "code": "invalid_format" }
        ],
        "params": [
            { "path": "id", "message": "Invalid UUID", "code": "invalid_format" }
        ]
    }
}
```

If the request body contains invalid JSON, a separate error is returned before schema validation:
```json
{
    "code": "INVALID_JSON",
    "message": "Request body contains invalid JSON"
}
```

# Full Example
```javascript
const HyperExpress = require('hyper-express');
const { z } = require('zod');

const app = new HyperExpress.Server({
    cors: true,
    helmet: true,
    validation: {
        abortEarly: 'dev',
        stripUnknown: true,
    },
});

// Schemas
const CreateUserSchema = z.object({
    name: z.string().min(2).max(100),
    email: z.string().email(),
    age: z.number().int().min(18).optional(),
    role: z.enum(['admin', 'user', 'moderator']).default('user'),
});

const UserIdSchema = z.object({
    id: z.string().uuid(),
});

const PaginationSchema = z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
});

// Routes
app.post('/users', {
    validate: { body: CreateUserSchema },
}, (req, res) => {
    res.json({ created: req.validated.body });
});

app.get('/users', {
    validate: { query: PaginationSchema },
}, (req, res) => {
    const { page, limit } = req.validated.query;
    res.json({ page, limit, users: [] });
});

app.get('/users/:id', {
    validate: { params: UserIdSchema },
}, (req, res) => {
    res.json({ id: req.validated.params.id });
});

app.put('/users/:id', {
    validate: {
        body: CreateUserSchema.partial(), // All fields optional for updates
        params: UserIdSchema,
    },
}, (req, res) => {
    res.json({
        id: req.validated.params.id,
        updates: req.validated.body,
    });
});

app.listen(3000).then(() => {
    console.log('Server running on port 3000');
});
```

# Disabling Validation
Validation is disabled by default. To explicitly disable it:
```javascript
const app = new HyperExpress.Server({
    validation: false, // default, no validation is performed
});
```

Routes without a `validate` option are never validated, even when validation is globally enabled.
