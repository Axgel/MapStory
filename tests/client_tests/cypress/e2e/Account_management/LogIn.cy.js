describe('Login', () => {
    //success
    it('login: success', () => {
        // cy.login("test", "test");
        // cy.visit('/') //goes back to home screen when it should be the map page 
      //automatically runs to about:blank page?
      cy.visit('/')
      cy.get('#loginEmail').clear().type("testuser@stonybrook.edu")
      cy.get('#loginPwd').clear().type("password123")
      cy.contains('Log In').click();
      //at home screen
      cy.contains('Search By: ')
      cy.contains('Sort By: ')
      //contains profile drop down
    //   cy.visit('/');
    });

    it('login: email does not exist', () =>{
        cy.visit('/')
        cy.get('#loginEmail').clear().type("testing@gmail.com")
        cy.get('#loginPwd').clear().type("password123")
        cy.contains('Log In').click();
        //make sure error appears
            
    });

    it('login: incorrect pwd', () =>{
        cy.visit('/')
        cy.get('#loginEmail').clear().type("testuser@stonybrook.edu")
        cy.get('#loginPwd').clear().type("incorrect")
        cy.contains('Log In').click();
        //make sure an error appears
    });

})