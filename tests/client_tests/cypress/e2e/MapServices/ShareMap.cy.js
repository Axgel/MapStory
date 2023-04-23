describe('ShareMap', () => {
    beforeEach(() => {
        cy.login("testIdentification", "testIdentification")
        cy.visit('/')
        cy.get('#mapsid').should('exist') //verify on home page
        // TODO: check and make sure map is not published
        cy.get(".mt-8 > .px-10 > :nth-child(2)").dblclick()
        cy.wait(1000)
        cy.url().should('include', '/map')
        cy.get('#shareMapBtn').click() //click on share button
        cy.contains("People with access:") 
    });
    
    //tag already exists
    
    //add 
    it('add success', () => {
        cy.get('#add-collaborator').type("tracy.ho@stonybrook.edu")
        cy.get('#addCollaboratorBtn').click()
        cy.contains("tray") //username if successfully added
    });

    //cant have more than 3 collaborators

    //remove
    it('remove success', () => {
        // cy.get(':nth-child(2) > #collabCard')
        cy.get(':nth-child(1) > #collabCard > .flex > #collabUsername').then((collabUsername)=>{
            cy.get('.mb-5 > :nth-child(2) > #removeCollab').click() //click X icon
            cy.get(':nth-child(1) > #collabCard > .flex > #collabUsername').should("not.contain", collabUsername)
        })
    });

})