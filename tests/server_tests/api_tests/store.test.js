const app = require("../../../server/app");
const request = require("supertest");
const agent = request.agent(app);

let cookie;
describe ("POST /login", () => {
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
    describe("Attempting to login", () => {
        //respond with 400 since there is already data in the db
        it("should fail as it is an nonexistent account", async () => {
            const response = await request(app).post("/auth/login").send({})
            expect(response.status).toEqual(400)
        })
        it("should fail as it is an nonexistent account", async () => {
            request(app).post("/auth/login").send({
                email: "fail@stonybrook.edu",
                password: "FailingCSE416"
            })
            .expect(400)
        });
        it("should verify and login with setting cookies", async () => {
            const response = await request(app).post("/auth/login").send({
                email: "JohnSmith6969@gmail.com",
                password: "123456789"
            })
            expect(response.status).toBe(200);
            cookies = response.headers["set-cookie"];
            console.log(cookies)
        });
    })
})

describe ("POST /createMap", () => {
    describe("Checking for endpoint", () =>{
        it("should return 400", async() => {
        const response = await agent.post("/store/map").set("Cookie", cookies).send()
        expect(response.status).toBe(400);
        expect(response.body.error).toEqual('Invalid Map');
        })
    });
    describe("Checking for endpoint", () =>{
        it("should return 400", async() => {
        const response = await agent.post("/store/subregion").set("Cookie", cookies).send()
        expect(response.status).toBe(400);
        expect(response.body.error).toEqual('You must provide a subregion');
        })
    });
});

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