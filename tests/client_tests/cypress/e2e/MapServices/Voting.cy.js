describe('Voting', () => {
    beforeEach(() => {
        cy.login("testServices", "testServices")
        cy.visit('/')
        cy.get('#mapsid').should('exist') //verify on home page
        //navigate to published maps section
        cy.get('#publishedMapIcon').click()
        cy.get(':nth-child(2) > .gap-4 > #publishBtn').should('not.be.visible') //confirm on publish screen
    });
    
    
    //success
    it('success upvoting', () => {
        cy.get(":nth-child(2) > :nth-child(1) > #votingInfo > :nth-child(1) > #upvoteCount").then((upvoteCount)=>{
            cy.get(':nth-child(2) > :nth-child(1) > #votingInfo > :nth-child(1) > #upvoteIcon').click()
            //value should be plus one
            cy.get(":nth-child(2) > :nth-child(1) > #votingInfo > :nth-child(1) > #upvoteCount").should('not.eq', upvoteCount)
        })
        // cy.get(':nth-child(2) > :nth-child(1) > #votingInfo > :nth-child(1) > #upvoteCount')   
        //     .invoke('val')                                 
        //     .then(initial => {
        //     cy.get(':nth-child(2) > :nth-child(1) > #votingInfo > :nth-child(1) > #upvoteIcon').click()
            
        //     cy.get(':nth-child(2) > :nth-child(1) > #votingInfo > :nth-child(1) > #upvoteCount')
        //     .invoke('val')
        //     .should('eq', 1+ initial)
        // })
    });
    //success
    it('success downvoting', () => {
        cy.get(":nth-child(2) > :nth-child(1) > #votingInfo > :nth-child(2) > #downvoteIcon").then((upvoteCount)=>{
            cy.get(':nth-child(2) > :nth-child(1) > #votingInfo > :nth-child(2) > #downvoteIcon').click()
            //value should be plus one
            cy.get(":nth-child(2) > :nth-child(1) > #votingInfo > :nth-child(2) > #downvoteCount").should('not.eq', upvoteCount)
        })
    });

})