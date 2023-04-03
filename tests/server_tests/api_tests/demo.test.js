const {app, server} = require("../../../server/index");
const request = require("supertest");
const db = require("../../../server/db");

// console.log(server)
afterAll(() => {
    db.close()
    server.close()
})

describe ("GET /demo", () => {
    describe("retreiving information from demo", () => {
        //respond with 200 since there is already data in the db
        test("should response with 200 status code", async () => {
            const response = await request(app).get("/api/demo")
            expect(response.status).toEqual(200)
        })
    })
})

describe ("POST /demo", () => {
    describe("Adding new user into demo", () =>{
        //Response with 400 since there is no name inputted
        test("Should respond with status of 400", async () => {
            const response = await request(app).post("/api/demo").send({})
            expect(response.status).toEqual(400)
        })
        //respond with 200 since it is added into the db
        test("Should response with success", async () => {
            const response = await request(app).post("/api/demo").send({
                name: "Joe"
            })
            expect(response.body.success).toBeDefined()
        })
    })
})