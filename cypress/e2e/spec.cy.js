describe('Home page smoke', () => {
  it('renders the application check landing UI', () => {
    cy.visit('/');

    cy.contains('College of Education Study Centre').should('be.visible');
    cy.get('#applicationNumber').should('be.visible');
    cy.contains('button', 'Continue').should('exist');
  });
});
