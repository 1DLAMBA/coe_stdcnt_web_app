Cypress.Commands.add('uniqueUser', () => {
  const ts = Date.now();
  const tail = Math.floor(Math.random() * 900 + 100);
  return cy.wrap({
    phone: `080${String(ts).slice(-7)}${tail}`.slice(0, 11),
    email: `qa.cypress+${ts}${tail}@example.com`,
    ts,
  });
});

function activeDropdown($body) {
  return $body
    .find('.ant-select-dropdown:not(.ant-select-dropdown-hidden)')
    .last();
}

function openSelectByName(name) {
  cy.get('body').then(($body) => {
    const $existing = $body.find(
      '.ant-select-dropdown:not(.ant-select-dropdown-hidden)'
    );
    if ($existing.length) {
      cy.get('body').type('{esc}', { force: true });
    }
  });

  cy.get(`#${name}`)
    .closest('.ant-select')
    .find('.ant-select-selector')
    .click({ force: true });

  cy.get('body').then(($body) => {
    const $dropdown = activeDropdown($body);
    if (!$dropdown.length) {
      throw new Error(`Dropdown for "${name}" did not open`);
    }
  });
}

function clickOption($match) {
  cy.wrap($match.first()).click({ force: true });
  cy.wait(180);
}

function findOptionInDropdown(optionText, attempt = 0) {
  cy.get('body').then(($body) => {
    const $dropdown = activeDropdown($body);
    if (!$dropdown.length) {
      throw new Error('AntD select dropdown is not open');
    }
    const $options = $dropdown.find('.ant-select-item-option');
    const $match = $options.filter((i, el) => {
      const title = el.getAttribute('title');
      const text = (el.textContent || '').trim();
      return title === optionText || text === optionText;
    });
    if ($match.length) {
      clickOption($match);
      return;
    }
    if (attempt >= 40) {
      throw new Error(
        `Option "${optionText}" not found in dropdown after ${attempt} scroll attempts`
      );
    }
    const $holder = $dropdown.find('.rc-virtual-list-holder');
    if ($holder.length) {
      $holder[0].scrollTop = (attempt + 1) * 200;
    }
    cy.wait(60).then(() => findOptionInDropdown(optionText, attempt + 1));
  });
}

Cypress.Commands.add('selectByName', (name, optionText) => {
  openSelectByName(name);
  findOptionInDropdown(optionText, 0);
});

Cypress.Commands.add('selectByNameAt', (name, index) => {
  openSelectByName(name);
  cy.get('body').then(($body) => {
    const $dropdown = activeDropdown($body);
    if (!$dropdown.length) throw new Error('Dropdown not open');
    const $options = $dropdown.find('.ant-select-item-option');
    if ($options.length <= index) {
      throw new Error(
        `Index ${index} out of range (only ${$options.length} options rendered for ${name})`
      );
    }
    clickOption($options.eq(index));
  });
});

Cypress.Commands.add('pickDateByName', (name, isoDate) => {
  cy.get(`#${name}`).click({ force: true });
  cy.get(`#${name}`).type(`${isoDate}{enter}`, { force: true });
});

Cypress.Commands.add('proceedTo', (nextHeader) => {
  cy.contains('button', 'Proceed').click({ force: true });
  cy.wait(700);
  cy.get('body').then(($body) => {
    const advanced = $body
      .find('*:visible')
      .filter((i, el) => (el.textContent || '').includes(nextHeader)).length > 0;
    if (!advanced) {
      cy.log(`Proceed did not reveal "${nextHeader}" - retrying once`);
      cy.contains('button', 'Proceed').click({ force: true });
    }
  });
  cy.contains(nextHeader, { timeout: 15000 }).should('be.visible');
});
