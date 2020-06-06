conn = new Mongo("custom-built-mongodb");

db = conn.getDB("auth_jwt_prod")

names = db.getCollectionNames();

if (!names.find(n => n === "users")) {
    db.createCollection("users", {
        validator: {
            $jsonSchema: {
                "bsonType": "object",
                "required": ["username", "password", "isAdmin", "isVerified", "confirmCode", "flag"],
                "properties": {
                    "username": {
                        "bsonType": "string"
                    },
                    "password": {
                        "bsonType": "string"
                    },
                    "isAdmin": {
                        "bsonType": "bool"
                    },
                    "isVerified": {
                        "bsonType": "bool"
                    },
                    "confirmCode": {
                        "bsonType": "string"
                    },
                    "flag": {
                        "bsonType": "string"
                    }
                }
            }
        },
        validationAction: "error"
    });

    db.users.createIndex({username: 1});
}