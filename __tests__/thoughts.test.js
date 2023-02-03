const {getRandomUser} = require("../utils/data");

const axios = require('axios');

const apiClient = axios.create({
    baseURL: 'http://localhost:3001/api',
    timeout: 1000,
});

const user = getRandomUser();
const user2 = getRandomUser();

const userData = [
    {
        username: user.username,
        email: user.email,
        thoughts: [],
        friends: [],
        _id: undefined
    },
    {
        username: user2.username,
        email: user2.email,
        thoughts: [],
        friends: [],
        _id: undefined
    }
];

const thoughtData = [
    {
        thoughtText: 'This is a test thought',
        createdAt: new Date().toISOString(),
        reactions: [],
        username: undefined,
        _id: undefined,
        userId: undefined
    },
    {
        thoughtText: 'This is another test thought',
        createdAt: new Date().toISOString(),
        reactions: [],
        username: undefined,
        _id: undefined,
        userId: undefined
    }
]

describe('POST /api/thoughts', () => {
    it('should return all thoughts', async() => {
        const addedUsers1 = await apiClient.post('/users', userData[0]).then((res) => res.data);
        const addedUsers2 = await apiClient.post('/users', userData[1]).then((res) => res.data);
        userData[0]._id = addedUsers1.user._id;
        userData[1]._id = addedUsers2.user._id;

        thoughtData[0].username = userData[0].username;
        thoughtData[1].username = userData[1].username;

        thoughtData[0].userId = userData[0]._id;
        thoughtData[1].userId = userData[1]._id;

        const thoughtsBefore = await apiClient.get('/thoughts').then((res) => res.data);
        const addedThoughts1 = await apiClient.post('/thoughts', thoughtData[0]).then((res) => res.data);
        const addedThoughts2 = await apiClient.post('/thoughts', thoughtData[1]).then((res) => res.data);

        delete thoughtData[0].userId;
        delete thoughtData[1].userId;

        thoughtData[0]._id = addedThoughts1.thought._id;
        thoughtData[1]._id = addedThoughts2.thought._id;

        const thoughtsAfter = await apiClient.get('/thoughts').then((res) => res.data);
        expect(thoughtsAfter.thoughts).toStrictEqual([...thoughtsBefore.thoughts, ...thoughtData]);

        const user1 = await apiClient.get(`/users?userId=${userData[0]._id}`).then((res) => res.data);
        expect(user1.user.thoughts).toContain(thoughtData[0]._id);

    });
});

describe('GET /api/thoughts', () => {
    it('should return all thoughts', async() => {
        const thoughts = await apiClient.get('/thoughts').then((res) => res.data);
        expect(thoughts.thoughts).toBeInstanceOf(Array);
    });

    it('should return a single thought', async() => {
        const thought = await apiClient.get(`/thoughts?thoughtId=${thoughtData[0]._id}`).then((res) => res.data);
        expect(thought.thought).toStrictEqual(thoughtData[0]);
    });
});

describe('PUT /api/thoughts', () => {
    it('should update a thought', async() => {
        const thoughtBefore = await apiClient.get(`/thoughts?thoughtId=${thoughtData[0]._id}`).then((res) => res.data);
        await apiClient.put(`/thoughts?thoughtId=${thoughtData[0]._id}`, {thoughtText: 'This is an updated thought'}).then((res) => res.data);
        const thoughtAfter = await apiClient.get(`/thoughts?thoughtId=${thoughtData[0]._id}`).then((res) => res.data);
        expect(thoughtBefore.thought.thoughtText).toBe(thoughtData[0].thoughtText);
        expect(thoughtAfter.thought.thoughtText).toBe('This is an updated thought');
    });

    it('should return an error if the thought does not exist', async() => {
        const updatedThought = await apiClient.put(`/thoughts?thoughtId=${thoughtData[0]._id.slice(0, -3)}fff`, {thoughtText: 'This is an updated thought'}).catch((res) => res.response);
        expect(updatedThought.data.message).toBe('No thought with that ID :(');
    });        
});

