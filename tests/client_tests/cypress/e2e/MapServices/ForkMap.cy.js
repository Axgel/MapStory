describe('Fork Map', () => {
    beforeEach(() => {
        cy.login("testServices", "testServices")
        cy.visit('/')
        cy.get('#mapsid').should('exist'); //verify on home page
        //verify that there is a map
        cy.get(".mt-8 > .px-10 > :nth-child(2)").should('exist');
    });
    
    //success
    it('success', () => {
        cy.get(':nth-child(2) > :nth-child(1) > .px-8 > .text-xl').then((title)=>{
            cy.get(':nth-child(2) > .gap-4 > #forkBtn').click() //click publish button
            cy.contains("OK").click()
            cy.contains("Copy of "+ title.text())
        })  
    });

})