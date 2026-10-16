import { beforeEach, describe, expect, it, vi } from 'vitest';
import { FormHelper } from './formHelper';

describe('FormHelper', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    HTMLFormElement.prototype.submit = () => {};
  });

  it('Form is added with appendChild', () => {
    vi.spyOn(document.body, 'appendChild');
    const actionURL = 'actionURL';
    const form = document.createElement('form');
    form.id = 'redirectForm';
    form.action = actionURL;
    form.method = 'POST';
    const input = document.createElement('input');
    input.name = 'key1';
    input.type = 'text';
    input.value = 'value1';
    form.appendChild(input);
    const input2 = document.createElement('input');
    input2.name = 'key2';
    input2.type = 'text';
    input2.value = 'value2';
    form.appendChild(input2);
    vi.spyOn(document, 'createElement');
    const formPostKeyValueMap = new Map([
      ['key1', 'value1'],
      ['key2', 'value2']
    ]);
    const action = actionURL;
    FormHelper.submitForm(formPostKeyValueMap, action);
    expect(document.createElement).toBeCalledTimes(3);
    expect(document.createElement).toHaveBeenNthCalledWith(1, 'form');
    expect(document.createElement).toHaveBeenNthCalledWith(2, 'input');
    expect(document.createElement).toHaveBeenNthCalledWith(3, 'input');
    expect(document.body.appendChild).toBeCalledWith(form);
  });

  it('Form is submitted', () => {
    const formSubmitSpy = vi.spyOn(HTMLFormElement.prototype, 'submit');
    const actionURL = 'actionURL';
    const formPostKeyValueMap = new Map([['key1', 'value1']]);
    const action = actionURL;
    FormHelper.submitForm(formPostKeyValueMap, action);
    expect(formSubmitSpy).toBeCalledTimes(1);
  });

  it('Form is removed from DOM', () => {
    const actionURL = 'actionURL';
    const formPostKeyValueMap = new Map([['key1', 'value1']]);
    const action = actionURL;
    FormHelper.submitForm(formPostKeyValueMap, action);
    expect(document.querySelector('#redirectForm')).not.toBeInTheDocument();
  });
});
