describe('Login', () => {
    //no account with email
    it('login: email does not exist', () =>{
        cy.visit('/')
        cy.get('#loginEmail').clear().type("testing@gmail.com")
        cy.get('#loginPwd').clear().type("password123")
        cy.contains('Log In').click();
        //make sure error appears

    });
    //incorrect password
    it('login: incorrect pwd', () =>{
        cy.visit('/')
        cy.get('#loginEmail').clear().type("testuser@stonybrook.edu")
        cy.get('#loginPwd').clear().type("incorrect")
        cy.contains('Log In').click();
        //make sure an error appears
    });
    //success
    it('login: success', () => {
        cy.visit('/')
        cy.get('#loginEmail').clear().type("testing123@gmail.com")
        cy.get('#loginPwd').clear().type("password")
        cy.contains('Log In').click().then((success)=>{
            cy.contains('Maps')
            cy.contains('Search By:')
            cy.contains('Sort By:')
            cy.get('#profile-dd').should('exist');
        })
        // cy.visit('/') 
        
    });

})