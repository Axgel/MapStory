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

    //blank title
    it('blank title', () => {
        cy.get('#upload-map-title').clear()
        cy.get('#fileUpload').selectFile('./cypress/fixtures/squares.shp')
        cy.get('#uploadFileBtn').click()
        cy.contains('Map title cannot be empty')
    });

    //file not formatted properly (SHP + JSON)
    // it('bad file format', () => {
    //     cy.get('#upload-map-title').clear().type("Testing geojson")
    //     cy.get('#fileUpload').selectFile(['./cypress/fixtures/squares.shp', './cypress/fixtures/squares.json'])
    //     cy.get('#uploadFileBtn').click()
    //     cy.contains('Map title cannot be empty')
    // });

    //success shp only
    it('shp success', () => {
        cy.get('#fileUpload').selectFile('./cypress/fixtures/squares.shp')
        cy.get('#upload-map-title').clear().type("Testing shp")
        cy.get('#uploadFileBtn').click()
        cy.wait(1000)
        cy.url().should('include', '/map')
    });

    //success shp and dbf
    it('shp dbf success', () => {
        cy.get('#fileUpload').selectFile(['./cypress/fixtures/squares.shp', './cypress/fixtures/squares.dbf'])
        cy.get('#upload-map-title').clear().type("Testing shp/dbf")
        cy.get('#uploadFileBtn').click()
        cy.wait(1000)
        cy.url().should('include', '/map')
    });
    
    //success json
    it('json success', () => {
        cy.get('#fileUpload').selectFile('./cypress/fixtures/squares.json')
        cy.get('#upload-map-title').clear().type("Testing geojson")
        cy.get('#uploadFileBtn').click()
        cy.wait(1000)
        cy.url().should('include', '/map')
    });

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

})