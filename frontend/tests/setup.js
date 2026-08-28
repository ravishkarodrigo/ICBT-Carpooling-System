import '@testing-library/jest-dom';

// jsdom doesn't implement scrollTo; stub it so chat log effects don't throw.
window.HTMLElement.prototype.scrollTo = () => {};
