const { getRandomUser } = require("../utils/data");

// Import packages for testing a rest api
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

describe('POST /api/users', () => {
    it('should return all users', async() => {
        const usersBefore = await apiClient.get('/users').then((res) => res.data);
        const addedUsers1 = await apiClient.post('/users', userData[0]).then((res) => res.data);
        const addedUsers2 = await apiClient.post('/users', userData[1]).then((res) => res.data);
        userData[0]._id = addedUsers1.user._id;
        userData[1]._id = addedUsers2.user._id;
        const usersAfter = await apiClient.get('/users').then((res) => res.data);
        expect(usersAfter.users).toStrictEqual([...usersBefore.users, ...userData]);
    });
    
    it('should return errors in the correct cases', async() => {
        const userExistsResponse = await apiClient.post('/users', userData).catch((err) => err.response);
        expect(userExistsResponse.status).toBe(400); // User already exists
        
        const usernameMissingResponse = await apiClient.post('/users', {email: getRandomUser().email}).catch((err) => err.response);
        expect(usernameMissingResponse.status).toBe(400);
        expect(usernameMissingResponse.data.message).toBe('user validation failed: username: Path `username` is required.'); // Username was not provided
        
        const emailMissingResponse = await apiClient.post('/users', {username: getRandomUser().username}).catch((err) => err.response);
        expect(emailMissingResponse.status).toBe(400);
        expect(emailMissingResponse.data.message).toBe('user validation failed: email: Path `email` is required.'); // Email was not provided
        
        const bothMissingResponse = await apiClient.post('/users', {}).catch((err) => err.response);
        expect(bothMissingResponse.status).toBe(400);
        expect(bothMissingResponse.data.message).toBe('user validation failed: email: Path `email` is required., username: Path `username` is required.'); 
    });
});

describe('GET /api/users', () => {
    it('should return all users', async() => {
        const users = await apiClient.get('/users').then((res) => res.data);
        expect(users.users).toBeInstanceOf(Array);
        expect(users.users).toContainEqual(userData[0]);
    });
    
    it('should return a single user', async() => {
        const {user} = await apiClient.get(`/users`, {params: {userId: userData[0]._id}}).then((res) => res.data);
        expect(user).toBeInstanceOf(Object);
        expect(user).toHaveProperty('username');
        expect(user).toHaveProperty('email');
        expect(user).toHaveProperty('thoughts');
        expect(user).toHaveProperty('friends');
    });
    
    it('should return an error if the user does not exist', async() => {
        const res = await apiClient.get(`/users`, {params: {userId: `${userData[0]._id.slice(0, -3)}fff`}}).catch((err) => err.response);
        expect(res.status).toBe(404);
        expect(res.data.message).toBe('No user found with that ID :(');
    });
});

describe('PUT /api/users', () => {
    it('should update a user', async() => {
        const updatedValues = getRandomUser();
        await apiClient.put(`/users?userId=${userData[0]._id}`, updatedValues).then((res) => res.data);
        const {user: updatedUserAfter} = await apiClient.get(`/users`, {params: {userId: userData[0]._id}}).then((res) => res.data);
        expect(updatedUserAfter.username).toBe(updatedValues.username);
        expect(updatedUserAfter.email).toBe(updatedValues.email);
    });
    
    it('should return an error if the user does not exist', async() => {
        const res = await apiClient.put(`/users?userId=${userData[0]._id.slice(0, -3)}fff`, {username: 'newUsername', email: 'newEmail'}).catch((err) => err.response);
        expect(res.status).toBe(404);
    });
});

describe('POST /api/users/:userId/friends', () => {
    it('should add a friend to a user', async() => {
        await apiClient.post(`/users/${userData[0]._id}/friends?friendId=${userData[1]._id}`);
        const {user} = await apiClient.get(`/users`, {params: {userId: userData[0]._id}}).then((res) => res.data);
        expect(user.friends).toContain(userData[1]._id);
        const {user: friendAfter} = await apiClient.get(`/users`, {params: {userId: userData[1]._id}}).then((res) => res.data);
        expect(friendAfter.friends).toContain(userData[0]._id);
    });
    
    it('should return an error if the user does not exist', async() => {
        const res = await apiClient.post(`/users/${userData[0]._id.slice(0, -3)}fff/friends?friendId=${userData[0]._id}`).catch((err) => err.response);
        expect(res.status).toBe(404);
    });
    
    it('should return an error if the friend does not exist', async() => {
        const res = await apiClient.post(`/users/${userData[0]._id}/friends?friendId=${userData[0]._id.slice(0, -3)}fff`).catch((err) => err.response);
        expect(res.status).toBe(404);
    });
});

describe('DELETE /api/users/:userId/friends', () => {
    it('should remove a friend from a user', async() => {
        await apiClient.delete(`/users/${userData[0]._id}/friends?friendId=${userData[1]._id}`);
        const {user} = await apiClient.get(`/users`, {params: {userId: userData[0]._id}}).then((res) => res.data);
        expect(user.friends).not.toContain(userData[1]._id);
        const {user: friendAfter} = await apiClient.get(`/users`, {params: {userId: userData[1]._id}}).then((res) => res.data);
        expect(friendAfter.friends).not.toContain(userData[0]._id);
    });
    
    it('should return errors in the correct cases', async() => {
        const userNotExistResponse = await apiClient.delete(`/users/${userData[0]._id.slice(0, -3)}fff/friends?friendId=${userData[0]._id}`).catch((err) => err.response);
        expect(userNotExistResponse.status).toBe(404);
        
        const friendNotExistResponse = await apiClient.delete(`/users/${userData[0]._id}/friends?friendId=${userData[0]._id.slice(0, -3)}fff`).catch((err) => err.response);
        expect(friendNotExistResponse.status).toBe(404);
        
        const notAFriendResponse = await apiClient.delete(`/users/${userData[0]._id}/friends?friendId=${userData[1]._id}`).catch((err) => err.response);
        expect(notAFriendResponse.status).toBe(404);
    });
});

describe('DELETE /api/users', () => {
    it('should delete a user', async() => {
        const usersBefore = await apiClient.get('/users').then((res) => res.data);
        await apiClient.delete(`/users?userId=${userData[0]._id}`).then((res) => res.data);
        const usersAfter = await apiClient.get('/users').then((res) => res.data);
        expect(usersAfter.users).toHaveLength(usersBefore.users.length - 1);
    });
    
    it('should return an error if the user does not exist', async() => {
        const res = await apiClient.delete(`/users?userId=${userData[0]._id.slice(0, -3)}fff`).catch((err) => err.response);
        expect(res.status).toBe(404);
    });
});
