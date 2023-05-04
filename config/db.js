const mongoose = require("mongoose");
mongoose.set('strictQuery', true);

//db connection
const InitiateMongoServer = async () => {
    try {
      await mongoose.connect(process.env.MONGODB_URI, {
        useNewUrlParser: true,
      });
      console.log("Connected to Database Successfully");
    } catch (e) {
      console.log(e);
      throw e;
    }
  };
  

module.exports = InitiateMongoServer;