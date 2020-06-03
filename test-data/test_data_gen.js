require('dotenv').config();

const bcrypt = require('bcrypt');

module.exports.genTestData = function(saltRounds, testData) {
    let data = {
        "verifiedUsers": {
            "standard": [],
            "admin": []
        },
        "nonVerifiedUsers": {
            "standard": [],
            "admin": []
        }
    };
    data.saltRounds = saltRounds;
    testData.verifiedUsers.standard.forEach(usr => {
        let hash = bcrypt.hashSync(usr.username, saltRounds);
        data.verifiedUsers.standard.push({
            ...usr,
            password: hash
        });
    });
    testData.verifiedUsers.admin.forEach(usr => {
        let hash = bcrypt.hashSync(usr.username, saltRounds);
        data.verifiedUsers.admin.push({
            ...usr,
            password: hash
        });
    });

    testData.nonVerifiedUsers.standard.forEach(usr => {
        let hash = bcrypt.hashSync(usr.username, saltRounds);
        data.nonVerifiedUsers.standard.push({
            ...usr,
            password: hash
        });
    });
    testData.nonVerifiedUsers.admin.forEach(usr => {
        let hash = bcrypt.hashSync(usr.username, saltRounds);
        data.nonVerifiedUsers.admin.push({
            ...usr,
            password: hash
        });
    });

    return data;
}