describe('POST /api/thoughts/:thoughtId/reactions', () => {
    it('should add a reaction to a thought', async() => {
        const reactionData = {
            reactionBody: 'This is a test reaction',
            username: userData[0].username,
            createdAt: new Date().toISOString()
        }

        await apiClient.post(`/thoughts/${thoughtData[0]._id}/reactions`, reactionData).then((res) => res.data);
        const thoughtAfter = await apiClient.get(`/thoughts?thoughtId=${thoughtData[0]._id}`).then((res) => res.data);
        const addedReaction = thoughtAfter.thought.reactions[0];
        expect(thoughtAfter.thought.reactions).toStrictEqual([{...reactionData, reactionId: addedReaction.reactionId}]);
    });

    it('should return an error if the thought does not exist', async() => {
        const reactionData = {
            reactionBody: 'This is a test reaction',
            username: userData[0].username,
            createdAt: new Date().toISOString()
        }
        const addedReaction = await apiClient.post(`/thoughts/${thoughtData[0]._id.slice(0, -3)}fff/reactions`, reactionData).catch((res) => res.response);
        expect(addedReaction.data.message).toBe('No thought with that ID :(');
    });
});

describe('DELETE /api/thoughts/:thoughtId/reactions', () => {

    it('should return an error if the thought does not exist', async() => {
        const reactionData = {
            reactionBody: 'This is a test reaction',
            username: userData[0].username
        }
        const addedReaction = await apiClient.post(`/thoughts/${thoughtData[0]._id}/reactions`, reactionData).then((res) => res.data);
        const thoughtBefore = await apiClient.get(`/thoughts?thoughtId=${thoughtData[0]._id}`).then((res) => res.data);
        const deletedReaction = await apiClient.delete(`/thoughts/${thoughtData[0]._id.slice(0, -3)}fff/reactions?reactionId=${thoughtBefore.thought.reactions[0].reactionId}`).catch((res) => res.response);
        expect(deletedReaction.data.message).toBe('No thought with that ID :(');
    });

    it('should delete a reaction from a thought', async() => {
        const reactionData = {
            reactionBody: 'This is a test reaction',
            username: userData[0].username
        }
        const addedReaction = await apiClient.post(`/thoughts/${thoughtData[0]._id}/reactions`, reactionData).then((res) => res.data);
        const thoughtBefore = await apiClient.get(`/thoughts?thoughtId=${thoughtData[0]._id}`).then((res) => res.data);
        await apiClient.delete(`/thoughts/${thoughtData[0]._id}/reactions?reactionId=${thoughtBefore.thought.reactions[0].reactionId}`);
        const thoughAfter = await apiClient.get(`/thoughts?thoughtId=${thoughtData[0]._id}`).then((res) => res.data);
        expect(thoughAfter.thought.reactions).not.toContainEqual(reactionData);
    });


});

describe('DELETE /api/thoughts', () => {
    it('should delete a thought', async() => {
        // const userThoughtsBefore = await apiClient.get(`/users?userId=${userData[0]._id}`).then((res) => res.data);
        const deletedThought = await apiClient.delete(`/thoughts?thoughtId=${thoughtData[0]._id}`).then((res) => res.data);
        const userThoughtsAfter = await apiClient.get(`/users?userId=${userData[0]._id}`).then((res) => res.data);
        expect(userThoughtsAfter.user.thoughts).not.toContain(thoughtData[0]._id);
    });

    it('should return an error if the thought does not exist', async() => {
        const deletedThought = await apiClient.delete(`/thoughts?thoughtId=${thoughtData[0]._id.slice(0, -3)}fff`).catch((res) => res.response);
        expect(deletedThought.data.message).toBe('No thought with that ID :(');
    });        
});
