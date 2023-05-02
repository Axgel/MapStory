describe('Comments', () => {
    beforeEach(() => {
        cy.login("testServices", "testServices")
        cy.visit('/')
        cy.get('#mapsid').should('exist') //verify on home page
        //navigate to published maps section
        cy.get('#publishedMapIcon').click()
        cy.get(':nth-child(2) > .gap-4 > #publishBtn').should('not.be.visible') //confirm on publish screen
        cy.get(".mt-8 > .px-10 > :nth-child(2)").click()
        cy.get('#commentDetailView').click()
    });

    //blank comment
    
    

    //success pressing icon
    it('success', () => {
        cy.get('#input_comment').type("just what I needed")
        cy.get("#submit_comment").click()
        cy.get('#commentView').contains('fet')
        cy.get('#commentView').contains("just what I needed")
    });

    //success pressing enter
    it('success', () => {
        cy.get('#input_comment').type("good map{enter}")
        cy.get('#commentView').contains("good map")
    });
})