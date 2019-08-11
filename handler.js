const mongoose = require("mongoose");
const Promise = require("bluebird");
const validator = require("validator");
const UserModel = require("./model/User.js");

mongoose.Promise = Promise;

const mongoString = ""; // MongoDB Url

const createErrorResponse = (statusCode, message) => ({
  statusCode: statusCode || 501,
  headers: { "Content-Type": "text/plain" },
  body: message || "Incorrect id"
});

const dbExecute = (db, fn) => db.then(fn).finally(() => db.close());

function dbConnectAndExecute(dbUrl, fn) {
  return dbExecute(mongoose.connect(dbUrl, { useMongoClient: true }), fn);
}

module.exports.findUser = (event, context, callback) => {
  if (!validator.isEmail(event.pathParameters.email)) {
    callback(null, createErrorResponse(400, "Invalid Email"));
    return;
  }
  var email = event.pathParameters.email;
  dbConnectAndExecute(mongoString, () =>
    UserModel.find({ email: email })
      .then(user => {
        callback(null, {
          statusCode: 200,
          body: JSON.stringify(user)
        });
      })
      .catch(err =>
        callback(null, createErrorResponse(err.statusCode, err.message))
      )
  );
};

module.exports.addUser = (event, context, callback) => {
  const data = JSON.parse(event.body);

  const user = new UserModel({
    email: data.email
  });

  if (user.validateSync()) {
    callback(null, createErrorResponse(400, "Incorrect user data"));
    return;
  }

  dbConnectAndExecute(mongoString, () =>
    user
      .save()
      .then(() =>
        callback(null, {
          statusCode: 200,
          body: JSON.stringify({ email: user.email })
        })
      )
      .catch(err =>
        callback(null, createErrorResponse(err.statusCode, err.message))
      )
  );
};

module.exports.deleteUser = (event, context, callback) => {
  if (!validator.isEmail(event.pathParameters.email)) {
    callback(null, createErrorResponse(400, "Invalid Email"));
    return;
  }

  dbConnectAndExecute(mongoString, () =>
    UserModel.remove({ email: event.pathParameters.email })
      .then(() =>
        callback(null, { statusCode: 200, body: JSON.stringify("Deleted") })
      )
      .catch(err =>
        callback(null, createErrorResponse(err.statusCode, err.message))
      )
  );
};
