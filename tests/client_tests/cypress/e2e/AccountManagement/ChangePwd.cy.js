describe('Change Passsword', () => {
    beforeEach(() => {
        cy.login("test", "test")
        cy.visit('/')
        cy.get('#profileIcon').click()
        cy.contains('Profile').click()
    });
    //press cancel
    it('cancel', () =>{
        cy.get('#editPasswordIcon').click()
        cy.wait(1000)
        cy.get('#changeCurPwd').clear().type('password')
        cy.get('#changeNewPwd').clear().type('passcancel')
        cy.get('#changeCfmPwd').clear().type('passcancel')
        cy.contains('Cancel').click()
        //check that the username field has the same value as previous
        cy.url().should('include', '/profile')
    });
    //password doesnt follow standards we set (min 8 characters)
    it('bad pwd', () =>{
        cy.get('#editPasswordIcon').click()
        cy.wait(1000)
        cy.get('#changeCurPwd').clear().type('password')
        cy.get('#changeNewPwd').clear().type('badpass')
        cy.get('#changeCfmPwd').clear().type('badpass')
        cy.contains('OK').click()
        //TODO: get error in form
        cy.contains('Password length must be at least 8 characters long')
        cy.url().should('include', '/profile')
    });
    //current password is incorrect
    it('current pwd incorrect', () =>{
        cy.get('#editPasswordIcon').click()
        cy.wait(1000)
        cy.get('#changeCurPwd').clear().type('password123')
        cy.get('#changeNewPwd').clear().type('password')
        cy.get('#changeCfmPwd').clear().type('password')
        cy.contains('OK').click()
        //TODO: get error modal
        cy.contains('Incorrect password entered')
        cy.contains('OK').click()
        cy.url().should('include', '/profile')
    });
    //success
    it('success', () =>{
        cy.get('#editPasswordIcon').click()
        cy.wait(1000)
        cy.get('#changeCurPwd').clear().type('password')
        cy.get('#changeNewPwd').clear().type('password321')
        cy.get('#changeCfmPwd').clear().type('password321')
        cy.contains('OK').click()
        cy.contains('Password has been updated!')
        cy.contains('OK').click()
        //user gets logged out if succesful
        cy.url().should('include', '/profile')
        // cy.url().should('include', '/')
        // cy.get('#loginEmail').should('exist')
        cy.get('#editPasswordIcon').click()
        cy.wait(1000)
        cy.get('#changeCurPwd').clear().type('password321')
        cy.get('#changeNewPwd').clear().type('password')
        cy.get('#changeCfmPwd').clear().type('password')
        cy.contains('OK').click()
        cy.contains('Password has been updated!')
        cy.contains('OK').click()
    });
})