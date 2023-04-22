describe('Add Tags', () => {
    beforeEach(() => {
        cy.login("test", "test")
        cy.visit('/')
        cy.get('#mapsid').should('exist'); //verify on home page
        //double click DO NOT DELETE (map name)
        cy.get(":nth-child(1) > .px-8").dblclick()
        cy.url().should('include', '/map')
    });
    
    //tag already exists
    
    //success
    it('success', () => {
        cy.get('#tagsBtn').click() //click on tag
        cy.contains("Add Tags") 
        cy.get('#input_tag').type("usa")
        cy.get('#addTagBtn').click()
        cy.contains("usa")
    });

})