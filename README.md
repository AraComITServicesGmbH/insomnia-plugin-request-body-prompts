# insomnia-plugin-request-body-prompts

Prompt users for variables in your Insomnia request body before sending a request.

## Features

- Define prompt variables in your request body using the attribute pattern  
  `<<prompt question='Your question' type='type' default='value' nullable='true'>>`
- Supports types (`number`, `boolean`, `string`) and nullability
- Shows a dialog before sending, allowing input per prompt (with defaults)
- All prompt variables in the body are replaced by your answers before the request is sent


## Installation

1. In Insomnia, go to **Preferences > Plugins**
2. Search for `insomnia-plugin-request-body-prompts`
3. Install the plugin
4. Restart Insomnia if necessary

## Usage

### Set the Request Body

In your request body (e.g., JSON or raw text), insert variables using the prompt tag:

```json
{
  "amount": "<<prompt question='Enter amount' type='number' default='42'>>",
  "active": "<<prompt question='Is active?' type='boolean' default='true'>>",
  "description": "<<prompt question='Description' nullable='true'>>"
}
```

**Attributes:**
- `question` (required): Text shown in the dialog
- `type`: `"string"` (default), `"number"`, or `"boolean"`
- `default`: Default value pre-filled in the dialog (optional)
- `nullable`: `"true"` or `"1"` (optional) — allows null/empty answers

**Defaults:**  
If you omit an attribute, the plugin uses these defaults:
- `type='string'`
- `default=''` (empty string)
- `nullable=false`

## Operating principle

### Body before sending:

```json
{
  "amount": "<<prompt question='Enter amount' type='number' default='42'>>",
  "comment": "<<prompt question='Optional comment' nullable='true'>>"
}
```

### On Send:
You’ll see a dialog for each prompt, with your question, default value, and type hint.

### Resulting body (sent):
```json
{
  "amount": 42,
  "comment": null
}
```

### Prompt Cancellation
If you cancel a prompt (by clicking "Cancel" or closing the dialog),

The request will not be sent.

Insomnia will typically show an error box stating "Failed to transform request with plugins."

This is a limitation of the Insomnia plugin system: plugins cannot suppress this error box when aborting a request for user experience reasons.

You will not get a success response or an incomplete request.

## Technical Notes
- **Pattern:**  
  The plugin looks for variables matching:  
  `<<prompt question='...' [type='...'] [default='...'] [nullable='true']>>`
- **Insomnia Version:**  
  Supports Insomnia 11.x and newer (uses the async plugin API)
- **Supported Body Types:**  
  JSON and raw text bodies. For other body types (form, multipart), the plugin does nothing.
- **Do not use this plugin via the "Scripts" tab** — only as a proper Insomnia plugin.

### Troubleshooting

- If you do not see the dialog, make sure:
  - You are using a POST/PUT/PATCH request with a non-empty body
  - The body type is set to JSON or Text (raw)
  - You are using the correct `<<prompt ...>>` syntax (not curly braces)
- If you cancel a prompt, the request will be aborted and an error box will appear (this is expected).

