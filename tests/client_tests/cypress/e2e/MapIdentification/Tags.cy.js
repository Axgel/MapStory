describe('Tags', () => {
    beforeEach(() => {
        cy.login("testIdentification", "testIdentification")
        cy.visit('/')
        cy.get('#mapsid').should('exist') //verify on home page
        cy.get(".mt-8 > .px-10 > :nth-child(2)").dblclick()
        cy.wait(1000)
        cy.url().should('include', '/map')
        cy.get('#mapFileBtn').click() //click on file
        cy.get('#tagsBtn').click() //click on tag
        cy.contains("Add Tags") 
    });
    
    //add 
    it('add success', () => {
        cy.get('#input_tag').type("rare usa")
        cy.get('#addTagBtn').click()
        cy.contains("rare usa")
    });
    
    //tag already exists
    it('add success', () => {
        cy.get('#input_tag').type("rare usa")
        cy.get('#addTagBtn').click()
        cy.contains("Tag already exists")
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