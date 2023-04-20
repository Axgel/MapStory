describe('Import Map', () => {
    beforeEach(() => {
        cy.login("test", "test")
        cy.visit('/')
        cy.get('#mapsid').should('exist'); //verify on home page
        cy.get('#createMapBtn').click() //click create map
        cy.contains("Upload File")
    });
    //file not formatted properly (SHP + JSON)
    //success
    it('success', () => {
        cy.get('#fileUpload').click()
        cy.get('#fileUpload').selectFile('./cypress/fixtures/usastates.json')
        cy.get('#uploadFileBtn').click()
        cy.wait(1000)
        cy.url().should('include', '/map')
    });

})