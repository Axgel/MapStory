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
        cy.get('#changeCurPwd').clear().type('password')
        cy.get('#changeNewPwd').clear().type('passcancel')
        cy.get('#changeCfmPwd').clear().type('passcancel')
        cy.contains('Cancel').click()
        //check that the username field has the same value as previous
        cy.url().should('include', '/profile')
    });
    //password doesnt follow standards we set (min 8 characters)
    it('change pwd: bad pwd', () =>{
        cy.get('#editPasswordIcon').click()
        cy.get('#changeCurPwd').clear().type('password')
        cy.get('#changeNewPwd').clear().type('badpass')
        cy.get('#changeCfmPwd').clear().type('badpass')
        cy.contains('OK').click()
        //TODO: get error

        cy.url().should('include', '/profile')
    });
    //success
    it('change pwd: success', () =>{
        cy.get('#editPasswordIcon').click()
        cy.get('#changeCurPwd').clear().type('password')
        cy.get('#changeNewPwd').clear().type('password321')
        cy.get('#changeCfmPwd').clear().type('password321')
        cy.contains('OK').click()
        //user gets logged out if succesful
        cy.url().should('include', '/profile')
        // cy.url().should('include', '/')
        // cy.get('#loginEmail').should('exist')
    });
    //TODO: how to determine when you successfully changed your password?
})