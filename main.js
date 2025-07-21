/**
 * Insomnia Plugin: Request Body Prompts with Attribute Syntax
 * 
 * Usage in body:
 *   "<<prompt question='Your question' type='number' default='123'>>"
 *   "<<prompt question='Is active?' type='boolean' default='true'>>"
 *   "<<prompt question='Description' nullable='true'>>"
 * 
 * Supported attributes:
 *   - question (required): Label for the prompt
 *   - type:      'string' (default), 'number', or 'boolean'
 *   - default:   Default value for the input
 *   - nullable:  'true' | '1' (optional). If set, empty answer returns null.
 * 
 * Example body:
 * {
 *   "amount": "<<prompt question='Enter amount' type='number' default='42'>>",
 *   "comment": "<<prompt question='Optional comment' nullable='true'>>"
 * }
 */

function parsePromptAttributes(str) {
    const attrs = {
        type: "string",
        default: "",
        nullable: false,
    };
    const attrRegex = /(\w+)='([^']*)'/g;
    let match;
    while ((match = attrRegex.exec(str)) !== null) {
        if (match[1] === "nullable") {
            attrs[match[1]] = /^true$/i.test(match[2]) || match[2] === "1";
            continue;
        }
        attrs[match[1]] = match[2];
    }
    return attrs;
}

// Makes a stable, unique key per prompt (for deduplication and value lookup)
function promptKey(attrs) {
    return [
        attrs.question || "",
        attrs.type || "",
        attrs.default || "",
        attrs.nullable ? "1" : "0"
    ].join("|");
}

module.exports.requestHooks = [
    async context => {
        const bodyObj = await context.request.getBody();
        if (!bodyObj || !bodyObj.text) return;
        let body = bodyObj.text;

        // Find all "<<prompt ...>>" (in quotes for valid JSON)
        const regex = /\"<<prompt\s+([^>]+)>>\"/g;
        regex.lastIndex = 0;
        let match, prompts = [], seen = new Set();

        while ((match = regex.exec(body)) !== null) {
            const attrString = match[1];
            const attrs = parsePromptAttributes(attrString);
            if (!attrs.question) continue; // must have a question
            const key = promptKey(attrs);
            if (!seen.has(key)) {
                prompts.push({ fullMatch: match[0], ...attrs });
                seen.add(key);
            }
        }
        if (prompts.length === 0) return;

        let answers = {};
        for (const prompt of prompts) {
            let promptLabel = prompt.question;
            let promptType = prompt.type || "string";
            if (prompt.nullable) promptType += " | null";
            if (prompt.type) promptLabel += ` [${promptType}]`;
            if (prompt.default) promptLabel += ` (Default: ${prompt.default})`;
            const answer = await context.app.prompt(
                prompt.question,
                {
                    label: promptLabel,
                    defaultValue: prompt.default || "",
                    submitName: "Confirm"
                }
            );
            if (answer === null || answer === undefined) {
                await context.app.alert(
                    "Request cancelled",
                    "The request was cancelled by the user (Prompt not answered)."
                );
                return;
            }

            // Optional type conversion
            let finalValue = answer;
            if (prompt.nullable && answer.length === 0) {
                finalValue = null;
            } else if (prompt.type === "number") {
                const num = Number(answer);
                finalValue = isNaN(num) ? (prompt.default || null) : num;
            } else if (prompt.type === "boolean") {
                finalValue = /^true$/i.test(answer) || answer === "1";
            } else {
                finalValue = `"${answer}"`
            }
            answers[promptKey(prompt)] = finalValue;
        }

        let newBody = body.replace(regex, (full, attrString) => {
            const attrs = parsePromptAttributes(attrString);
            const key = promptKey(attrs);
            const emptyVal = attrs.nullable ? null : "";
            console.log("debug", {key,answers,attrs,emptyVal});
            return typeof answers[key] !== "undefined" ? answers[key] : (attrs.default || emptyVal);
        });

        await context.request.setBody({
            mimeType: bodyObj.mimeType,
            text: newBody
        });
    }
];
