const auth = require("../auth");
const User = require("../models/user-model");
const MapProject = require("../models/mapproject-model");
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
const crypto = require("crypto");

const transporter = nodemailer.createTransport({
  host: "smtp-relay.sendinblue.com",
  port: 587,
  auth: {
    user: process.env.SMTP_EMAIL,
    pass: process.env.SMTP_KEY,
  },
  tls: {
    rejectUnauthorized: false
  },
});

getLoggedIn = async (req, res) => {
  try {
    let userId = auth.verifyUser(req);
    if (!userId) {
      return res.status(200).json({
        loggedIn: false,
        user: null,
        errorMessage: "?",
      });
    }

    const loggedInUser = await User.findOne({ _id: userId });
    // console.log("loggedInUser: " + loggedInUser);

    return res.status(200).json({
      loggedIn: true,
      user: {
        userName: loggedInUser.userName,
        email: loggedInUser.email,
        _id: loggedInUser._id
      },
    });
  } catch (err) {
    // console.log("err: " + err);
    res.json(false);
  }
};

loginUser = async (req, res) => {
  // console.log("loginUser");
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ errorMessage: "Please enter all required fields." });
    }

    const existingUser = await User.findOne({ email: email });
    // console.log("existingUser: " + existingUser);
    if (!existingUser) {
      return res.status(401).json({
        errorMessage: "Wrong email or password provided.",
      });
    }

    // console.log("provided password: " + password);
    const passwordCorrect = await bcrypt.compare(
      password,
      existingUser.passwordHash
    );
    if (!passwordCorrect) {
      // console.log("Incorrect password");
      return res.status(401).json({
        errorMessage: "Wrong email or password provided.",
      });
    }

    // LOGIN THE USER
    const token = auth.signToken(existingUser._id);
    // console.log(token);

    req.session.token = token;
    

    res.status(200).json({
      success: true,
      user: {
        userName: existingUser.userName,
        email: existingUser.email,
        _id: existingUser._id
      },
    });

  } catch (err) {
    console.error(err);
    res.status(500).send();
  }
};

logoutUser = async (req, res) => {
  req.session.destroy();
  res.status(200).send();
};

//Function only meant for testing purposes
deleteUser = async(req, res) => {
  try{
    const {email} = req.body

    const deleted = await User.deleteOne({email: email})
    if(deleted){
      return res.status(200).json({
        success: true
      })
    } else {
      return res.status(400).json({
        success: false
      })
    }
  }catch(err){
    console.error(err);
    res.status(500).send();
  }
}

registerUser = async (req, res) => {
  try {
    const { userName, email, password, passwordVerify } = req.body;
    // console.log("create user: " + userName + firstName + " " + lastName + " " + email + " " + password + " " + passwordVerify);
    if (!userName || !email || !password || !passwordVerify) {
      return res
        .status(400)
        .json({ errorMessage: "Please enter all required fields." });
    }
    // console.log("all fields provided");
    if (password.length < 8) {
      return res.status(400).json({
        errorMessage: "Please enter a password of at least 8 characters.",
      });
    }
    // console.log("password long enough");
    if (password !== passwordVerify) {
      return res.status(400).json({
        errorMessage: "Please enter the same password twice.",
      });
    }
    // console.log("password and password verify match");
    const existingUser = await User.findOne({ email: email });
    // console.log("existingUser: " + existingUser);
    if (existingUser) {
      return res.status(400).json({
        success: false,
        errorMessage: "An account with this email address already exists.",
      });
    }

    const existingUser2 = await User.findOne({ userName: userName });
    // console.log("existingUser: " + existingUser2);
    if (existingUser2) {
      return res.status(400).json({
        success: false,
        errorMessage: "An account with this username already exists.",
      });
    }

    const saltRounds = 10;
    const salt = await bcrypt.genSalt(saltRounds);
    const passwordHash = await bcrypt.hash(password, salt);
    // console.log("passwordHash: " + passwordHash);

    const newUser = new User({
      userName: userName,
      email: email,
      passwordHash: passwordHash,
      personalMaps: [],
      sharedMaps: []
    });
    
    await newUser.save();

    res.status(200).json({
      success: true
    });
  } catch (err) {
    console.error(err);
    res.status(500).send();
  }
};

