describe('Register', () => {
    beforeEach(() => {
        cy.visit('/register')
    });
    //bad email 
    it('register: bad email format', () =>{
        cy.get('input[name=email]').type("registerFETgmail.com")
        cy.get('input[name=username]').type("fet")
        cy.get('#pwd').type("frontendtestcypress") 
        cy.get('#confirmPwd').type("frontendtestcypress")
        cy.get('#createAccBtn').click()
        //stay on same page
        cy.url().should('include', '/register')

    });
    //email exists already
    it('register: not unique username', () =>{
        cy.get('input[name=email]').type("tesing123@gmail.com")
        cy.get('input[name=username]').type("fet41038")
        cy.get('#pwd').type("frontendtestcypress") 
        cy.get('#confirmPwd').type("frontendtestcypress")
        cy.get('#createAccBtn').click()
        //get error
        cy.contains('An account with this email address already exists.')
        cy.contains('OK').click()

    });
    //non-unique username
    it('register: not unique username', () =>{
        cy.get('input[name=email]').type("registerFET@gmail.com")
        cy.get('input[name=username]').type("fet")
        cy.get('#pwd').type("frontendtestcypress") 
        cy.get('#confirmPwd').type("frontendtestcypress")
        cy.get('#createAccBtn').click()
        //get error
        cy.contains('An account with this username already exists.')
        cy.contains('OK').click()

    });
    //password doesnt fit requirements (less than 8 chars)
    it('register: bad pwd format', () =>{
        cy.get('input[name=email]').type("registerFET@gmail.com")
        cy.get('input[name=username]').type("fet")
        cy.get('#pwd').type("fet") 
        cy.get('#confirmPwd').type("fet")
        cy.get('#createAccBtn').click()
        //get error
        cy.contains('Please enter a password of at least 8 characters.')
        cy.contains('OK').click()

    });
    //passwords do not match
    it('register: pwd dont match', () =>{
        cy.get('input[name=email]').type("registerFET@gmail.com")
        cy.get('input[name=username]').type("fet")
        cy.get('#pwd').type("frontendtestcypress") 
        cy.get('#confirmPwd').type("frontcypress")
        cy.get('#createAccBtn').click()
        //get error
        cy.contains('Please enter the same password twice.')
        cy.contains('OK').click()

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
        cy.url().should('include', '/')
        cy.get('#loginEmail').should('exist');
        cy.get('#loginPwd').should('exist');
    });
})