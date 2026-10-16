export class FormHelper {
  static submitForm(formPostKeyValues: Map<string, string>, action: string) {
    const form = document.createElement('form');
    const encodedUrl = encodeURI(action);

    form.id = 'redirectForm';
    form.method = 'POST';
    form.action = encodedUrl;
    formPostKeyValues.forEach((value, key) => {
      const input = document.createElement('input');
      input.type = 'text';
      input.name = key;
      input.value = value;
      form.appendChild(input);
    });

    document.body.appendChild(form);
    form.submit();
    form.remove();
  }
}
