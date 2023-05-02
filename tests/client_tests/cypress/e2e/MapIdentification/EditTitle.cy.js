describe('Edit Title', () => {
    beforeEach(() => {
        cy.login("testIdentification", "testIdentification")
        cy.visit('/')
        cy.get('#mapsid').should('exist'); //verify on home page
        //TODO: check if map is published
        cy.get(".mt-8 > .px-10 > :nth-child(2)").dblclick()
        cy.wait(1000)
        cy.url().should('include', '/map')
    });
    
    // blank title
    it('edit to blank title', () => {
        cy.get("#mapTitleTB").then((currentTitle)=>{
            cy.get('#mapTitleTB').dblclick()
            cy.get('#inputNewUsername').clear().type("{enter}");
            //get error for blank title
            cy.get("#mapTitleTB").should('eq', currentTitle)
        })
    });
    
    //success
    it('success', () => {
        // cy.get("#mapTitleTB").then((currentTitle)=>{
            cy.get('#mapTitleTB').dblclick()
            cy.get('#inputNewUsername').clear().type("newTitle{enter}");
            cy.get('#mapTitleTB').contains("newTitle")
        // })
    });

})