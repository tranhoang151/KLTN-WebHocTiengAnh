import React, { useState } from 'react';
import {
  LoadingSpinner,
  ErrorMessage,
  OfflineIndicator,
  ProgressIndicator,
  ChildFriendlyButton,
  ChildFriendlyCard,
} from '../ui';
import { useAsyncOperation } from '../../hooks/useAsyncOperation';

const LoadingErrorDemo: React.FC = () => {
  const [showOfflineIndicator, setShowOfflineIndicator] = useState(false);
  const [progressSteps, setProgressSteps] = useState([
    {
      id: 'step1',
      label: 'Preparing',
      status: 'completed' as const,
      description: 'Getting ready...',
    },
    {
      id: 'step2',
      label: 'Loading Data',
      status: 'active' as const,
      description: 'Fetching information...',
    },
    {
      id: 'step3',
      label: 'Processing',
      status: 'pending' as const,
      description: 'Analyzing data...',
    },
    {
      id: 'step4',
      label: 'Finishing',
      status: 'pending' as const,
      description: 'Almost done...',
    },
  ]);

  const asyncOperation = useAsyncOperation({
    onSuccess: (data) => console.log('Success:', data),
    onError: (error) => console.log('Error:', error),
  });

  // Simulate different async operations
  const simulateSuccess = async () => {
    await asyncOperation.execute(async () => {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      return { message: 'Operation completed successfully!' };
    });
  };

  const simulateError = async () => {
    await asyncOperation.execute(async () => {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      throw new Error(
        'Something went wrong! This is a simulated error for demonstration.'
      );
    });
  };

  const simulateNetworkError = async () => {
    await asyncOperation.execute(async () => {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      throw new Error(
        'Network connection failed. Please check your internet connection.'
      );
    });
  };

  const advanceProgress = () => {
    setProgressSteps((prev) => {
      const newSteps = [...prev];
      const activeIndex = newSteps.findIndex(
        (step) => step.status === 'active'
      );

      if (activeIndex !== -1) {
        newSteps[activeIndex].status = 'completed';
        if (activeIndex + 1 < newSteps.length) {
          newSteps[activeIndex + 1].status = 'active';
        }
      }

      return newSteps;
    });
  };

  const resetProgress = () => {
    setProgressSteps([
      {
        id: 'step1',
        label: 'Preparing',
        status: 'completed',
        description: 'Getting ready...',
      },
      {
        id: 'step2',
        label: 'Loading Data',
        status: 'active',
        description: 'Fetching information...',
      },
      {
        id: 'step3',
        label: 'Processing',
        status: 'pending',
        description: 'Analyzing data...',
      },
      {
        id: 'step4',
        label: 'Finishing',
        status: 'pending',
        description: 'Almost done...',
      },
    ]);
  };

  return (
    <div
      style={{
        padding: 'var(--spacing-xl)',
        background: 'linear-gradient(135deg, #f0f8ff 0%, #e6f3ff 100%)',
        minHeight: '100vh',
      }}
    >
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <h1
          className="heading-child heading-xl text-rainbow"
          style={{ textAlign: 'center' }}
        >
          Loading & Error Handling Demo! 🔄
        </h1>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
            gap: 'var(--spacing-lg)',
            marginTop: 'var(--spacing-xl)',
          }}
        >
          {/* Loading Spinners Demo */}
          <ChildFriendlyCard title="Loading Spinners" icon="🔄" color="blue">
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--spacing-md)',
              }}
            >
              <div>
                <h4>Small Spinner</h4>
                <LoadingSpinner size="small" message="Loading..." />
              </div>

              <div>
                <h4>Medium Spinner</h4>
                <LoadingSpinner size="medium" message="Please wait..." />
              </div>

              <div>
                <h4>Large Spinner</h4>
                <LoadingSpinner
                  size="large"
                  message="Processing your request..."
                />
              </div>

              <div>
                <h4>Different Colors</h4>
                <div
                  style={{
                    display: 'flex',
                    gap: 'var(--spacing-md)',
                    alignItems: 'center',
                  }}
                >
                  <LoadingSpinner size="medium" color="primary" />
                  <LoadingSpinner size="medium" color="secondary" />
                  <LoadingSpinner size="medium" color="white" />
                </div>
              </div>
            </div>
          </ChildFriendlyCard>

          {/* Async Operations Demo */}
          <ChildFriendlyCard title="Async Operations" icon="⚡" color="green">
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--spacing-md)',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 'var(--spacing-sm)',
                }}
              >
                <ChildFriendlyButton
                  variant="success"
                  icon="✅"
                  onClick={simulateSuccess}
                  disabled={asyncOperation.state.loading}
                >
                  Simulate Success
                </ChildFriendlyButton>

                <ChildFriendlyButton
                  variant="danger"
                  icon="❌"
                  onClick={simulateError}
                  disabled={asyncOperation.state.loading}
                >
                  Simulate Error
                </ChildFriendlyButton>

                <ChildFriendlyButton
                  variant="warning"
                  icon="📡"
                  onClick={simulateNetworkError}
                  disabled={asyncOperation.state.loading}
                >
                  Simulate Network Error
                </ChildFriendlyButton>

                <ChildFriendlyButton
                  variant="secondary"
                  icon="🔄"
                  onClick={asyncOperation.reset}
                  disabled={asyncOperation.state.loading}
                >
                  Reset
                </ChildFriendlyButton>
              </div>

              {/* Operation Status */}
              <div
                style={{
                  padding: 'var(--spacing-md)',
                  background: '#f8f9fa',
                  borderRadius: 'var(--border-radius-md)',
                  minHeight: '100px',
                }}
              >
                {asyncOperation.state.loading && (
                  <LoadingSpinner
                    size="medium"
                    message="Operation in progress..."
                  />
                )}

                {asyncOperation.state.success && (
                  <div
                    style={{
                      textAlign: 'center',
                      color: 'var(--primary-green)',
                    }}
                  >
                    <div
                      style={{
                        fontSize: '2em',
                        marginBottom: 'var(--spacing-sm)',
                      }}
                    >
                      🎉
                    </div>
                    <div>Operation completed successfully!</div>
                  </div>
                )}

                {asyncOperation.state.error && (
                  <ErrorMessage
                    message={asyncOperation.state.error}
                    type="error"
                    onRetry={asyncOperation.retry}
                    onDismiss={asyncOperation.reset}
                    showDetails={true}
                    details={`Error occurred at: ${new Date().toLocaleTimeString()}\nOperation: Async Demo\nRetry attempts available: Yes`}
                  />
                )}

                {!asyncOperation.state.loading &&
                  !asyncOperation.state.success &&
                  !asyncOperation.state.error && (
                    <div style={{ textAlign: 'center', color: '#6b7280' }}>
                      Click a button above to test async operations!
                    </div>
                  )}
              </div>
            </div>
          </ChildFriendlyCard>

          {/* Error Messages Demo */}
          <ChildFriendlyCard title="Error Messages" icon="⚠️" color="orange">
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--spacing-md)',
              }}
            >
              <ErrorMessage
                title="Oops! Something went wrong"
                message="This is an example error message. Don't worry, it's just for demonstration!"
                type="error"
                onRetry={() => alert('Retry clicked!')}
                onDismiss={() => alert('Dismiss clicked!')}
              />

              <ErrorMessage
                title="Warning"
                message="This is a warning message. Please pay attention!"
                type="warning"
                onDismiss={() => alert('Warning dismissed!')}
              />

              <ErrorMessage
                title="Information"
                message="This is an informational message with helpful details."
                type="info"
                onDismiss={() => alert('Info dismissed!')}
              />
            </div>
          </ChildFriendlyCard>

          {/* Progress Indicator Demo */}
          <ChildFriendlyCard
            title="Progress Indicator"
            icon="📊"
            color="purple"
          >
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--spacing-md)',
              }}
            >
              <ProgressIndicator
                title="Learning Progress"
                steps={progressSteps}
                currentStep={
                  progressSteps.find((s) => s.status === 'active')?.id
                }
                showStepNumbers={true}
                orientation="horizontal"
              />

              <div style={{ display: 'flex', gap: 'var(--spacing-sm)' }}>
                <ChildFriendlyButton
                  variant="primary"
                  icon="▶️"
                  onClick={advanceProgress}
                >
                  Next Step
                </ChildFriendlyButton>

                <ChildFriendlyButton
                  variant="secondary"
                  icon="🔄"
                  onClick={resetProgress}
                >
                  Reset
                </ChildFriendlyButton>
              </div>
            </div>
          </ChildFriendlyCard>

          {/* Offline Indicator Demo */}
          <ChildFriendlyCard title="Offline Indicator" icon="📡" color="pink">
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--spacing-md)',
              }}
            >
              <p>
                The offline indicator automatically detects your internet
                connection status. You can also simulate it manually:
              </p>

              <ChildFriendlyButton
                variant="warning"
                icon="📡"
                onClick={() => setShowOfflineIndicator(!showOfflineIndicator)}
              >
                {showOfflineIndicator ? 'Hide' : 'Show'} Offline Indicator
              </ChildFriendlyButton>

              <div
                style={{
                  padding: 'var(--spacing-md)',
                  background: '#f8f9fa',
                  borderRadius: 'var(--border-radius-md)',
                  textAlign: 'center',
                }}
              >
                <div>
                  Current Status:{' '}
                  <strong>
                    {navigator.onLine ? '🟢 Online' : '🔴 Offline'}
                  </strong>
                </div>
                <div
                  style={{
                    fontSize: 'var(--font-size-sm)',
                    color: '#6b7280',
                    marginTop: 'var(--spacing-xs)',
                  }}
                >
                  Try disconnecting your internet to see the real offline
                  indicator!
                </div>
              </div>
            </div>
          </ChildFriendlyCard>

          {/* Full Screen Loading Demo */}
          <ChildFriendlyCard title="Full Screen Loading" icon="🖥️" color="blue">
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--spacing-md)',
              }}
            >
              <p>Full screen loading spinners for major operations:</p>

              <ChildFriendlyButton
                variant="primary"
                icon="🔄"
                onClick={() => {
                  const overlay = document.createElement('div');
                  overlay.innerHTML = `
                    <div style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(255, 255, 255, 0.9); z-index: 9999; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(2px);">
                      <div style="text-align: center;">
                        <div style="width: 60px; height: 60px; margin: 0 auto 20px;">
                          <div style="position: relative; width: 100%; height: 100%;">
                            <div style="position: absolute; width: 8px; height: 8px; border-radius: 50%; background: #4A90E2; top: 0; left: 50%; transform: translateX(-50%); animation: spinner-pulse 1.2s linear infinite; animation-delay: -1.1s;"></div>
                            <div style="position: absolute; width: 8px; height: 8px; border-radius: 50%; background: #4A90E2; top: 15%; right: 15%; animation: spinner-pulse 1.2s linear infinite; animation-delay: -1.0s;"></div>
                            <div style="position: absolute; width: 8px; height: 8px; border-radius: 50%; background: #4A90E2; top: 50%; right: 0; transform: translateY(-50%); animation: spinner-pulse 1.2s linear infinite; animation-delay: -0.9s;"></div>
                            <div style="position: absolute; width: 8px; height: 8px; border-radius: 50%; background: #4A90E2; bottom: 15%; right: 15%; animation: spinner-pulse 1.2s linear infinite; animation-delay: -0.8s;"></div>
                            <div style="position: absolute; width: 8px; height: 8px; border-radius: 50%; background: #4A90E2; bottom: 0; left: 50%; transform: translateX(-50%); animation: spinner-pulse 1.2s linear infinite; animation-delay: -0.7s;"></div>
                            <div style="position: absolute; width: 8px; height: 8px; border-radius: 50%; background: #4A90E2; bottom: 15%; left: 15%; animation: spinner-pulse 1.2s linear infinite; animation-delay: -0.6s;"></div>
                            <div style="position: absolute; width: 8px; height: 8px; border-radius: 50%; background: #4A90E2; top: 50%; left: 0; transform: translateY(-50%); animation: spinner-pulse 1.2s linear infinite; animation-delay: -0.5s;"></div>
                            <div style="position: absolute; width: 8px; height: 8px; border-radius: 50%; background: #4A90E2; top: 15%; left: 15%; animation: spinner-pulse 1.2s linear infinite; animation-delay: -0.4s;"></div>
                          </div>
                        </div>
                        <div style="font-family: 'Comic Sans MS', cursive; font-size: 18px; font-weight: 600; color: #2c3e50;">Loading something amazing...</div>
                      </div>
                    </div>
                  `;
                  document.body.appendChild(overlay);

                  setTimeout(() => {
                    document.body.removeChild(overlay);
                  }, 3000);
                }}
              >
                Show Full Screen Loading
              </ChildFriendlyButton>
            </div>
          </ChildFriendlyCard>
        </div>

        {/* Offline Indicator */}
        {showOfflineIndicator && (
          <OfflineIndicator
            position="top"
            onRetry={() => {
              console.log('Retry connection clicked');
              setShowOfflineIndicator(false);
            }}
          />
        )}

        {/* Real Offline Indicator */}
        <OfflineIndicator position="bottom" />

        {/* Summary */}
        <div
          style={{
            textAlign: 'center',
            marginTop: 'var(--spacing-xl)',
            padding: 'var(--spacing-xl)',
            background: 'rgba(255, 255, 255, 0.9)',
            borderRadius: 'var(--border-radius-xl)',
            boxShadow: 'var(--shadow-large)',
          }}
        >
          <h2 className="heading-child heading-lg text-rainbow">
            Amazing Loading & Error Handling! 🎉
          </h2>
          <p
            style={{
              fontSize: 'var(--font-size-md)',
              margin: 'var(--spacing-md) 0',
            }}
          >
            These components provide comprehensive loading states, error
            handling, and user feedback to create a smooth and child-friendly
            learning experience! 🌟
          </p>
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              gap: 'var(--spacing-sm)',
              fontSize: '2em',
              marginTop: 'var(--spacing-lg)',
            }}
          >
            🔄 ⚡ ⚠️ 📊 📡 🎯 ✨ 🚀
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoadingErrorDemo;


