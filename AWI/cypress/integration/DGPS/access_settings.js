const URL = "http://localhost:1337/Activities/DGPS/flights"
describe("Access the settings from the flight view", function(){
    beforeEach(function(){
        cy.visit(URL)
    })
    it("Access Directory Setting", function(){
        cy.get('.dropdown-menu.account-menu').contains("Directories").click()
        cy.url().should("eq", "http://localhost:1337/Settings/DGPS")
    })
    it('Access Filters Settings', function(){
        cy.get('.dropdown-menu.account-menu').contains("Filters").click()
        cy.url().should("eq", "http://localhost:1337/Activities/DGPS/filterSettings")
    })
})