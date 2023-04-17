const {app, close_all_connections} = require("../../../server/index");
const request = require("supertest");

// console.log(server)
afterAll(() => {
    close_all_connections();
})

// describe ("GET /demo", () => {
//     describe("retreiving information from demo", () => {
//         //respond with 200 since there is already data in the db
//         test("should response with 200 status code", async () => {
//             const response = await request(app).get("/api/demo")
//             expect(response.status).toEqual(200)
//         })
//     })
// })

// describe ("POST /demo", () => {
//     describe("Adding new user into demo", () =>{
//         //Response with 400 since there is no name inputted
//         test("Should respond with status of 400", async () => {
//             const response = await request(app).post("/api/demo").send({})
//             expect(response.status).toEqual(400)
//         })
//         //respond with 200 since it is added into the db
//         test("Should response with success", async () => {
//             const response = await request(app).post("/api/demo").send({
//                 name: "Joe"
//             })
//             expect(response.body.success).toBeDefined()
//         })
//     })
// })

describe ("POST /register", () => {
    describe("Attempt to add user without including any fields", () =>{
        test("Should respond with status of 400", async () => {
            const response = await request(app).post("/auth/register").send({})
            expect(response.status).toEqual(400)
        })
    })
    describe("Attempt to add user password longer than 8 characters", () =>{
        test("Should respond with status of 400", async () => {
            const response = await request(app).post("/auth/register").send({
                userName: "JohnS",
                firstName: "John", 
                lastName: "Smith", 
                email: "JohnSmith6969@gmail.com", 
                password: "123456", 
                passwordVerify: "123456",
            })
            expect(response.status).toEqual(400)
            expect(response.body.errorMessage).toEqual("Please enter a password of at least 8 characters.")
        })
    })
    describe("Attempt to add user with unverified password", () =>{
        test("Should respond with status of 400", async () => {
            const response = await request(app).post("/auth/register").send({
                userName: "JohnS",
                firstName: "John", 
                lastName: "Smith", 
                email: "JohnSmith6969@gmail.com", 
                password: "123456789", 
                passwordVerify: "123456",
            })
            expect(response.status).toEqual(400)
            expect(response.body.errorMessage).toEqual("Please enter the same password twice.")
        })
    })
})

describe ("POST /profile/username", () => {
    describe("Testing endpoints", () => {
        //respond with 200 since there is already data in the db
        test("should response with 200 status code", async () => {
            const response = await request(app).post("/auth/profile/username").send({})
            expect(response.status).toEqual(200)
        })
    })
})

describe ("POST /profile/password", () => {
    describe("Testing endpoints", () => {
        //respond with 200 since there is already data in the db
        test("should response with 200 status code", async () => {
            const response = await request(app).post("/auth/profile/password").send({})
            expect(response.status).toEqual(200)
        })
    })
})

// describe ("POST /recoverPassword", () => {
//     describe("Testing endpoints", () => {
//         //respond with 200 since there is already data in the db
//         test("should response with 200 status code", async () => {
//             const response = await request(app).post("/auth/recoverPassword").send({})
//             expect(response.status).toEqual(200)
//         })
//     })
// })
