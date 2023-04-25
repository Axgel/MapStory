describe('Logout', () => {
    //success
    it('success', () => {
        cy.login("test", "test")
        cy.visit('/') 
        cy.contains('Search By:')
        cy.contains('Sort By:')
        cy.get('#profileIcon').click()
        cy.contains('Logout').click()
        cy.url().should('include', '/')
        cy.get('#loginEmail').should('exist')
    });

})