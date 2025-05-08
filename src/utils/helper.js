const crypto = require('crypto');
const jwt = require('jsonwebtoken');

const generateEncryptedKey = () => {
  const randomKey = crypto.randomBytes(12).toString('hex');
  const issuerPrefix = process.env.GOOGLE_ISSUER_ID;
  return `${issuerPrefix}.${randomKey}`;
};

const generateTokens = async (payload, res, user) => {
  // Sign the token with the payload, secret, and expiration time from environment variables
  const accessToken = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: process.env.JWT_TOKEN_EXP });
  // Refresh token
  const refreshToken = jwt.sign({ id: user._id }, process.env.JWT_REFRESH_SECRET, {
      expiresIn: process.env.REFRESH_TOKEN_EXP // Longer expiry for refresh tokens (e.g., 7 days)
  });
  // Store the refresh token in the user's database record (if applicable)
  user.refreshToken = refreshToken;
  await user.save();

  // Set cookies for access and refresh tokens
  res.cookie('jwt', accessToken, {
      httpOnly: process.env.NODE_ENV == 'production' || 'stagging'  ? false : true, // Prevent client-side access to the cookie
      secure: process.env.NODE_ENV == 'production' || 'stagging'    ?  true : false, // Use `secure` in production (HTTPS)
      sameSite:process.env.NODE_ENV == 'production' || 'stagging'    ? 'None' : 'Lax', // Mitigate CSRF
      maxAge:  60* 60 * 1000, // 15 minutes
      path:"/"
  });

  res.cookie('refreshToken', refreshToken, {
      httpOnly: process.env.NODE_ENV ==  'production' || 'stagging'   ? false : true, // Prevent client-side access to the cookie
      secure: process.env.NODE_ENV == 'production' || 'stagging'   ? true : false, // Use `secure` in production (HTTPS)
      sameSite:process.env.NODE_ENV == 'production' || 'stagging'   ? 'None' : 'Lax', // Mitigate CSRF
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      path:"/"
  });
  return { accessToken, refreshToken };

};
const verifyToken = async (refreshToken) => {
  return jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

}
const tokenPayload = async(user)=>{
  return {
      id:user?._id,
      email:user?.email,
      role:user?.role,
      name:user?.fullName,
      signUpByGoogle:user.signUpByGoogle
  }
}


module.exports = { generateEncryptedKey, generateTokens, verifyToken, tokenPayload } ;