describe('Import Map', () => {
    beforeEach(() => {
        cy.login("testServices", "testServices")
        cy.visit('/')
        cy.get('#mapsid').should('exist'); //verify on home page
        cy.contains("Upload File")
        cy.get('#fileUpload').click()
        //click create map
        
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
        // cy.wait(1000)
            
        cy.get('#fileUpload').selectFile('./cypress/fixtures/usastates.json')
        cy.get('#upload-map-title').type("Testing geojson")
        cy.get('#uploadFileBtn').click()
        cy.wait(1000)
        cy.url().should('include', '/map')
    });

})

// describe('Import Map', () => {
//     beforeEach(() => {
//         cy.login("test", "test")
//         cy.visit('/')
//         cy.get('#mapsid').should('exist'); //verify on home page
//         cy.get('#createMapBtn').click() //click create map
//         cy.contains("Upload File")
//         cy.get('#fileUpload').click()
//     });
//     //file not formatted properly (SHP + JSON)
//     //success
//     it('success', () => {
        
//         cy.get('#fileUpload').selectFile('./cypress/fixtures/usastates.json')
//         cy.get('#uploadFileBtn').click()
//         cy.wait(1000)
//         cy.url().should('include', '/map')
//     });

// })