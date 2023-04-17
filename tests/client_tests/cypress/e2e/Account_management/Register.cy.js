describe('Register', () => {
    beforeEach(() => {
        cy.visit('/')
        cy.contains('Register').click();
        
    });
    //bad email
    it('register: bad email format', () =>{
        cy.get('input[name=email]').type("registerFETgmail.com")
        cy.get('input[name=username]').type("fet")
        cy.get('#pwd').type("frontendtestcypress") 
        cy.get('#confirmPwd').type("frontendtestcypress")
        cy.get('#createAccBtn').click()
        //get error

    });
    //non-unique username
    it('register: bad pwd format', () =>{
        cy.get('input[name=email]').type("registerFETgmail.com")
        cy.get('input[name=username]').type("tray")
        cy.get('#pwd').type("frontendtestcypress") 
        cy.get('#confirmPwd').type("frontendtestcypress")
        cy.get('#createAccBtn').click()
        //get error

    });
    //password doesnt fit requirements (less than 8 chars)
    it('register: bad pwd format', () =>{
        cy.get('input[name=email]').type("registerFETgmail.com")
        cy.get('input[name=username]').type("fet")
        cy.get('#pwd').type("fet") 
        cy.get('#confirmPwd').type("fet")
        cy.get('#createAccBtn').click()
        //get error

    });
    //passwords do not match
    it('register: pwd dont match', () =>{
        cy.get('input[name=email]').type("registerFET@gmail.com")
        cy.get('input[name=username]').type("fet")
        cy.get('#pwd').type("frontendtestcypress") 
        cy.get('#confirmPwd').type("frontcypress")
        cy.get('#createAccBtn').click()
        //get error

    });   
    //successful registration
    it('register: success', () =>{
        cy.get('input[name=email]').type("registerFET@gmail.com")
        cy.get('input[name=username]').type("fet123")
        cy.get('#pwd').type("frontendtestcypress") 
        cy.get('#confirmPwd').type("frontendtestcypress")
        cy.visit('/')
        // cy.get('#createAccBtn').click()
        //should be directed to the splash screen for user to log in
        // cy.url().should('include', '/')
        // cy.get('#loginEmail').should('exist');
        // cy.get('#loginPwd').should('exist');
    });
})