export const users = [];

export const addUser = (email, password) => {
    users.push({ email, password });
};

export const findUser = (email) => {
    return users.find(user => user.email === email);
};

export const validateUser = (email, password) => {
    const user = findUser(email);
    return user && user.password === password;
};