//Sending password recovery email
recoveryEmail = async(req, res) => {
  try {
    let message_body = ""
    const {email} = req.body
    const user = await User.findOne({email: email})
    if(!user) {
      return res.status(400).json({
        errorMessage: "Account doesn't exist",
      });
    }
    const token = crypto.randomBytes(32).toString("hex");
    const saltRounds = 10;
    const salt = await bcrypt.genSalt(saltRounds);
    const resetToken = await bcrypt.hash(token, salt);
    const update = await User.updateOne({email: email}, {passwordToken: resetToken, passwordTimeout: Date.now() + 600000})
    if (process.env.ENVIRONMENT === "DEVELOPMENT") {
      message_body = process.env.DEV_CORS + "/recover?userName=" + encodeURIComponent(user.userName) + "&token=" + encodeURIComponent(resetToken);
      // message_body = process.env.DEV_CORS + "/recover?userName=" + encodeURIComponent("Hello") + "&token=" + encodeURIComponent(resetToken);
      //Testing purposes: we don't need to send out the email for when we are using JEST
      // const message = await transporter.sendMail({
      //   from: process.env.SMTP_SENDEMAIL,
      //   to: email,
      //   subject: "Password Reset Notice", 
      //   text: message_body,
      // })
      
      return res.status(200).json({
        success: true,
        userName: user.userName,
        resetToken: resetToken
      })
    } else {
      message_body = process.env.PROD_CORS + "/recover?userName=" + encodeURIComponent(user.userName) + "&token=" + encodeURIComponent(resetToken);
      // message_body = process.env.PROD_CORS + "/recover?userName=" + encodeURIComponent("Hello") + "&token=" + encodeURIComponent(resetToken);
      const message = await transporter.sendMail({
        from: process.env.SMTP_SENDEMAIL,
        to: email,
        subject: "Password Reset Notice", 
        text: message_body,
      })
      
      return res.status(200).json({
        success: true
      })
    }
  } catch(err) {
    return res.status(401).json({
      errorMessage: "Unable to send email",
    });
  }
}

//Resetting password + Use for both recovering password 
recoverPassword = async(req, res) => {
  // Todo: Finding the account information via token on the URL then reset the password
  // If the token expired then they would have to request another password reset
  // Extract the password expiration time and check it with the current time to see if it already expired
  
  try {
    const {userName, token, password, passwordVerify} = req.body
    const search_by_username = await User.findOne({userName: userName})
    const search_by_token = await User.findOne({passwordToken: token})
    if(!search_by_token || !search_by_username){
      //console.log("Doesn't Exist")
      return res.status(400).json({
        errorMessage: "Invalid token/Username",
      });
    }
    if(search_by_token.email !== search_by_username.email){
      //console.log("Wrong token or username")
      return res.status(400).json({
        errorMessage: "Invalid Token and username",
      });
    }
    if (Date.now() > search_by_token.passwordTimeout){
      //console.log("Expired Token")
      return res.status(400).json({
        errorMessage: "Token has expired ",
      });
    }
    if (password.length < 8) {
      //console.log("Password length not greater than 8")
      return res.status(400).json({
        errorMessage: "Please enter a password of at least 8 characters.",
      });
    }
    if (password !== passwordVerify) {
      //console.log("Password is not the same as password verified")
      return res.status(400).json({
        errorMessage: "Please enter the same password twice.",
      });
    }

    const saltRounds = 10;
    const salt = await bcrypt.genSalt(saltRounds);
    const passwordHash = await bcrypt.hash(password, salt);

    // const deleted = await User.deleteOne({userName: userName})

    // const newUser = new User({
    //   userName: search_by_username.userName,
    //   email: search_by_username.email,
    //   passwordHash: passwordHash,
    //   personalMaps: search_by_username.personalMaps,
    //   sharedMaps: search_by_username.sharedMaps
    // });
    // const savedUser = await newUser.save();
    
    const savedUser = await User.updateOne({ userName: userName }, { passwordHash: passwordHash }, {new : true});
    if(savedUser){
      return res.status(200).json({
        success: true
      })
    } else {
      //console.error("Failed Update");
      res.status(500).send();
    }
  }catch (err) {
    //console.error(err);
    res.status(500).send();
  }

}

