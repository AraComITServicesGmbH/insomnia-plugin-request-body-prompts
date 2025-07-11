# insomnia-plugin-request-body-prompts

Prompt users for variables in your Insomnia request body before sending a request.

## Features

- Define variables in your request body using the pattern `<<prompt:Your question here:defaultValue>>`
- Before sending the request, a dialog appears for each unique prompt, allowing you to input values
- All prompt variables in the body are replaced by your answers before the request is actually sent

## Installation

1. In Insomnia, go to **Preferences > Plugins**
2. Search for `insomnia-plugin-request-body-prompts`
3. Install the plugin
4. Restart Insomnia if necessary

## Usage

### Set the Request Body

In your request body (e.g., JSON or raw text), insert variables using double angle brackets and the word `prompt`:

```json
{
  "username": "<<prompt:Enter username>>",
  "password": "<<prompt:Enter your password>>"
}
```

### Default Values
You can provide a default value for each prompt by adding a colon and the value:

```json
{
  "username": "<<prompt:Enter username:john_doe>>",
  "apiKey": "<<prompt:API Key:sk-123456>>",
  "note": "<<prompt:Any note here>>"
}
```
The text before the first colon is the question shown in the dialog.

The text after the colon is the default value, which is pre-filled in the prompt dialog.

If you leave out the default, the prompt will be empty by default.

## Operating principle

### Body before sending:

```json
{
  "email": "<<prompt:Please enter your email address:user@example.com>>",
  "password": "<<prompt:Please enter your password>>"
}
```
On Send:
You’ll see a dialog for each prompt, with the default value pre-filled if provided.

### Resulting body (sent):

```json
{
  "email": "user@example.com",
  "secret": "supersecret"
}
```

### Prompt Cancellation
If you cancel a prompt (by clicking "Cancel" or closing the dialog),

The request will not be sent.

Insomnia will typically show an error box stating "Failed to transform request with plugins."

This is a limitation of the Insomnia plugin system: plugins cannot suppress this error box when aborting a request for user experience reasons.

You will not get a success response or an incomplete request.

## Technical Notes
Pattern: The plugin looks for variables matching <<prompt:Your question[:default value]>>

Insomnia Version: This plugin supports Insomnia 11.x and newer (uses the async plugin API)

Supported Body Types: JSON and raw text bodies.
For other body types (form, multipart), the plugin does nothing.

Do not use this plugin via the "Scripts" tab—only as a proper Insomnia plugin.

### Troubleshooting
If you do not see the dialog, make sure:

- You are using a POST/PUT/PATCH request with a non-empty body

- The body type is set to JSON or Text (raw)

- You are using the correct <<prompt:...>> syntax (not curly braces)

- If you cancel a prompt, the request will be aborted and an error box will appear (this is expected).

