module.exports.requestHooks = [
  async context => {
    const bodyObj = await context.request.getBody();
    if (!bodyObj || !bodyObj.text) return;

    let body = bodyObj.text;

    // Regex for <<prompt:Question[:default]>>
    const regex = /<<prompt:([^:>]+)(?::([^>]*))?>>/g;
    regex.lastIndex = 0;
    let match, prompts = [], seen = new Set();

    while ((match = regex.exec(body)) !== null) {
      const question = (match[1] || '').trim();
      const defaultValue = match[2] !== undefined ? match[2] : '';
      if (!question) continue;
      if (!seen.has(question)) {
        prompts.push({ fullMatch: match[0], question, defaultValue });
        seen.add(question);
      }
    }
    if (prompts.length === 0) return;

    let answers = {};
    for (const prompt of prompts) {
      const answer = await context.app.prompt(
        prompt.question,
        {
          label: prompt.question,
          defaultValue: prompt.defaultValue,
          submitName: 'Confirm'
        }
      );
      if (answer === null || answer === undefined) {
        await context.app.alert(
          "Request cancelled",
          "The request was cancelled by the user (Prompt not answered)."
        );
        return;
      }
      answers[prompt.question] = answer;
    }

    let newBody = body.replace(regex, (full, question, defaultValue) => {
      question = (question || '').trim();
      return answers[question] ?? (defaultValue ?? '');
    });

    await context.request.setBody({
      mimeType: bodyObj.mimeType,
      text: newBody
    });
  }
];