//Changing username on profile screen
changeUsername = async (req, res) => {
  try {
    const { email, userName } = req.body;
    if (!email || !userName) {
      return res
        .status(400)
        .json({ errorMessage: "Please enter all required fields." });
    }

    const existingEmail = await User.findOne({ email: email });
    if (!existingEmail) {
      return res.status(400).json({
        errorMessage: "Wrong email provided.",
      });
    }

    const existingUser = await User.findOne({ userName : userName });
    if (existingUser) {
      return res.status(400).json({
        errorMessage: "An account with this username already exists.",
      });
    }

    const newUser = await User.findOneAndUpdate({ email: email }, {userName: userName}, {new : true});

    const asyncMapProjects = [];
    for(const mapId of newUser.personalMaps){
      asyncMapProjects.push(MapProject.findOneAndUpdate({ _id: mapId }, { ownerName: userName }));
    }

    await Promise.all(asyncMapProjects);

    return res.status(200).json({
      success: true,
      user: {
        userName: newUser.userName,
        email: newUser.email,
        _id: newUser._id
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).send();
  }
}

//Changing password on profile screen
changePassword = async (req, res) => {
  try {
    const { email, oldPwd, newPwd, cfmPwd } = req.body;
    //console.log(email, oldPwd, newPwd, cfmPwd);
    if (!email || !oldPwd || !newPwd || !cfmPwd) {
      return res
        .status(400)
        .json({ errorMessage: "Please enter all required fields." });
    }
    // console.log("all fields provided");
    
    const existingUser = await User.findOne({ email: email });
    // console.log("existingUser: " + existingUser);
    if (!existingUser) {
      return res.status(401).json({
        errorMessage: "Wrong email or password provided.",
      });
    }

    const passwordCorrect = await bcrypt.compare(
      oldPwd,
      existingUser.passwordHash
    );
    if (!passwordCorrect) {
      // console.log("Incorrect password");
      return res.status(401).json({
        errorMessage: "Wrong email or password provided.",
      });
    }

    if (oldPwd === newPwd) {
      // console.log("Incorrect password");
      return res.status(400).json({
        errorMessage: "Please enter a different password from your old password.",
      });
    }

    if (newPwd.length < 8) {
      return res.status(400).json({
        errorMessage: "Please enter a password of at least 8 characters.",
      });
    }
    // console.log("password long enough");

    if (newPwd !== cfmPwd) {
      return res.status(400).json({
        errorMessage: "Please enter the same password twice.",
      });
    }
    // console.log("password and password verify match");

    const saltRounds = 10;
    const salt = await bcrypt.genSalt(saltRounds);
    const passwordHash = await bcrypt.hash(newPwd, salt);
    // console.log("passwordHash: " + passwordHash);

    const updated = await User.updateOne({ email: email }, { passwordHash: passwordHash });

    // req.session.token = token;

    res.status(200).json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).send();
  }
  // return res.status(200).json({
  //   success: true
  // })
}

module.exports = {
  getLoggedIn,
  registerUser,
  loginUser,
  logoutUser,
  recoveryEmail,
  recoverPassword,
  changeUsername,
  changePassword,
  deleteUser,
};
