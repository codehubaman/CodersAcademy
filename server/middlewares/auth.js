const jwt = require("jsonwebtoken");
require("dotenv").config();
const User = require("../models/User");

//auth
exports.auth = async (req, res, next) => {
    try {

        console.log("BEFORE ToKEN EXTRACTION");
        //extract token
        const token = req.cookies.token
            || req.body.token
            || req.header("Authorization")?.replace("Bearer ", "")
            || req.header("Authorisation")?.replace("Bearer ", "");
        console.log("HEADERS:", req.headers);
        console.log("BODY:", req.body);
        console.log("COOKIES:", req.cookies);


        console.log("JWT_SECRET:", process.env.JWT_SECRET);

        console.log("TOKEN: ", token);
        console.log("AFTER ToKEN EXTRACTION");

        //if token missing, then return response
        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'TOken is missing',
            });
        }

        //verify the token
        // Verify token
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            console.log("Token Verified:", decoded);
            req.user = decoded;
        } catch (err) {
            console.error("JWT Verification Error:", err.message);
            return res.status(401).json({
                success: false,
                message: `Token verification failed: ${err.message}`,
            });
        }

        next();
    } catch (error) {
        console.error("Auth Middleware Error:", error.message);
        return res.status(500).json({
            success: false,
            message: "Something went wrong while validating the token",
        });
    }
};

//isStudent
exports.isStudent = async (req, res, next) => {
    try {
        if (req.user.accountType !== "Student") {
            return res.status(401).json({
                success: false,
                message: 'This is a protected route for Students only',
            });
        }
        next();
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: 'User role cannot be verified, please try again'
        })
    }
}


//isInstructor
exports.isInstructor = async (req, res, next) => {
    try {
        if (req.user.accountType !== "Instructor") {
            return res.status(401).json({
                success: false,
                message: 'This is a protected route for Instructor only',
            });
        }
        next();
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: 'User role cannot be verified, please try again'
        })
    }
}


//isAdmin
exports.isAdmin = async (req, res, next) => {
    try {
        console.log("Printing AccountType ", req.user.accountType);
        if (req.user.accountType !== "Admin") {
            return res.status(401).json({
                success: false,
                message: 'This is a protected route for Admin only',
            });
        }
        next();
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: 'User role cannot be verified, please try again'
        })
    }
}