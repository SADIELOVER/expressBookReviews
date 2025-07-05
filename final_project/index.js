const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session');

const customer_routes = require('./router/auth_users.js').authenticated;
const genl_routes = require('./router/general.js').general;

const app = express();

app.use(express.json());

app.use("/customer", session({
    secret: "fingerprint_customer",
    resave: true,
    saveUninitialized: true
}));

app.use("/customer/auth/*", function auth(req, res, next) {
    const accessToken = req.session.accessToken;
    if (!accessToken) {
        return res.status(403).json({ error: "Access Denied. No token provided." });
    }
    jwt.verify(accessToken, 'your_jwt_secret_key_here', (err, decoded) => {
        if (err) {
            return res.status(401).json({ error: "Unauthorized. Invalid token." });
        }
        req.user = decoded;
        next();
    });
});

// ✅ THIS IS IMPORTANT: MOUNTS /register
app.use("/", genl_routes);
app.use("/customer", customer_routes);

const PORT = 5000;
app.listen(PORT, () => console.log("Server is running"));
