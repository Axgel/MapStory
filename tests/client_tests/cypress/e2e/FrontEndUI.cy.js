describe('FrontEndUI', () => {
  // splash screen
  it('splashScreen', () => {
    cy.visit('/')
    cy.contains('MapStory'); //make sure team name appears
    //testing email input field
    cy.get('input[name=email]').type("jsmith@gmail.com")
    cy.get('input[name=email]').should('have.value', 'jsmith@gmail.com')
    //testing password input field
    cy.get('input[name=pwd]').type("Jsmith123")
    cy.get('input[name=pwd]').should('have.value', 'Jsmith123') //not sure if testable cause its should be replaced with dots
    //check if button exists
    cy.contains('Log In');
    cy.contains('Forgot Password');
    cy.contains('Register');
    cy.contains('Continue as Guest');
    cy.contains('About');
  });

  //recover password screen
  it('recoverpasswordScreen', () => {
    cy.visit('/recover')
    cy.contains('MapStory'); //make sure team name 
    cy.contains('Confirm')
    //form testing
    cy.get('#pwd').type("Jsmith123") 
    cy.get('#confirmPwd').type("Jsmith123")
    cy.get('input[value="Confirm"]').click()
    cy.get('#pwd').should('have.value', '')
    cy.get('#confirmPwd').should('have.value', '')
  });

  //register screen
  it('registerScreen', () => {
    cy.visit('/register')
    cy.contains('MapStory'); //make sure team name appears
    cy.contains('Create Account') 
    //form testing
    cy.get('input[name=email]').type("jsmith@gmail.com")
    cy.get('input[name=username]').type("jsmithy1234")
    cy.get('#pwd').type("Jsmith123") 
    cy.get('#confirmPwd').type("Jsmith123")
    //click submit and have typed text disappear
    cy.get('input[type=submit').click()
    cy.get('input[name=email]').should('have.value', '')
    cy.get('input[name=username]').should('have.value', '')
    cy.get('#pwd').should('have.value', '')
    cy.get('#confirmPwd').should('have.value', '')
  });

  //profile screen
  it('profileScreen', () => {
    cy.visit('/profile')
    cy.contains('MapStory'); //make sure team name appears
    cy.contains('Email');
    cy.contains('Username');
    cy.contains('Password');
  });

  //Personal/Published/Shared Maps Screen
  it('homeScreen', () => {
    cy.visit('/home')
    cy.contains('MapStory'); //make sure team name appears
    cy.contains('Search By:');
    cy.contains('Sort By:');
    cy.get('input[type=text]').type("Australia 1982") 
    cy.contains('Create Map');

    //Map Card
    cy.contains('Publish');
    cy.contains('Published: ');
    cy.contains('Fork');
    cy.contains('Delete');

    //Sideview
    cy.contains('Comments');
    cy.contains('Properties');

  });

  //Map Editing/Viewing Screen
  it('mapScreen', () => {
    cy.visit('/map')
    cy.contains('MapStory'); //make sure team name appears
    cy.contains('File');
    cy.contains('Share');
    cy.contains('Export');

    cy.contains('Comments');
    cy.contains('Properties');

    //Property Table
    cy.contains('New York');
    cy.contains('Population');
  });


})