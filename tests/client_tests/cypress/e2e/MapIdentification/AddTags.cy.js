describe('Add Tags', () => {
    beforeEach(() => {
        cy.login("testIdentification", "testIdentification")
        cy.visit('/')
        cy.get('#mapsid').should('exist'); //verify on home page
        //double click DO NOT DELETE (map name)
        cy.get(".mt-8 > .px-10 > :nth-child(2)").dblclick()
        cy.url().should('include', '/map')
        cy.get('#tagsBtn').click() //click on tag
        cy.contains("Add Tags") 
    });
    
    //tag already exists
    
    //success
    it('success', () => {
        cy.get('#input_tag').type("rare usa")
        cy.get('#addTagBtn').click()
        cy.contains("rare usa")
    });

})