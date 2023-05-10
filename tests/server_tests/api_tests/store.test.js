const app = require("../../../server/app");
const request = require("supertest");
const agent = request.agent(app);

let cookies;
let user;
let map;
let forkedMap;
let userId;

describe("POST /login", () => {
    describe("Register user", () => {
        it("Should successfully register the user", async () => {
            const response = await request(app).post("/auth/register").send({
                userName: "JohnS",
                email: "JohnSmith6969@gmail.com",
                password: "123456789",
                passwordVerify: "123456789",
            });
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
                .expect(400);
        });
        it("should verify and login with setting cookies", async () => {
            const response = await request(app).post("/auth/login").send({
                email: "JohnSmith6969@gmail.com",
                password: "123456789"
            });
            expect(response.status).toBe(200);
            user = response.body.user;
            userId = user._id
            cookies = response.headers["set-cookie"];
        });
    });
});

describe("POST /createMap & /createSubregions", () => {
    describe("Checking for endpoint", () => {
        it("should return 400", async () => {
            const response = await agent.post("/store/map").set("Cookie", cookies).send();
            expect(response.status).toBe(400);
            expect(response.body.error).toEqual('Invalid Map');
        });
    });
    describe("Creating the map", () => {
        it("should return 200", async () => {
            const response = await agent.post("/store/map").set("Cookie", cookies).send({
                title: "Testing",
                owner: user._id,
                ownerName: user.userName,
                collaborators: [],
                upvotes: [],
                downvotes: [],
                tags: [],
                isPublished: false,
                publishedDate: Date.now()
            });
            expect(response.status).toBe(201);
            expect(response.body.map).toBeDefined();
            map = response.body.map;
        });
    });
    describe("Checking for endpoint", () => {
        it("should return 400", async () => {
            const response = await agent.post("/store/subregion").set("Cookie", cookies).send();
            expect(response.status).toBe(400);
            expect(response.body.error).toEqual('You must provide a subregion');
        });
    });
    describe("Creating subregion in map", () => {
        it("Should return 200", async () => {
            const response = await agent.post("/store/subregion").set("Cookie", cookies).send({
                mapId: map._id,
                type: "MultiPolygon",
                properties: {
                    "GEO_ID": "0400000US01",
                    "STATE": "01",
                    "NAME": "Alabama",
                    "LSAD": "",
                    "CENSUSAREA": 50645.326
                },
                coordinates: [[[[-87.984916,35.005881],[-88.984916,35.005881],[-88.984916,34.005881],[-87.984916,34.005881]]]],
                isStale: false
            });
            expect(response.status).toBe(201);
            expect(response.body.message).toEqual("New subregion created");
        });
        
    });
});

describe("Getting Personal, Shared Maps and published maps ", () => {
    describe("Getting Personal Maps", () => {
        it("should return personal maps", async() =>{
            const response = await agent.get(`/store/ownermaps/${user._id}`).set("Cookie", cookies);
            expect(response.status).toBe(200);
            expect(response.body.personalMaps).toBeDefined();
        });
    });
    describe("Getting Personal Maps", () => {
        it("should return personal maps", async() =>{
            const response = await agent.get("/store/publishedmaps").set("Cookie", cookies);
            expect(response.status).toBe(200);
            expect(response.body.publishedMaps).toBeDefined();
        });
    });
});

