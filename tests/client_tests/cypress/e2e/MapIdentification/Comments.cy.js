describe('Comments', () => {
    beforeEach(() => {
        cy.login("testServices", "testServices")
        cy.visit('/')
        cy.get('#mapsid').should('exist') //verify on home page
        //navigate to published maps section
        cy.get('#publishedMapIcon').click()
        cy.get(':nth-child(2) > .gap-4 > #publishBtn').should('not.be.visible') //confirm on publish screen
        cy.get(".mt-8 > .px-10 > :nth-child(2)").click()
        // cy.get('#commentDetailView').click()
    });
    
    
    //success
    it('success', () => {
        cy.get('#commentDetailView').click()

    });
})