describe('Import Map', () => {
    beforeEach(() => {
        cy.login("testMaps", "testMaps")
        cy.visit('/')
        cy.get('#mapsid').should('exist'); //verify on map page
    });
    //file not formatted properly (SHP + JSON)
    //success
    it('success', () => {
        //click create map
        cy.get('#createMapBtn').click()
        cy.contains("Upload File")
        cy.get('input[type="file"]').click()
        cy.get('input[type="file"]').selectFile('./cypress/fixtures/usastates.json')
        cy.get('#uploadFileBtn').click()
        cy.wait(1000)
        cy.url().should('include', '/map')
    });

})