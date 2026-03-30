require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

const makeAdmin = async () => {
  try {
    console.log("Connecting to MongoDB Database...");
    await mongoose.connect(process.env.MONGO_URI);
    
    // Automatically find the FIRST user in the database (which you just created) and forcibly upgrade them to 'admin'
    const user = await User.findOneAndUpdate({}, { role: 'admin' }, { new: true });
    
    if (user) {
      console.log(`✅ Success! Upgraded ${user.email} into an Administrator!`);
    } else {
      console.log(`❌ Fail: Could not find any users. Did you register an account on the website first?`);
    }
    
    // Close the database connection
    process.exit();
  } catch (error) {
    console.error("Database Error:", error);
    process.exit(1);
  }
};

makeAdmin();
