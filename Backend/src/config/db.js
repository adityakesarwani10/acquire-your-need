const mongoose = require('mongoose');
const dotenv = require('dotenv');
const { DB_NAME } = require('../../constraints.js');

dotenv.config();

const connectDB = async () => {
    try {
        const connection = await mongoose.connect(`${process.env.MONGODB_URI}`);
        console.log(`Database connected successfully: ${connection.connection.host}`);        
    }
    catch(error) {
        console.error("Can't connect to database", error)
        throw error
    }
}

module.exports = connectDB;