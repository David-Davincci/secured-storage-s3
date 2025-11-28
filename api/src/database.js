import { MongoClient } from "mongodb";

const url = process.env.DB_URL || "mongodb://localhost:27017/fileapp";

export const connect = (callback) => {
  MongoClient.connect(url, (err, db) => {
    return callback(err, db);
  });
};
