describe('Login', () => {
    //no account with email
    it('email does not exist', () =>{
        cy.visit('/')
        cy.get('#loginEmail').clear().type("testing@gmail.com")
        cy.get('#loginPwd').clear().type("password123")
        cy.contains('Log In').click()
        //make sure error appears
        cy.contains('Wrong email or password provided.')
        cy.contains('OK').click()

    });
    //incorrect email or password
    it('incorrect pwd', () =>{
        cy.visit('/')
        cy.get('#loginEmail').clear().type("testuser@stonybrook.edu")
        cy.get('#loginPwd').clear().type("incorrect")
        cy.contains('Log In').click();
        //make sure an error appears
        cy.contains('Wrong email or password provided.')
        cy.contains('OK').click()
    });
    //success
    it('success', () => {
        cy.visit('/')
        cy.get('input[name=email]').type("testing123@gmail.com")
        cy.get('input[name=pwd]').type("password")
        cy.get('#loginButton').click()
        cy.contains('Maps')
        // cy.visit('/') 
        cy.contains('Search By:')
        cy.contains('Sort By:')
        cy.get('#profileIcon').should('exist')
    });

})