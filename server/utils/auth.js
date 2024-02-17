const jwt = require('jsonwebtoken');

const secret = 'mysecretsshhhhh';
const expiration = '2h';

module.exports = {
  authMiddleware: function (params) {
    const isApolloServer = params.hasOwnProperty('req');

    let req = isApolloServer ? params.req : params;
    let res = isApolloServer ? null : arguments[1];
    let next = isApolloServer ? null : arguments[2];

    let token;
    if (req.headers.authorization) {
      token = req.headers.authorization;
      // Remove "Bearer " from token if present
      if (token.startsWith('Bearer ')) {
        token = token.slice(7, token.length).trim();
      }
    }

    if (!token) {
      if (isApolloServer) {
        return { user: null };
      } else {
        return res.status(400).json({ message: 'You have no token!' });
      }
    }

    try {
      const { data } = jwt.verify(token, secret, { expiresIn: expiration });
      if (isApolloServer) {
        return { user: data };
      } else {
        req.user = data;
        next();
      }
    } catch (error) {
      console.error('Invalid token');
      if (isApolloServer) {
        return { user: null };
      } else {
        return res.status(400).json({ message: 'Invalid token!' });
      }
    }
  },
  signToken: function ({ username, email, _id }) {
    const payload = { username, email, _id };
    return jwt.sign({ data: payload }, secret, { expiresIn: expiration });
  },
};
