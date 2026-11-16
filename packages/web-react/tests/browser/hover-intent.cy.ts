import { hoverIntentTests } from '../../../web-core/tests/browser/hover-intent';

hoverIntentTests((mode) => {
  cy.visit(`/hover-intent.html?mode=${mode}`);
});
