import React, { useState, useCallback } from 'react';

interface AsyncOperationState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  success: boolean;
}

interface UseAsyncOperationOptions {
  onSuccess?: (data: any) => void;
  onError?: (error: string) => void;
  retryAttempts?: number;
  retryDelay?: number;
}

interface UseAsyncOperationReturn<T> {
  state: AsyncOperationState<T>;
  execute: (operation: () => Promise<T>) => Promise<void>;
  retry: () => Promise<void>;
  reset: () => void;
  setError: (error: string) => void;
  setSuccess: (data: T) => void;
}

export const useAsyncOperation = <T = any>(
  options: UseAsyncOperationOptions = {}
): UseAsyncOperationReturn<T> => {
  const { onSuccess, onError, retryAttempts = 3, retryDelay = 1000 } = options;

  const [state, setState] = useState<AsyncOperationState<T>>({
    data: null,
    loading: false,
    error: null,
    success: false,
  });

  const [lastOperation, setLastOperation] = useState<(() => Promise<T>) | null>(
    null
  );
  const [currentRetryCount, setCurrentRetryCount] = useState(0);

  const execute = useCallback(
    async (operation: () => Promise<T>) => {
      setState((prev) => ({
        ...prev,
        loading: true,
        error: null,
        success: false,
      }));

      setLastOperation(() => operation);
      setCurrentRetryCount(0);

      try {
        const result = await operation();

        setState({
          data: result,
          loading: false,
          error: null,
          success: true,
        });

        if (onSuccess) {
          onSuccess(result);
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : 'An unexpected error occurred';

        setState({
          data: null,
          loading: false,
          error: errorMessage,
          success: false,
        });

        if (onError) {
          onError(errorMessage);
        }
      }
    },
    [onSuccess, onError]
  );

  const retry = useCallback(async () => {
    if (!lastOperation) {
      console.warn('No operation to retry');
      return;
    }

    if (currentRetryCount >= retryAttempts) {
      console.warn('Maximum retry attempts reached');
      return;
    }

    setCurrentRetryCount((prev) => prev + 1);

    // Add delay before retry
    if (retryDelay > 0) {
      await new Promise((resolve) =>
        setTimeout(resolve, retryDelay * currentRetryCount)
      );
    }

    await execute(lastOperation);
  }, [lastOperation, currentRetryCount, retryAttempts, retryDelay, execute]);

  const reset = useCallback(() => {
    setState({
      data: null,
      loading: false,
      error: null,
      success: false,
    });
    setLastOperation(null);
    setCurrentRetryCount(0);
  }, []);

  const setError = useCallback((error: string) => {
    setState((prev) => ({
      ...prev,
      loading: false,
      error,
      success: false,
    }));
  }, []);

  const setSuccess = useCallback((data: T) => {
    setState({
      data,
      loading: false,
      error: null,
      success: true,
    });
  }, []);

  return {
    state,
    execute,
    retry,
    reset,
    setError,
    setSuccess,
  };
};

// Hook for handling multiple async operations
export const useMultipleAsyncOperations = () => {
  const [operations, setOperations] = useState<
    Record<string, AsyncOperationState<any>>
  >({});

  const getOperation = useCallback(
    (key: string) => {
      return (
        operations[key] || {
          data: null,
          loading: false,
          error: null,
          success: false,
        }
      );
    },
    [operations]
  );

  const setOperationState = useCallback(
    (key: string, state: Partial<AsyncOperationState<any>>) => {
      setOperations((prev) => ({
        ...prev,
        [key]: {
          ...prev[key],
          ...state,
        },
      }));
    },
    []
  );

  const executeOperation = useCallback(
    async <T>(key: string, operation: () => Promise<T>): Promise<T | null> => {
      setOperationState(key, {
        loading: true,
        error: null,
        success: false,
      });

      try {
        const result = await operation();

        setOperationState(key, {
          data: result,
          loading: false,
          error: null,
          success: true,
        });

        return result;
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : 'An unexpected error occurred';

        setOperationState(key, {
          data: null,
          loading: false,
          error: errorMessage,
          success: false,
        });

        return null;
      }
    },
    [setOperationState]
  );

  const resetOperation = useCallback((key: string) => {
    setOperations((prev) => {
      const newOperations = { ...prev };
      delete newOperations[key];
      return newOperations;
    });
  }, []);

  const resetAllOperations = useCallback(() => {
    setOperations({});
  }, []);

  return {
    operations,
    getOperation,
    executeOperation,
    resetOperation,
    resetAllOperations,
  };
};

// Hook for handling form submissions with loading states
export const useFormSubmission = <T = any>(
  submitFunction: (data: any) => Promise<T>,
  options: UseAsyncOperationOptions = {}
) => {
  const asyncOperation = useAsyncOperation<T>(options);

  const handleSubmit = useCallback(
    async (formData: any) => {
      await asyncOperation.execute(() => submitFunction(formData));
    },
    [asyncOperation, submitFunction]
  );

  return {
    ...asyncOperation,
    handleSubmit,
  };
};

// Hook for handling data fetching with loading states
export const useDataFetching = <T = any>(
  fetchFunction: () => Promise<T>,
  options: UseAsyncOperationOptions & {
    fetchOnMount?: boolean;
    dependencies?: any[];
  } = {}
) => {
  const { fetchOnMount = false, dependencies = [], ...asyncOptions } = options;
  const asyncOperation = useAsyncOperation<T>(asyncOptions);

  const fetch = useCallback(async () => {
    await asyncOperation.execute(fetchFunction);
  }, [asyncOperation, fetchFunction]);

  // Auto-fetch on mount if requested
  React.useEffect(() => {
    if (fetchOnMount) {
      fetch();
    }
  }, [fetchOnMount, fetch, ...dependencies]);

  return {
    ...asyncOperation,
    fetch,
    refetch: fetch,
  };
};
