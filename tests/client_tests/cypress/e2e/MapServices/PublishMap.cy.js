describe('Publish Map', () => {
    beforeEach(() => {
        cy.login("testServices", "testServices")
        cy.visit('/')
        cy.get('#mapsid').should('exist'); //verify on home page
        //verify that there is a map
        cy.get(".mt-8 > .px-10 > :nth-child(2)").should('exist');
    });
    
    //success
    it('success', () => {
        // get title of map
        // press publish for the first personal map
        // confirm publish button disappears
        // make sure current date is on the map card

        //intercept the publish map api
        cy.get('.mt-8 > .px-10 > :nth-child(2)').then((currentMap)=>{
            cy.get(':nth-child(2) > .gap-4 > #publishBtn').click() //click publish button
            cy.contains("OK").click()
            cy.get(':nth-child(2) > .gap-4 > #publishBtn').should('have.class', 'hidden')

            // cy.get('#inputNewUsername').clear().type('cancelcancel') 
            // cy.contains('Cancel').click()
            // //check that the username field has the same value as previous
            // cy.get('#profileUsername').should((newUsername) => {
            //     expect(newUsername[0]).to.eql(currentUsername[0]);
            // })
        })
    });

})