const User = require(`${__models}/users`);
const { connectToDatabase, disconnectFromDatabase } = require(`${__config}/dbConn`);
const { generateTokens, verifyToken, tokenPayload } = require(`${__utils}/helper.js`)
const { responseHandler } = require(`${__utils}/responseHandler`)
const bcrypt = require('bcrypt')

exports.createUser = async (req, res) => {
  try {
    await connectToDatabase();
    const { email, password, role } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return responseHandler.validationError(res, "Email already registered, please choose another");
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({ email, password: hashedPassword, role });

    return responseHandler.success(res, user, "User Created Successfully") 
  } catch (err) {
    return responseHandler.error(res, err)
  } finally {
    await disconnectFromDatabase();
  }
};

exports.updateUser = async (req, res) => {
  try {
    await connectToDatabase();
    const { userId } = req.params;
    const { email, password, role, name, phone } = req.body;
    
    const user = await User.findById(userId);
    if (!user) {
      return responseHandler.notFound(res, "User not found");
    }

    // Check if email is being changed and if new email already exists
    if (email && email !== user.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return responseHandler.validationError(res, "Email already registered, please choose another");
      }
    }

    let hashedPassword = user.password;
    if (password) {
      const salt = await bcrypt.genSalt(10);
      hashedPassword = await bcrypt.hash(password, salt);
    }

    user.email = email || user.email;
    user.password = hashedPassword;
    user.role = role || user.role;
    user.name = name || user.name;
    user.phone = phone || user.phone;

    await user.save();

    return responseHandler.success(res, user, "User Updated Successfully")
  } catch (err) {
    return responseHandler.error(res, err.messsage)
  } finally {
    await disconnectFromDatabase();
  }
};

exports.deleteUser = async (req, res) => {
  try {
    await connectToDatabase();
    const { userId } = req.params;

    const user = await User.findByIdAndUpdate(
      userId,
      { isDeleted: true },
      { new: true }
    );

    if (!user) {
      return responseHandler.notFound(res, "User Not Found")
    }

    return responseHandler.success(res, user, "User Deleted Successfully")
  } catch (err) {
    return responseHandler.error(res, err.messsage)
  } finally {
    await disconnectFromDatabase();
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    await connectToDatabase();
    const users = await User.find({ isDeleted: false }).populate('keys');
    return responseHandler.success(res, users, "User Updated Successfully")
  } catch (err) {
    return responseHandler.error(res, err.messsage)
  } finally {
    await disconnectFromDatabase();
  }
};

exports.login = async (req, res) => {
  try {
      await connectToDatabase();
      const { email, password } = req.body;

      // Check if the user exists
      const user = await User.findOne({ email: email.toLowerCase() });

      if (!user) {
          return responseHandler.validationError(res, "Invalid Email");
      }

      // Compare the password with the hashed password in the database
      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
          return responseHandler.validationError(res, "Your password is incorrect");
      }

      // Reset failed login attempts on successful login
      const payload = await tokenPayload(user)
      await generateTokens(payload, res, user);
      req.session.user = user;
      let savedUser = await user.save();
      console.log(savedUser)
      return responseHandler.success(res, user, "LoggedIn Successfully");
  } catch (error) {
      console.error(error);
      return responseHandler.error(res, error);
  }
};

// exports.refreshToken = async (req, res) => {
//   const refreshToken = req.cookies['refreshToken'];
//   if (!refreshToken) {
//       return responseHandler.unauthorized(res, {}, "Refresh token is missing");
//   }

//   try {
//       const decoded = await verifyToken(refreshToken)
//       const user = await User.findById(decoded.id);
//       if (!user || user.refreshToken !== refreshToken) {
//           return responseHandler.unauthorized(res, {}, "Invalid refresh token");
//       }

//       // Generate new access token
//       const { accessToken, refreshToken: newRefreshToken } = await generateTokens(user);

//       // Update and save new refresh token
//       user.refreshToken = newRefreshToken;
//       await user.save();

//       responseHandler.success(res, {}, "Set new refresh token successfully");
//   } catch (error) {
//       return res.status(403).json({ message: 'Invalid or expired refresh token' });
//   }
// }

// exports.authJwtToken = async (req, res, next) => {
//   const token = req.cookies.jwt; // Read token from cookies
// console.log(req.cookies.jwt,req.cookies,req.cookies['jwt']);    
// if (!token) {
//       return responseHandler.unauthorized(res, {}, "Token is missing");
//   }
//   try {
//       //const decoded = await verifyToken(token);
//       //req.user = decoded;
//       res.json({token})
//   } catch (error) {
//       return responseHandler.unauthorized(res, {}, "Invalid token");
//   }
// }

exports.logout = async (req, res) => {
  try {
      if (req.session.user) {
          const userId = req.session.user._id;

          req.session.destroy(async (err) => {
              if (err) {
                  return responseHandler.error(res, "Logout failed. Try again later.");
              }
              res.clearCookie('connect.sid');
              res.clearCookie('jwt');
              res.clearCookie('refreshToken');

              try {
                  const user = await User.findById(userId);
                  if (user) {
                      user.refreshToken = null;
                      await user.save();
                  }

                  return responseHandler.success(res, null, "Successfully logged out.");
              } catch (userError) {
                  return responseHandler.error(res, "Logout failed. Please try again later.");
              }
          });
      } else {
          return responseHandler.validationError(res, "No user is logged in.");
      }
  } catch (error) {
      console.error(error);
      return responseHandler.error(res, "An error occurred during logout. Please try again.");
  }
};
