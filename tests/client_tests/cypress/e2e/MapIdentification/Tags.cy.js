describe('Tags', () => {
    beforeEach(() => {
        cy.login("testIdentification", "testIdentification")
        cy.visit('/')
        cy.get('#mapsid').should('exist') //verify on home page
        // TODO: check and make sure map is not published
        cy.get(".mt-8 > .px-10 > :nth-child(2)").dblclick()
        cy.wait(1000)
        cy.url().should('include', '/map')
        cy.get('#tagsBtn').click() //click on tag
        cy.contains("Add Tags") 
    });
    
    //tag already exists
    
    //add 
    it('add success', () => {
        cy.get('#input_tag').type("rare usa")
        cy.get('#addTagBtn').click()
        cy.contains("rare usa")
    });

    //remove
    it('remove success', () => {
        cy.get(':nth-child(1) > .w-auto > #displayed_tag')
        cy.get(':nth-child(1) > #tagCard > #displayed_tag').then((tag)=>{
            cy.get(':nth-child(1) > #tagCard > #removeTagBtn').click() //click X icon
            cy.get(':nth-child(1) > #tagCard > #displayed_tag').should("not.contain", tag)
        })
    });

})