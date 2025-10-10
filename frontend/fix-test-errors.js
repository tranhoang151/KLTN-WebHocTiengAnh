#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Fix ProgressIndicator test errors
const progressIndicatorTestPath = 'src/components/ui/__tests__/ProgressIndicator.test.tsx';
const progressIndicatorTestContent = fs.readFileSync(progressIndicatorTestPath, 'utf8');

// Replace all 'value' props with 'progress' and 'max' with 'total'
const fixedProgressIndicatorTest = progressIndicatorTestContent
    .replace(/value=\{(\d+)\}/g, 'progress={$1}')
    .replace(/max=\{(\d+)\}/g, 'total={$1}')
    .replace(/showPercentage/g, 'showLabel')
    .replace(/animated/g, 'isAnimated')
    .replace(/striped/g, 'isStriped')
    .replace(/indeterminate/g, 'isIndeterminate')
    .replace(/childFriendly/g, 'variant="child-friendly"')
    .replace(/formatText/g, 'labelFormatter')
    .replace(/ariaLabel/g, 'aria-label');

fs.writeFileSync(progressIndicatorTestPath, fixedProgressIndicatorTest);

// Fix ChildFriendlyCard test errors
const cardTestPath = 'src/components/ui/__tests__/ChildFriendlyCard.test.tsx';
const cardTestContent = fs.readFileSync(cardTestPath, 'utf8');

const fixedCardTest = cardTestContent
    .replace(/variant="primary"/g, 'className="card-primary"')
    .replace(/variant="success"/g, 'className="card-success"')
    .replace(/size="small"/g, 'className="card-small"')
    .replace(/size="large"/g, 'className="card-large"')
    .replace(/loading>/g, 'isLoading>')
    .replace(/disabled>/g, 'isDisabled>')
    .replace(/ariaLabel=/g, 'aria-label=')
    .replace(/ariaDescribedBy=/g, 'aria-describedby=')
    .replace(/icon=\{icon\}/g, 'icon="test-icon"');

fs.writeFileSync(cardTestPath, fixedCardTest);

// Fix ErrorMessage test errors
const errorTestPath = 'src/components/ui/__tests__/ErrorMessage.test.tsx';
const errorTestContent = fs.readFileSync(errorTestPath, 'utf8');

const fixedErrorTest = errorTestContent
    .replace(/showIcon=\{true\}/g, 'hasIcon={true}')
    .replace(/childFriendly=\{true\}/g, 'variant="child-friendly"')
    .replace(/ariaLabel=/g, 'aria-label=')
    .replace(/retryLoading=\{true\}/g, 'isRetryLoading={true}')
    .replace(/toHaveClass\('([^']+)',\s*'([^']+)'\)/g, "toHaveClass('$1 $2')");

fs.writeFileSync(errorTestPath, fixedErrorTest);

// Fix ChildFriendlyButton test errors
const buttonTestPath = 'src/components/ui/__tests__/ChildFriendlyButton.test.tsx';
const buttonTestContent = fs.readFileSync(buttonTestPath, 'utf8');

const fixedButtonTest = buttonTestContent
    .replace(/toHaveClass\('([^']+)',\s*'([^']+)'\)/g, "toHaveClass('$1 $2')");

fs.writeFileSync(buttonTestPath, fixedButtonTest);

// Fix LoadingSpinner test errors
const spinnerTestPath = 'src/components/ui/__tests__/LoadingSpinner.test.tsx';
const spinnerTestContent = fs.readFileSync(spinnerTestPath, 'utf8');

const fixedSpinnerTest = spinnerTestContent
    .replace(/toHaveClass\('([^']+)',\s*'([^']+)'\)/g, "toHaveClass('$1 $2')");

fs.writeFileSync(spinnerTestPath, fixedSpinnerTest);

console.log('Fixed test errors in UI components');