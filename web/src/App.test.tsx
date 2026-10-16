import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import * as Router from './containers/Router';
import App from './App';

vi.mock('./containers/Router');

describe('Simple working test', () => {
  vi.spyOn(Router, 'Router').mockImplementation(() => <h1>Hello world</h1>);

  it('the title is visible', () => {
    const result = render(<App basename='/' />);
    expect(result).toMatchSnapshot();
  });
});
