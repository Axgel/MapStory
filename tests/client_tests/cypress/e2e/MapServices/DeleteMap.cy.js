describe('Publish Map', () => {
    beforeEach(() => {
        cy.login("test", "test")
        cy.visit('/')
        cy.get('#mapsid').should('exist'); //verify on home page
        //verify that there is a map
        cy.get(".mt-8 > .px-10 > :nth-child(2)").should('exist');
    });
    
    //success
    it('success', () => {
        // cy.get('#tagsBtn').click() //click on tag
        // cy.contains("Add Tags") 
        // cy.get('#input_tag').type("usa")
        // cy.get('#addTagBtn').click()
        // cy.contains("usa")
        cy.get('.mt-8 > .px-10 > :nth-child(2)').then((currentMap)=>{
            cy.get(':nth-child(2) > .gap-4 > #deleteBtn').click() //click publish button
            cy.contains("OK").click()
            cy.get('.mt-8 > .px-10 > :nth-child(2)').should('not.equal', currentMap)
        })
    });

})