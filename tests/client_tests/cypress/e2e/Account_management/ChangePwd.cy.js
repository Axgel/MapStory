describe('Change Passsword', () => {
    beforeEach(() => {
        cy.login("testUsername", "testUsername")
        cy.visit('/')
        cy.get('#profileIcon').click()
        cy.contains('Profile').click()
    });
    //press cancel
    it('change pwd: cancel', () =>{
        cy.get('#editPasswordIcon').click()
        cy.get('input[type=text]').clear().type('passcancel')
        cy.contains('Cancel').click()
        //check that the username field has the same value as previous
        cy.url().should('include', '/profile')
    });
    //password doesnt follow standards we set (min 8 characters)
    it('change pwd: bad pwd', () =>{
        cy.get('#editPasswordIcon').click()
        cy.get('input[type=text]').clear().type('badbad')
        cy.contains('Cancel').click()
        //TODO: get error

        cy.url().should('include', '/profile')
    });
    //success
    it('change pwd: success', () =>{
        cy.get('#editPasswordIcon').click()
        cy.get('input[type=text]').clear().type('badbadbad')
        cy.contains('Ok').click()
        //user gets logged out if succesful
        cy.url().should('include', '/')
        cy.get('#loginEmail').should('exist')
    });
    //TODO: how to determine when you successfully changed your password?
})