describe('Change Username', () => {
    beforeEach(() => {
        cy.login("test", "test")
        cy.visit('/')
        cy.get('#profileIcon').click()
        cy.contains('Profile').click()
    });
    //press cancel on modal
    it('cancel', () =>{
        cy.get('#profileUsername').then((currentUsername)=>{
            cy.wait(1000)
            cy.get('#editUsernameIcon').click() //click edit icon
            cy.get('#inputNewUsername').clear().type('cancelcancel') 
            cy.contains('Cancel').click()
            //check that the username field has the same value as previous
            cy.get('#profileUsername').should((newUsername) => {
                expect(newUsername[0]).to.eql(currentUsername[0]);
            })
        })
    });
    // username not unique
    it('nonunique username', () =>{
        cy.get('#profileUsername').then((currentUsername)=>{
            cy.get('#editUsernameIcon').click() //click edit icon
            cy.get('#inputNewUsername').clear().type('tray') //TODO
            cy.contains('OK').click()
            //check error
            cy.contains('An account with this username already exists.')
            cy.contains('OK').click()
            //check that the username field has the same value as previous
            cy.get('#profileUsername').should((newUsername) => {
                expect(newUsername[0]).to.eql(currentUsername[0]);
            })
        })
    });
    //empty username
    it('empty username', () =>{
        cy.get('#profileUsername').then((currentUsername)=>{
            cy.get('#editUsernameIcon').click() //click edit icon
            cy.get('#inputNewUsername').clear() //TODO
            cy.contains('OK').click()
            //check error
            cy.contains('Username cannot be empty')
            cy.contains('Cancel').click()
            //check that the username field has the same value as previous
            cy.get('#profileUsername').should((newUsername) => {
                expect(newUsername[0]).to.eql(currentUsername[0]);
            })
        })
    });
    //success
    it('success', () =>{
        cy.get('#editUsernameIcon').click()
        cy.get('#inputNewUsername').clear().type("newUsername") 
        cy.contains('OK').click()
        //check that the username field has the new value
        cy.get('#profileUsername').should('have.value', 'newUsername')
        //reset to old username
        cy.get('#editUsernameIcon').click()
        cy.get('#inputNewUsername').clear().type("fet") 
        cy.contains('OK').click()
    });
    
})