const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();

const cloudFunctions = {
    // Write function references
    users: './src/users',
    switchDuty: './src/switchDuty',

    createUser: './src/createUser',
    updateUser: './src/updateUser',
    deleteUser: './src/deleteUser',

    onCreateUserInAuthentication: './src/onCreateUserInAuthentication',
    onDeleteUserInAuthentication: './src/onDeleteUserInAuthentication',

    onCreateUser: './src/onCreateUser',
    onCreatedepartment: './src/onCreatedepartment',

    onCreateNext: './src/onCreateNext',
    onUpdateNext: './src/onUpdateNext',
    onDeleteNext: './src/onDeleteNext',

    onCreateCurrent: './src/onCreateCurrent',
    onUpdateCurrent: './src/onUpdateCurrent',
    onDeleteCurrent: './src/onDeleteCurrent',

    onCreateCurrentRequest: './src/onCreateCurrentRequest',
    onUpdateCurrentRequest: './src/onUpdateCurrentRequest',

    onCreateNextRequest: './src/onCreateNextRequest',
    onUpdateNextRequest: './src/onUpdateNextRequest',

    onWriteHistory: './src/onWriteHistory',

    onCreateChangedFlag: './src/onCreateChangedFlag'
};

loadFunctions = (functions) => {
    for (let name in functions) {
        if (!process.env.FUNCTION_NAME || process.env.FUNCTION_NAME === name) {
            if(functions.hasOwnProperty(name)){
                exports[name] = require(functions[name]);
            }
        }
    }
};

loadFunctions(cloudFunctions);
