export const users = [];

export const addUser = (username, password) => {
    users.push({ username, password });
};

export const findUser = (username) => {
    return users.find(user => user.username === username);
};

export const validateUser = (username, password) => {
    const user = findUser(username);
    return user && user.password === password;
};
