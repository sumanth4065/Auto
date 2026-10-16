import React, { useEffect, useRef, useState } from 'react';
import config from '../../config/config';
import { useOutletContext } from 'react-router';
import { State } from '../../store/reducer';
import { setErrorReason } from '../../store/actions';

/**
 *
 * @param timeout time in seconds
 * @returns
 */

export const useTimeout = (dispatch: Function) => {
  const timeout = config.pageTimeoutInMinutes;
  const [isIDLE, setIsIDLE] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const [remainingTime, setRemainingTime] = useState(timeout);

  useEffect(() => {
    // component mounts
    handleStart();

    return () => {
      // cleanup: component will unmount
      handleStop();
    };
  }, []);

  useEffect(() => {
    if (remainingTime === 0) {
      setIsIDLE(true);
      dispatch(setErrorReason('session timeout'));
      handleStop();
    }
  }, [remainingTime]);

  const handleInteraction = React.useCallback(() => {
    setRemainingTime(timeout);
  }, [timeout]);

  return { isIDLE };

  function handleStart() {
    clearInterval(timerRef.current);
    document.addEventListener('mousemove', handleInteraction);
    document.addEventListener('click', handleInteraction);
    document.addEventListener('keypress', handleInteraction);
    document.addEventListener('touchstart', handleInteraction);

    timerRef.current = setInterval(() => {
      setRemainingTime(prevTime => prevTime - 1);
    }, 1000 * 60);
  }

  function handleStop() {
    document.removeEventListener('mousemove', handleInteraction);
    document.removeEventListener('click', handleInteraction);
    document.removeEventListener('keypress', handleInteraction);
    document.removeEventListener('touchstart', handleInteraction);
    clearInterval(timerRef.current);
  }
};
