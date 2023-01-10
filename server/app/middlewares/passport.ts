import { Handler, RequestHandler } from 'express';
import passport from 'passport';
import {Strategy as LocalStrategy} from 'passport-local';
import GoogleStrategy from 'passport-google-oidc';
import prisma from '../modules/prisma';
import bcrypt from 'bcrypt';
import errorMsg from '../config/errorMsg';
import { Provider, Role, User as UserModel} from '@prisma/client';
import { newUser } from '../services/auth';
import { AuthPermissions, rolePermissions } from '../config/authPermissions';

passport.serializeUser<UserModel>(function(user, cb) {
  process.nextTick(function() {
    return cb(null, user);
  });
});

passport.deserializeUser<UserModel>(function(user, cb) {
  process.nextTick(function() {
    return cb(null, user);
  });
});

passport.use(new LocalStrategy(async function verify(username, password, cb) {
  const user = await prisma.user.findUnique({where: {email: username}}).catch(cb);
  if (!user) return cb(null, false, {message: errorMsg.auth.not_found});
  if (user.provider != 'email' || !user.password) return cb(null, false);
  if (!bcrypt.compareSync(password, user.password)) return cb(null, false, {message: errorMsg.auth.bad_password});
  return cb(null, user);
}));

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: `${process.env.API_URL}/auth/callback/google`,
},
async function(_: any, profile: any, cb: (error: any, user?: any) => void) {
  if (!profile || profile.emails.length == 0) return cb(null, false);

  let user = await prisma.user.findUnique({where: {email: profile.emails[0].value}}).catch(cb);

  if (user) {
    if (user.provider != 'google') return cb(null, false);
    return cb(null, user);
  } else {
    try {
      user = await newUser(Provider.google, profile.name.givenName, profile.name.familyName, profile.emails[0].value, Role.USER);
    } catch (err) {
      return cb(err);
    }
    return cb(null, newUser);
  }
}));

function _authN(checkIsAuth = true): RequestHandler {
  return (req, res, next) => {
    if (checkIsAuth) {
      if (!req.user) return res.sendStatus(401);
      return next();
    } else {
      if (req.user) return res.sendStatus(401);
      return next();
    }
  };
}

function authZ(permission: AuthPermissions): RequestHandler {
  return (req, res, next) => {
    if (!req.user) return next();
    if (!rolePermissions[req.user.role].includes(permission)) return res.sendStatus(403);
    next();
  };
}

function authNZ(permission: AuthPermissions): RequestHandler {
  return (req, res, next) => {
    _authN()(req, res, () => authZ(permission)(req, res, next));
  };
}

declare global {
  namespace Express {
    interface User extends UserModel {}
  }
}

export const authN = _authN(true);
export const notAuthN = _authN(false);
export {
  authZ,
  authNZ
}
