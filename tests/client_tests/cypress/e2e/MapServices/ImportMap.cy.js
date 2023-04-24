describe('Import Map', () => {
    beforeEach(() => {
        cy.login("testServices", "testServices")
        cy.visit('/')
        cy.get('#mapsid').should('exist'); //verify on home page
        cy.wait(1000)
        cy.get('#createMapBtn').click()
        cy.contains("Upload File")
        //click create map
        cy.get('#fileUpload').click()
        
    });
    //file not formatted properly (SHP + JSON)
    
    //success
    it('success', () => {
        // cy.contains("Sort By:")
        // cy.contains("Search By:")
        // cy.intercept("GET", '/store/publishedmaps').as('getPublishedMaps')
        
        // cy.wait('@getPublishedMaps').its('response.statusCode').should('eq', 200)
        // cy.wait('@getPublishedMaps').then((response) => {
        //     cy.contains("Upload File")
        //     cy.get('#fileUpload').click()
        // })
        // cy.wait(5000)
        // cy.wait('@getPublishedMaps')
        cy.get('#fileUpload').selectFile('./cypress/fixtures/usastates.json')
        cy.get('#upload-map-title').clear().type("Testing geojson")
        cy.get('#uploadFileBtn').click()
        cy.wait(1000)
        cy.url().should('include', '/map')
    });

})