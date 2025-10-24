import React, { useState } from 'react';
import {
  ChildFriendlyButton,
  ChildFriendlyCard,
  ChildFriendlyInput,
  ChildFriendlyProgress,
} from '../ui';

const ChildFriendlyDemo: React.FC = () => {
  const [inputValue, setInputValue] = useState('');
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(false);

  const handleProgressIncrease = () => {
    setProgress((prev) => Math.min(prev + 20, 100));
  };

  const handleLoadingTest = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 3000);
  };

  return (
    <div
      style={{
        padding: 'var(--spacing-xl)',
        background: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
        minHeight: '100vh',
      }}
    >
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <h1
          className="heading-child heading-xl text-rainbow"
          style={{ textAlign: 'center' }}
        >
          Child-Friendly UI Demo! 🎨
        </h1>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: 'var(--spacing-lg)',
            marginTop: 'var(--spacing-xl)',
          }}
        >
          {/* Button Demo */}
          <ChildFriendlyCard title="Fun Buttons" icon="🎯" color="blue">
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--spacing-md)',
              }}
            >
              <ChildFriendlyButton variant="primary" icon="🚀">
                Primary Button
              </ChildFriendlyButton>
              <ChildFriendlyButton variant="success" icon="✅">
                Success Button
              </ChildFriendlyButton>
              <ChildFriendlyButton variant="warning" icon="⚠️">
                Warning Button
              </ChildFriendlyButton>
              <ChildFriendlyButton variant="danger" icon="❌">
                Danger Button
              </ChildFriendlyButton>
              <ChildFriendlyButton variant="playful" icon="🎮">
                Playful Button
              </ChildFriendlyButton>
              <ChildFriendlyButton
                variant="primary"
                size="large"
                icon="⭐"
                onClick={handleLoadingTest}
                loading={loading}
              >
                {loading ? 'Loading...' : 'Large Button'}
              </ChildFriendlyButton>
            </div>
          </ChildFriendlyCard>

          {/* Input Demo */}
          <ChildFriendlyCard title="Magic Inputs" icon="✨" color="green">
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--spacing-md)',
              }}
            >
              <ChildFriendlyInput
                label="Your Name"
                icon="👤"
                placeholder="Enter your awesome name!"
                value={inputValue}
                onChange={setInputValue}
                maxLength={20}
              />
              <ChildFriendlyInput
                label="Email Address"
                icon="📧"
                type="email"
                placeholder="your.email@example.com"
                success={inputValue.length > 3 ? 'Great job!' : undefined}
              />
              <ChildFriendlyInput
                label="Password"
                icon="🔒"
                type="password"
                placeholder="Super secret password"
                error={
                  inputValue.length < 3 && inputValue.length > 0
                    ? 'Too short!'
                    : undefined
                }
              />
            </div>
          </ChildFriendlyCard>

          {/* Progress Demo */}
          <ChildFriendlyCard title="Progress Magic" icon="📊" color="purple">
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--spacing-md)',
              }}
            >
              <ChildFriendlyProgress
                value={progress}
                label="Learning Progress"
                icon="🎓"
                color="blue"
                size="large"
                celebrateOnComplete
              />
              <ChildFriendlyProgress
                value={75}
                label="Rainbow Progress"
                icon="🌈"
                color="rainbow"
                size="medium"
              />
              <ChildFriendlyButton
                variant="success"
                icon="⬆️"
                onClick={handleProgressIncrease}
              >
                Increase Progress!
              </ChildFriendlyButton>
            </div>
          </ChildFriendlyCard>

          {/* Interactive Cards Demo */}
          <ChildFriendlyCard title="Interactive Cards" icon="🎮" color="orange">
            <div style={{ display: 'grid', gap: 'var(--spacing-sm)' }}>
              <ChildFriendlyCard
                title="Click Me!"
                icon="👆"
                color="pink"
                interactive
                onClick={() => alert('Hello! 👋')}
              >
                <p>I'm a clickable card!</p>
              </ChildFriendlyCard>
              <ChildFriendlyCard
                title="Badge Card"
                icon="🏆"
                color="blue"
                badge="NEW!"
                interactive
                onClick={() => alert('You found a badge! 🎉')}
              >
                <p>Cards can have badges too!</p>
              </ChildFriendlyCard>
            </div>
          </ChildFriendlyCard>

          {/* Color Showcase */}
          <ChildFriendlyCard title="Color Palette" icon="🎨" color="default">
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: 'var(--spacing-sm)',
              }}
            >
              <div
                style={{
                  background: 'var(--primary-blue)',
                  color: 'white',
                  padding: 'var(--spacing-md)',
                  borderRadius: 'var(--border-radius-md)',
                  textAlign: 'center',
                  fontWeight: '600',
                }}
              >
                Blue 💙
              </div>
              <div
                style={{
                  background: 'var(--primary-green)',
                  color: 'white',
                  padding: 'var(--spacing-md)',
                  borderRadius: 'var(--border-radius-md)',
                  textAlign: 'center',
                  fontWeight: '600',
                }}
              >
                Green 💚
              </div>
              <div
                style={{
                  background: 'var(--primary-orange)',
                  color: 'white',
                  padding: 'var(--spacing-md)',
                  borderRadius: 'var(--border-radius-md)',
                  textAlign: 'center',
                  fontWeight: '600',
                }}
              >
                Orange 🧡
              </div>
              <div
                style={{
                  background: 'var(--primary-purple)',
                  color: 'white',
                  padding: 'var(--spacing-md)',
                  borderRadius: 'var(--border-radius-md)',
                  textAlign: 'center',
                  fontWeight: '600',
                }}
              >
                Purple 💜
              </div>
            </div>
          </ChildFriendlyCard>

          {/* Typography Demo */}
          <ChildFriendlyCard title="Fun Typography" icon="📝" color="pink">
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--spacing-md)',
              }}
            >
              <h1 className="heading-child heading-xl">Extra Large Heading</h1>
              <h2 className="heading-child heading-lg">Large Heading</h2>
              <h3 className="heading-child heading-md">Medium Heading</h3>
              <p className="text-rainbow">Rainbow Text is Magic! ✨</p>
              <div className="badge-child">I'm a Badge! 🏆</div>
            </div>
          </ChildFriendlyCard>
        </div>

        {/* Fun Message */}
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
            Awesome! You've seen all our child-friendly components! 🎉
          </h2>
          <p
            style={{
              fontSize: 'var(--font-size-md)',
              margin: 'var(--spacing-md) 0',
            }}
          >
            These components are designed to make learning fun and engaging for
            children aged 5-12! They feature bright colors, fun animations,
            large touch targets, and playful interactions! 🌟
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
            🎯 📚 🎮 🏆 🌈 ⭐ 🎉 💫
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChildFriendlyDemo;
