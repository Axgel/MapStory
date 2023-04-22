describe('Change Passsword', () => {
    beforeEach(() => {
        cy.login("test", "test")
        cy.visit('/')
        cy.get('#profileIcon').click()
        cy.contains('Profile').click()
        cy.get('#editPasswordIcon').click()
    });
    //press cancel
    it('cancel', () =>{
        cy.wait(1000)
        cy.get('#changeCurPwd').type('password')
        cy.get('#changeNewPwd').type('passcancel')
        cy.get('#changeCfmPwd').type('passcancel')
        cy.contains('Cancel').click()
        //check that the username field has the same value as previous
        cy.url().should('include', '/profile')
    });
    //password doesnt follow standards we set (min 8 characters)
    it('bad pwd', () =>{
        cy.get('#changeCurPwd').type('password')
        cy.get('#changeNewPwd').type('badpass')
        cy.get('#changeCfmPwd').type('badpass')
        cy.contains('OK').click()
        //TODO: get error in form
        cy.contains('Password length must be at least 8 characters long')
        cy.url().should('include', '/profile')
    });
    //current password is incorrect
    it('current pwd incorrect', () =>{
        cy.get('#changeCurPwd').type('password123')
        cy.get('#changeNewPwd').type('password')
        cy.get('#changeCfmPwd').type('password')
        cy.contains('OK').click()
        //TODO: get error modal
        cy.contains('Incorrect password entered')
        cy.contains('OK').click()
        cy.url().should('include', '/profile')
    });
    //success
    it('success', () =>{
        cy.get('#changeCurPwd').type('password')
        cy.get('#changeNewPwd').type('password321')
        cy.get('#changeCfmPwd').type('password321')
        cy.intercept('POST', '/auth/profile/password').as('changePassword')
        cy.contains('OK').click()
        cy.wait('@changePassword').its('response.statusCode').should('eq', 200)
        cy.contains('Password has been updated!')
        cy.url().should('include', '/profile')
    });
})