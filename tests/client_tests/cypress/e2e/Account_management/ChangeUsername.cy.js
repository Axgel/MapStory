describe('Change Username', () => {
    beforeEach(() => {
        cy.login("testUsername", "testUsername")
        cy.visit('/')
        cy.get('#profileIcon').click()
        cy.contains('Profile').click()
    });
    //press cancel on modal
    it('change username: cancel', () =>{
        cy.get('#profileUsername').then((currentUsername)=>{
            cy.get('#editUsernameIcon').click() //click edit icon
            cy.get('#inputChangeUsername').clear().type('badbadbad') //TODO
            cy.contains('Cancel').click()
            //check that the username field has the same value as previous
            cy.get('#profileUsername').should((newUsername) => {
                expect(newUsername[0]).to.eql(currentUsername[0]);
            })
        })
    });
    // username not unique
    it('change username: nonunique username', () =>{
        cy.get('#profileUsername').then((currentUsername)=>{
            cy.get('#editUsernameIcon').click() //click edit icon
            cy.get('#inputChangeUsername').clear().type('tray') //TODO
            cy.contains('OK').click()
            //TODO: check error

            //check that the username field has the same value as previous
            cy.get('#profileUsername').should((newUsername) => {
                expect(newUsername[0]).to.eql(currentUsername[0]);
            })
        })
    });
    //success
    it('change username: success', () =>{
        cy.get('#editUsernameIcon').click()
        cy.get('#profileUsername').clear().type("newUsername") //TODO
        cy.contains('Ok').click()
        //check that the username field has the new value
        cy.get('#profileUsername').should('have.value', 'newUsername')
    });
    
})