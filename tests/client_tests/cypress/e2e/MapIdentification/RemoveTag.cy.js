describe('Remove Tag', () => {
    beforeEach(() => {
        cy.login("test", "test")
        cy.visit('/')
        cy.get('#mapsid').should('exist'); //verify on home page
        //double click DO NOT DELETE (map name)
        cy.contains("TESTING").dblclick()
        cy.url().should('include', '/map')
        cy.get('#tagsBtn').click() //click on tag
        cy.contains("Add Tags") 
    });
    
    //tag already exists
    
    //success
    it('success', () => {
        // cy.get(':nth-child(1) > .w-auto > #displayed_tag').exists()
        cy.get(':nth-child(1) > .w-auto > #displayed_tag').then((tag)=>{
            cy.get(':nth-child(1) > .w-auto > #removeTagBtn').click() //click X icon
            cy.get(':nth-child(1) > .w-auto > #displayed_tag').should("not.contain", tag)
        })
    });

})