const auth = require("../auth");
const User = require("../models/user-model");
const bcrypt = require("bcryptjs");

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
    const savedUser = await newUser.save();
    // console.log("new user saved: " + savedUser._id);

    // LOGIN THE USER
    const token = auth.signToken(savedUser._id);
    // // console.log("token:" + token);

    req.session.token = token;

    res.status(200).json({
      success: true,
      user: {
        userName: existingUser.userName,
        email: existingUser.email,
        _id: existingUser._id
      },
    });

    // console.log("token sent");
  } catch (err) {
    console.error(err);
    res.status(500).send();
  }
};

//Sending password recovery email
recoveryEmail = async(req, res) => {
  //Todo: Sending email via nodemailer and need to install postmail on backend server
  return res.status(200).json({
    success: true
  })
}

//Resetting password + Use for both recovering password 
recoverPassword = async(req, res) => {
  // Todo: Finding the account information via token on the URL then reset the password
  // If the token expired then they would have to request another password reset
  // Extract the password expiration time and check it with the current time to see if it already expired
  return res.status(200).json({
    success: true
  })
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
      return res.status(401).json({
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
    res.cookie("token", "", {
      httpOnly: true,
      expires: new Date(0),
      secure: true,
      sameSite: "none",
    })
    .status(200)
    .json({ success: true });
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
};
