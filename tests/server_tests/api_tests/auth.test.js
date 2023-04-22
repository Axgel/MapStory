const {app, close_all_connections} = require("../../../server/index");
const request = require("supertest");
const agent = request.agent(app)

// console.log(server)
// afterAll(() => {
//     close_all_connections();
// })

describe ("POST /register", () => {
    describe("Attempt to add user without including any fields", () =>{
        it("Should respond with status of 400", async () => {
            const response = await request(app).post("/auth/register").send({})
            expect(response.status).toEqual(400)
            expect(response.body.errorMessage).toEqual("Please enter all required fields.")
        });
    });
    describe("Attempt to add user password longer than 8 characters", () =>{
        it("Should respond with status of 400", async () => {
            const response = await request(app).post("/auth/register").send({
                userName: "JohnS",
                email: "JohnSmith6969@gmail.com", 
                password: "123456", 
                passwordVerify: "123456",
            })
            expect(response.status).toEqual(400)
            expect(response.body.errorMessage).toEqual("Please enter a password of at least 8 characters.")
        });
    });
    describe("Attempt to add user with unverified password", () =>{
        it("Should respond with status of 400", async () => {
            const response = await request(app).post("/auth/register").send({
                userName: "JohnS",
                email: "JohnSmith6969@gmail.com", 
                password: "123456789", 
                passwordVerify: "123456",
            })
            expect(response.status).toEqual(400)
            expect(response.body.errorMessage).toEqual("Please enter the same password twice.")
        });
    });
    describe("Attempt to register with an existing email", () => {
        it("should respond with status 400", async () => {
            const response = await request(app).post("/auth/register").send({
                userName: "fet",
                email: "testing123@gmail.com",
                password: "12345678",
                passwordVerify: "12345678",
            })
            expect(response.status).toEqual(400)
            expect(response.body.errorMessage).toEqual("An account with this email address already exists.")
        });
    });
    describe("Attempt to register with an existing username", () => {
        it("should respond with status 400", async () => {
            const response = await request(app).post("/auth/register").send({
                userName: "fet",
                email: "testing1234@gmail.com",
                password: "12345678",
                passwordVerify: "12345678",
            })
            expect(response.status).toEqual(400)
            expect(response.body.errorMessage).toEqual("An account with this username already exists.")

        });
    });
    describe("Register user", () =>{
        it("Should successfully register the user", async () => {
            const response = await request(app).post("/auth/register").send({
                userName: "JohnS",
                email: "JohnSmith6969@gmail.com", 
                password: "123456789", 
                passwordVerify: "123456789",
            })
            expect(response.status).toEqual(200)
        });
    });
})

describe ("POST /profile/username", () => {
    describe("Testing endpoints", () => {
        it("should response with 400 status code", async () => {
            const response = await request(app).post("/auth/profile/username").send({})
            expect(response.status).toEqual(400)
            expect(response.body.errorMessage).toEqual("Please enter all required fields.")
        })
        it("should response with 400 status code", async () => {
            const response = await request(app).post("/auth/profile/username").send({
                email: "testing@gmail.com",
                userName: "test"
            })
            expect(response.status).toEqual(400)
            expect(response.body.errorMessage).toEqual("Wrong email provided.")
        })
        it("should response with 400 status code", async () => {
            const response = await request(app).post("/auth/profile/username").send({
                email: "JohnSmith6969@gmail.com",
                userName: "fet"
            })
            expect(response.status).toEqual(400)
            expect(response.body.errorMessage).toEqual("An account with this username already exists.")
        })
        it("should response with 200 status code", async () => {
            const response = await request(app).post("/auth/profile/username").send({
                email: "JohnSmith6969@gmail.com",
                userName: "John"
            })
            expect(response.status).toEqual(200)
        })
    })
})

describe ("POST /profile/password", () => {
    describe("Testing endpoints", () => {
        //respond with 400 since there is already data in the db
        it("should response with 400 status code", async () => {
            const response = await request(app).post("/auth/profile/password").send({})
            expect(response.status).toEqual(400)
        })
        it("should response with 200 status code", async () => {
            const response = await request(app).post("/auth/profile/password").send({
                email: "JohnSmith6969@gmail.com",
                oldPwd: "123456789",
                newPwd: "1234567890",
                cfmPwd: "1234567890"
            })
            expect(response.status).toEqual(200)
        })
    })
})


describe ("POST /recoverPassword", () => {
    describe("Testing endpoints", () => {
        //respond with 400 since there is already data in the db
        it("should response with 400 status code", async () => {
            const response = await request(app).post("/auth/recoverPassword").send({})
            expect(response.status).toEqual(400)
        })
    })
})

describe ("Cleaning up database", ()=>{
    describe("Cleaning up data", () =>{
        it("Should clean up testing user", async () => {
            const response = await request(app).post("/auth/deleteUser").send({
                email: "JohnSmith6969@gmail.com", 
            })
            expect(response.status).toEqual(200)
        });
    });
})