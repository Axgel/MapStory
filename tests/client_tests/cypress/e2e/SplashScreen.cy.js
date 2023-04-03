describe('SplashScreen', () => {
  it('navigateRegisterScreen', () => {
    cy.visit('/')
    cy.contains('REGISTER').click()
    cy.url().should('include', '/register')
  });

  it('navigateHomeScreen', () => {
    cy.visit('/')
    cy.contains('HOME').click()
    cy.url().should('include', '/home')
  });

  it('homeScreenFormSubmit', () => {
    cy.visit('/')
    cy.contains('HOME').click()
    cy.get('input[type=text]').type("angel")
    cy.contains('Add Name!').click()
    cy.contains('angel')
  });

  it('homeScreenForm', () => {
    cy.visit('/')
    cy.contains('HOME').click()
    cy.get('input[type=text]').type("tracy")
    cy.get('input[type=text]').should('have.value', 'tracy')
  });

})