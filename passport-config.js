const bcrypt = require("bcrypt");
const LocalStrategy = require("passport-local").Strategy;

const findUserByEmail = (email, users) => {
    const user = users.find(user => user.email === email);
    return user;
  };

  const findUserById = (id, users) => {
    const user = users.find(user => user.id === id);
    console.log('user user user ====', user);
    
    return user;
  };

const passportConfig = (passport, users) => {
    const callback = async (email, password, done) => {
    try {
      const user = await findUserByEmail(email, users);
      if (!user) {
        return done(null, false, { message: "Incorrect username." });
      }
    //   const validPassword = await bcrypt.compare(password, user.password);
      if (password !== user.password) {
        return done(null, false, { message: "Incorrect password." });
      }
      return done(null, user, { message: "You are signed in successfully!" });
    } catch (error) {
      return done(error);
    }
  };

  passport.use(new LocalStrategy({ usernameField: "email" }, callback));
  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser((id, done) => {      
    const user = findUserById(id, users);
    try {
        return done(null, user);
    } catch (error) {
        return done(err);
    }
  });
};

module.exports = passportConfig;