describe("Testing Map functionalities", () => {
    describe("Publishing Map", () => {
        it("should successfully publish the map", async() => {
            const response = await agent.put(`/store/publish/${map._id}`).set("Cookie", cookies);
            expect(response.status).toBe(200);
            expect(response.body.message).toEqual("Map project published");
        })
    });
    describe("Forking a Published Map", () => {
        it("should failed to fork a map as UserId wasn't included ", async() =>{
            const response = await agent.post(`/store/fork/${map._id}`).set("Cookie", cookies).send();
            expect(response.status).toBe(400);
            expect(response.body.error).toBeDefined()
        });
        it("should successfully fork a map", async() =>{
            const response = await agent.post(`/store/fork/${map._id}`).set("Cookie", cookies).send({
                userId: user._id
            });
            expect(response.status).toBe(201);
            expect(response.body.map).toBeDefined()
            forkedMap = response.body.map
        });
    });
    describe("Changing Map Title of forked map", () => {
        it("should successfully change the title", async() => {
            const response = await agent.put(`/store/title/${forkedMap._id}`).set("Cookie", cookies).send({
                title: "Newly Forked Map"
            });
            expect(response.status).toBe(200);
            expect(response.body.message).toEqual("Map project title updated");
        });
    });
    describe("Adding Tags to forked map", () => {
        it("should successfully add the tag", async() => {
            const response = await agent.put(`/store/addTags/${forkedMap._id}`).set("Cookie", cookies).send({
                tag: "Alabama"
            });
            expect(response.status).toBe(200);
            expect(response.body.message).toEqual("Map project tag updated");
        });
        it("should fail to add duplicate tags", async() => {
            const response = await agent.put(`/store/addTags/${forkedMap._id}`).set("Cookie", cookies).send({
                tag: "Alabama"
            });
            expect(response.status).toBe(400);
            expect(response.body.message).toEqual("Duplicate Tag");
        });
    });
    describe("Deleting Tags to forked map", () => {
        it("should successfully add the tag", async() => {
            const response = await agent.put(`/store/deleteTags/${forkedMap._id}`).set("Cookie", cookies).send({
                tag: "Alabama"
            });
            expect(response.status).toBe(200);
            expect(response.body.message).toEqual("Map project tag updated");
        });
    });
    describe("Collaborators", () => {
        it("is adding a nonexisting email", async() => {
            const response = await agent.put(`/store/addCollaborators/${forkedMap._id}`).set("Cookie", cookies).send({
                collaboratorEmail: "Testing12345678@gmail.com"
            });
            expect(response.status).toBe(400);
            expect(response.body.error).toEqual("Unable to add collaborator");
        });
        it("is adding a existing email", async() => {
            const response = await agent.put(`/store/addCollaborators/${forkedMap._id}`).set("Cookie", cookies).send({
                collaboratorEmail: "arvin.wang@stonybrook.edu"
            });
            expect(response.status).toBe(200);
            expect(response.body.message).toEqual("Collaborator added");
        });
        it("is adding a duplicate existing email", async() => {
            const response = await agent.put(`/store/addCollaborators/${forkedMap._id}`).set("Cookie", cookies).send({
                collaboratorEmail: "arvin.wang@stonybrook.edu"
            });
            expect(response.status).toBe(400);
            expect(response.body.error).toEqual("Collaborator already added");
        });
        it("is deleting a nonexisting collaborator", async() => {
            const response = await agent.put(`/store/removeCollaborators/${forkedMap._id}`).set("Cookie", cookies).send();
            expect(response.status).toBe(400);
            expect(response.body.error).toEqual("You must provide a collaborator to remove");
        });
        it("is deleting a nonexisting collaborator", async() => {
            const response = await agent.put(`/store/removeCollaborators/${forkedMap._id}`).set("Cookie", cookies).send({
                collaboratorEmail: "Testing12345678@gmail.com"
            });
            expect(response.status).toBe(400);
            expect(response.body.error).toEqual("Unable to remove collaborator");
        });
        it("is removing a collaborator", async() => {
            const response = await agent.put(`/store/removeCollaborators/${forkedMap._id}`).set("Cookie", cookies).send({
                collaboratorEmail: "arvin.wang@stonybrook.edu"
            });
            expect(response.status).toBe(200);
            expect(response.body.message).toEqual("Collaborator removed");
        });
    });
    describe("Testing voting system", () => { // VoteType: Determines which vote, value: To add or remove the vote
        it("update upvote", async() => {
            const response = await agent.put(`/store/updateVote/${forkedMap._id}`).set("Cookie", cookies).send({
                userId: user._id,
                voteType: 1,
                value: 1
            });
            expect(response.status).toBe(200);
            expect(response.body.message).toEqual("Map project voting updated");
        });
        it("update downvote", async() => {
            const response = await agent.put(`/store/updateVote/${forkedMap._id}`).set("Cookie", cookies).send({
                userId: user._id,
                voteType: 0,
                value: 1
            });
            expect(response.status).toBe(200);
            expect(response.body.message).toEqual("Map project voting updated");
        });
        it("Removes downvote", async() => {
            const response = await agent.put(`/store/updateVote/${forkedMap._id}`).set("Cookie", cookies).send({
                userId: user._id,
                voteType: 0,
                value: 0
            });
            expect(response.status).toBe(200);
            expect(response.body.message).toEqual("Map project voting updated");
        });
    });
    describe("Testing out comment functionality", () => {
        it("should get userID", async() => {
            const response = await agent.get(`/store/user/${userId}`).set("Cookie", cookies);
            expect(response.status).toBe(200);
            expect(response.body.user).toBeDefined();
            console.log(response.body.user)
            // userId = response.body.user._id
        })
        it("should fail to add comments", async() => {
            const response = await agent.get(`/store/comment/${forkedMap._id}`).set("Cookie", cookies);
            expect(response.status).toBe(200);
            expect(response.body.comments).toBeDefined()
        });
        it("should fail to add comments", async() => {
            const response = await agent.post(`/store/comment/${forkedMap._id}`).set("Cookie", cookies).send({
                userId: user._id
            });
            expect(response.status).toBe(400);
            expect(response.body.error).toEqual("You must provide a comment to input");
        });
        it("should successfully add comment", async() => {
            const response = await agent.post(`/store/comment/${forkedMap._id}`).set("Cookie", cookies).send({
                userId: user._id,
                comment: "Great Map"
            });
            expect(response.status).toBe(201);
            expect(response.body.comment).toBeDefined();
        });
    });
});

describe("Cleaning up database", () => {
    describe("Deleting maps created", () => {
        it("should clean up testing map", async () => {
            const response = await agent.delete(`/store/delete/${map._id}`).set("Cookie", cookies);
            expect(response.status).toBe(200);
        })
        it("should clean up forked map", async () => {
            const response = await agent.delete(`/store/delete/${forkedMap._id}`).set("Cookie", cookies);
            expect(response.status).toBe(200);
        })
    })
    describe("Cleaning up data", () => {
        it("Should clean up testing user", async () => {
            const response = await request(app).post("/auth/deleteUser").send({
                email: "JohnSmith6969@gmail.com",
            })
            expect(response.status).toEqual(200)
        });
    });
});