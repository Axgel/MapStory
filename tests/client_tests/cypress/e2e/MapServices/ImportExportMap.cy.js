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
    it('bad file format', () => {
        cy.get('#upload-map-title').clear().type("Testing geojson")
        cy.get('#fileUpload').selectFile(['./cypress/fixtures/squares.shp', './cypress/fixtures/squares.json'])
        cy.get('#uploadFileBtn').click()
        cy.contains('Please upload a shp/dbf combo or geojson file')
    });

    //success shp only
    it('shp success', () => {
        cy.get('#fileUpload').selectFile('./cypress/fixtures/squares.shp')
        cy.get('#upload-map-title').clear().type("Testing shp")
        cy.get('#uploadFileBtn').click()
        cy.wait(1000)
        cy.url().should('include', '/map')
        //delete file
        cy.get('#mapFileBtn').click() //click on file
        cy.get('#deleteBtn').click()
        cy.contains("OK").click()
        cy.url().should('include', '/')
    });

    //success shp and dbf
    it('shp dbf success', () => {
        cy.get('#fileUpload').selectFile(['./cypress/fixtures/squares.shp', './cypress/fixtures/squares.dbf'])
        cy.get('#upload-map-title').clear().type("Testing shp/dbf")
        cy.get('#uploadFileBtn').click()
        cy.wait(1000)
        cy.url().should('include', '/map')

        //delete file
        cy.get('#mapFileBtn').click() //click on file
        cy.get('#deleteBtn').click()
        cy.contains("OK").click()
        cy.url().should('include', '/')
    });
    
    //success json
    it('json success', () => {
        cy.get('#fileUpload').selectFile('./cypress/fixtures/squares.json')
        cy.get('#upload-map-title').clear().type("TestingGeojson")
        cy.get('#uploadFileBtn').click()
        cy.wait(1000)
        cy.url().should('include', '/map')

        //test exporting geojson
        cy.get("#exportMapBtn").click()
        cy.contains("File Type")
        cy.get('#fileTypeSelect').click()
        cy.get('#geojsonFile').click()
        cy.get('#compression').type("0.2")
        cy.get('#okBtn').click()
        cy.readFile('cypress/downloads/TestingGeojson.json')

        //test exporting shp
        cy.get("#exportMapBtn").click()
        cy.contains("File Type")
        cy.get('#fileTypeSelect').click()
        cy.get('#shpFile').click()
        cy.get('#compression').type("0.2")
        cy.get('#okBtn').click()
        cy.readFile('cypress/downloads/TestingGeojson.zip')
    });

})