//TODO to update to submit claim
import * as router from 'react-router';
import { describe, it, expect, vi } from 'vitest';
import { cleanup, waitFor } from '@testing-library/react';
import { renderHook } from '@testing-library/react-hooks';
import { submitAutoClaimFrontendResponseFixture, submitAutoClaimCarParked } from '@lib/types';
import { useSubmitClaim } from './useSubmitClaim';
import * as SourcesDictionary from '../../api/sources';
import { Sources } from '../../api/sources';
import { mockStateCarParked } from '../../shared/fixtures';
import * as RequestMapper from './createSubmitClaimRequest';
import * as Actions from '../../store/actions';

let mockedFn = vi.fn();
const mockedDispatch = vi.fn();
let createRequestBodySpy;

describe('useAOConfirmation', () => {
  beforeEach(() => {
    vi.spyOn(Actions, 'setClaimSubmittedForClaimNumber').mockImplementation(claimNumber => ({
      type: 'SET_CLAIM_SUBMITTED_FOR_CLAIM_NUMBER',
      payload: claimNumber
    }));

    vi.spyOn(router, 'useOutletContext').mockImplementation(() => [
      {
        ...mockStateCarParked
      },
      mockedDispatch
    ]);
    vi.spyOn(SourcesDictionary, 'sources').mockImplementation(
      () =>
        ({
          submitAutoClaim: mockedFn
        }) as unknown as Sources
    );
    createRequestBodySpy = vi
      .spyOn(RequestMapper, 'createRequestBody')
      .mockImplementation(() => submitAutoClaimCarParked);
  });

  afterEach(() => {
    cleanup();
    vi.resetAllMocks();
  });

  it('test custom hook lifecycle', async () => {
    mockedFn.mockImplementation(() => submitAutoClaimFrontendResponseFixture);
    const { result } = renderHook(() => useSubmitClaim());
    expect(result.current).toEqual({
      error: null,
      loading: true
    });
    expect(mockedFn).toHaveBeenCalledWith(submitAutoClaimCarParked);
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    expect(mockedDispatch).toHaveBeenCalledWith({
      type: 'SET_SUBMIT_CLAIM_INFORMATION',
      payload: {
        ...submitAutoClaimFrontendResponseFixture.adjuster
      }
    });
    expect(Actions.setClaimSubmittedForClaimNumber).toHaveBeenCalledWith(
      mockStateCarParked.claimNumber
    );
    expect(createRequestBodySpy).toHaveBeenCalledWith(mockStateCarParked);
    expect(result.current).toEqual({
      loading: false,
      error: null
    });
  });

  it('Should populate error state if something happens fetching submit-claim', async () => {
    mockedFn.mockImplementation(() => {
      return Promise.reject({
        ErrorMessage: {
          error: {
            message: 'system error'
          }
        }
      });
    });
    const { result } = renderHook(() => useSubmitClaim());
    expect(result.current).toEqual({
      error: null,
      loading: true
    });
    expect(mockedFn).toHaveBeenCalledWith(submitAutoClaimCarParked);
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    expect(result.current).toEqual({
      error: {
        errorType: 'api',
        errorLabel: 'APIError',
        errorMessage: 'system error',
        errorCode: undefined,
        errorLocation: 'useSubmitClaim'
      },
      loading: false
    });
    expect(mockedDispatch).toHaveBeenCalledWith({
      type: 'SET_SERIALIZED_ERROR',
      payload: {
        errorType: 'api',
        errorLabel: 'APIError',
        errorMessage: 'system error',
        errorCode: undefined,
        errorLocation: 'useSubmitClaim'
      }
    });
    expect(mockedDispatch).toHaveBeenCalledWith({
      type: 'SET_ERROR_REASON',
      payload: 'system error'
    });
  });

  it('Should populate Knockout state if something happens fetching submit-claim', async () => {
    mockedFn.mockImplementation(() => {
      return Promise.reject({
        ErrorMessage: {
          error: {
            message: 'system error'
          }
        }
      });
    });
    const { result } = renderHook(() => useSubmitClaim());
    expect(result.current).toEqual({
      error: null,
      loading: true
    });
    expect(mockedFn).toHaveBeenCalledWith(submitAutoClaimCarParked);
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    expect(result.current).toEqual({
      error: {
        errorType: 'api',
        errorLabel: 'APIError',
        errorMessage: 'system error',
        errorCode: undefined,
        errorLocation: 'useSubmitClaim'
      },
      loading: false
    });
  });

  it('should not call submitAutoClaim when claim was already submitted for same claimNumber in session', async () => {
    const claimNumber = 'CLM-12345';
    const stateWithAlreadySubmitted = {
      ...mockStateCarParked,
      claimNumber,
      claimSubmittedForClaimNumber: claimNumber
    };

    vi.spyOn(router, 'useOutletContext').mockReturnValue([
      stateWithAlreadySubmitted,
      mockedDispatch
    ]);

    const submitAutoClaimMock = vi.fn();
    vi.spyOn(SourcesDictionary, 'sources').mockReturnValue({
      submitAutoClaim: submitAutoClaimMock
    } as any);

    const createRequestSpy = vi.spyOn(RequestMapper, 'createRequestBody');

    const { result } = renderHook(() => useSubmitClaim());
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(createRequestSpy).not.toHaveBeenCalled();
    expect(submitAutoClaimMock).not.toHaveBeenCalled();
    expect(mockedDispatch).not.toHaveBeenCalledWith(
      expect.objectContaining({ type: 'SET_SUBMIT_CLAIM_INFORMATION' })
    );
    expect(Actions.setClaimSubmittedForClaimNumber).not.toHaveBeenCalled();
    expect(result.current).toMatchObject({
      loading: false,
      error: null
    });
  });
});
