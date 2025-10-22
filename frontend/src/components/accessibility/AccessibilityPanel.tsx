import React, { useState } from 'react';
import { useAccessibility } from '../../contexts/AccessibilityContext';
import { ChildFriendlyButton, ChildFriendlyCard } from '../ui';
import './AccessibilityPanel.css';

interface AccessibilityPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const AccessibilityPanel: React.FC<AccessibilityPanelProps> = ({
  isOpen,
  onClose,
}) => {
  const { settings, updateSetting, resetSettings, announceToScreenReader } =
    useAccessibility();
  const [activeTab, setActiveTab] = useState<'visual' | 'motor' | 'cognitive'>(
    'visual'
  );

  if (!isOpen) return null;

  const handleTabChange = (tab: 'visual' | 'motor' | 'cognitive') => {
    setActiveTab(tab);
    announceToScreenReader(
      `Switched to ${tab} accessibility settings`,
      'polite'
    );
  };

  const handleToggleSetting = (
    setting: keyof typeof settings,
    value: boolean,
    description: string
  ) => {
    updateSetting(setting, value);
    announceToScreenReader(
      `${description} ${value ? 'enabled' : 'disabled'}`,
      'polite'
    );
  };

  const handleTextSizeChange = (
    size: 'small' | 'normal' | 'large' | 'extra-large'
  ) => {
    updateSetting('textSize', size);
    announceToScreenReader(`Text size changed to ${size}`, 'polite');
  };

  return (
    <div
      className="accessibility-panel-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="accessibility-panel-title"
    >
      <div className="accessibility-panel">
        {/* Header */}
        <div className="panel-header">
          <h2 id="accessibility-panel-title" className="panel-title">
            <span role="img" aria-hidden="true">
              ♿
            </span>
            Accessibility Settings
          </h2>
          <ChildFriendlyButton
            variant="secondary"
            icon="✕"
            onClick={onClose}
            ariaLabel="Close accessibility panel"
            className="close-button"
          />
        </div>

        {/* Tab Navigation */}
        <div className="panel-tabs" role="tablist">
          <button
            role="tab"
            aria-selected={activeTab === 'visual'}
            aria-controls="visual-panel"
            className={`tab-button ${activeTab === 'visual' ? 'active' : ''}`}
            onClick={() => handleTabChange('visual')}
          >
            <span role="img" aria-hidden="true">
              👁️
            </span>
            Visual
          </button>
          <button
            role="tab"
            aria-selected={activeTab === 'motor'}
            aria-controls="motor-panel"
            className={`tab-button ${activeTab === 'motor' ? 'active' : ''}`}
            onClick={() => handleTabChange('motor')}
          >
            <span role="img" aria-hidden="true">
              ✋
            </span>
            Motor
          </button>
          <button
            role="tab"
            aria-selected={activeTab === 'cognitive'}
            aria-controls="cognitive-panel"
            className={`tab-button ${activeTab === 'cognitive' ? 'active' : ''}`}
            onClick={() => handleTabChange('cognitive')}
          >
            <span role="img" aria-hidden="true">
              🧠
            </span>
            Cognitive
          </button>
        </div>

        {/* Panel Content */}
        <div className="panel-content">
          {/* Visual Accessibility */}
          {activeTab === 'visual' && (
            <div
              id="visual-panel"
              role="tabpanel"
              aria-labelledby="visual-tab"
              className="tab-panel"
            >
              <ChildFriendlyCard title="Visual Settings" icon="👁️" color="blue">
                <div className="settings-group">
                  {/* High Contrast */}
                  <div className="setting-item">
                    <div className="setting-info">
                      <h3>High Contrast Mode</h3>
                      <p>Increases contrast for better visibility</p>
                    </div>
                    <label className="toggle-switch">
                      <input
                        type="checkbox"
                        checked={settings.highContrast}
                        onChange={(e) =>
                          handleToggleSetting(
                            'highContrast',
                            e.target.checked,
                            'High contrast mode'
                          )
                        }
                        aria-describedby="high-contrast-desc"
                      />
                      <span className="toggle-slider" aria-hidden="true"></span>
                      <span className="sr-only">
                        {settings.highContrast ? 'Disable' : 'Enable'} high
                        contrast mode
                      </span>
                    </label>
                  </div>

                  {/* Text Size */}
                  <div className="setting-item">
                    <div className="setting-info">
                      <h3>Text Size</h3>
                      <p>Adjust text size for better readability</p>
                    </div>
                    <div className="text-size-controls">
                      {(
                        ['small', 'normal', 'large', 'extra-large'] as const
                      ).map((size) => (
                        <button
                          key={size}
                          className={`text-size-button ${settings.textSize === size ? 'active' : ''}`}
                          onClick={() => handleTextSizeChange(size)}
                          aria-pressed={settings.textSize === size}
                        >
                          <span className={`text-size-${size}`}>Aa</span>
                          <span className="sr-only">{size} text size</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Reduced Motion */}
                  <div className="setting-item">
                    <div className="setting-info">
                      <h3>Reduce Motion</h3>
                      <p>Minimizes animations and transitions</p>
                    </div>
                    <label className="toggle-switch">
                      <input
                        type="checkbox"
                        checked={settings.reducedMotion}
                        onChange={(e) =>
                          handleToggleSetting(
                            'reducedMotion',
                            e.target.checked,
                            'Reduced motion'
                          )
                        }
                      />
                      <span className="toggle-slider" aria-hidden="true"></span>
                      <span className="sr-only">
                        {settings.reducedMotion ? 'Disable' : 'Enable'} reduced
                        motion
                      </span>
                    </label>
                  </div>
                </div>
              </ChildFriendlyCard>
            </div>
          )}

          {/* Motor Accessibility */}
          {activeTab === 'motor' && (
            <div
              id="motor-panel"
              role="tabpanel"
              aria-labelledby="motor-tab"
              className="tab-panel"
            >
              <ChildFriendlyCard title="Motor Settings" icon="✋" color="green">
                <div className="settings-group">
                  {/* Large Touch Targets */}
                  <div className="setting-item">
                    <div className="setting-info">
                      <h3>Large Touch Targets</h3>
                      <p>Makes buttons and links easier to tap</p>
                    </div>
                    <label className="toggle-switch">
                      <input
                        type="checkbox"
                        checked={settings.largeTouchTargets}
                        onChange={(e) =>
                          handleToggleSetting(
                            'largeTouchTargets',
                            e.target.checked,
                            'Large touch targets'
                          )
                        }
                      />
                      <span className="toggle-slider" aria-hidden="true"></span>
                      <span className="sr-only">
                        {settings.largeTouchTargets ? 'Disable' : 'Enable'}{' '}
                        large touch targets
                      </span>
                    </label>
                  </div>

                  {/* Keyboard Navigation */}
                  <div className="setting-item">
                    <div className="setting-info">
                      <h3>Enhanced Keyboard Navigation</h3>
                      <p>
                        Improves keyboard navigation with better focus
                        indicators
                      </p>
                    </div>
                    <label className="toggle-switch">
                      <input
                        type="checkbox"
                        checked={settings.keyboardNavigation}
                        onChange={(e) =>
                          handleToggleSetting(
                            'keyboardNavigation',
                            e.target.checked,
                            'Enhanced keyboard navigation'
                          )
                        }
                      />
                      <span className="toggle-slider" aria-hidden="true"></span>
                      <span className="sr-only">
                        {settings.keyboardNavigation ? 'Disable' : 'Enable'}{' '}
                        enhanced keyboard navigation
                      </span>
                    </label>
                  </div>
                </div>
              </ChildFriendlyCard>
            </div>
          )}

          {/* Cognitive Accessibility */}
          {activeTab === 'cognitive' && (
            <div
              id="cognitive-panel"
              role="tabpanel"
              aria-labelledby="cognitive-tab"
              className="tab-panel"
            >
              <ChildFriendlyCard
                title="Cognitive Settings"
                icon="🧠"
                color="purple"
              >
                <div className="settings-group">
                  {/* Simplified Interface */}
                  <div className="setting-item">
                    <div className="setting-info">
                      <h3>Simplified Interface</h3>
                      <p>Reduces visual complexity and distractions</p>
                    </div>
                    <label className="toggle-switch">
                      <input
                        type="checkbox"
                        checked={settings.simplifiedInterface}
                        onChange={(e) =>
                          handleToggleSetting(
                            'simplifiedInterface',
                            e.target.checked,
                            'Simplified interface'
                          )
                        }
                      />
                      <span className="toggle-slider" aria-hidden="true"></span>
                      <span className="sr-only">
                        {settings.simplifiedInterface ? 'Disable' : 'Enable'}{' '}
                        simplified interface
                      </span>
                    </label>
                  </div>

                  {/* Screen Reader Mode */}
                  <div className="setting-item">
                    <div className="setting-info">
                      <h3>Screen Reader Mode</h3>
                      <p>Optimizes interface for screen reader users</p>
                    </div>
                    <label className="toggle-switch">
                      <input
                        type="checkbox"
                        checked={settings.screenReaderMode}
                        onChange={(e) =>
                          handleToggleSetting(
                            'screenReaderMode',
                            e.target.checked,
                            'Screen reader mode'
                          )
                        }
                      />
                      <span className="toggle-slider" aria-hidden="true"></span>
                      <span className="sr-only">
                        {settings.screenReaderMode ? 'Disable' : 'Enable'}{' '}
                        screen reader mode
                      </span>
                    </label>
                  </div>
                </div>
              </ChildFriendlyCard>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="panel-footer">
          <ChildFriendlyButton
            variant="secondary"
            icon="🔄"
            onClick={() => {
              resetSettings();
              announceToScreenReader(
                'All accessibility settings have been reset to default',
                'polite'
              );
            }}
          >
            Reset to Default
          </ChildFriendlyButton>

          <ChildFriendlyButton variant="primary" icon="✅" onClick={onClose}>
            Done
          </ChildFriendlyButton>
        </div>

        {/* Keyboard Instructions */}
        <div
          className="keyboard-instructions"
          aria-label="Keyboard navigation instructions"
        >
          <p className="sr-only">
            Use Tab to navigate between settings. Use Space or Enter to toggle
            switches. Use Escape to close this panel.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AccessibilityPanel;


