const AuthService = require("../services/authService");
const Logger = require("../utils/logger");

class AuthController {
    static async signup(req, res){
        try{
            const { username, email, password } = req.body;
            Logger.info(`Signup attempt for email: ${email}`);

            if (!username || !email || !password) {
                Logger.info("Signup attempt with missing fields");
                return res.status(400).json({ message: "All fields are required" });
            }
            Logger.info("Checking if user already exists...");
            const existingUser = await AuthService.findUserByEmail(email);
            if(existingUser){
                Logger.info(`Signup attempt with existing email: ${email}`);
                return res.status(400).json({message: "User already exists"});
            }
            Logger.info("Registering new user...");
            const newUser = await AuthService.registerUser(username, email, password);
            Logger.info(`User registered successfully: ${email}`);

            console.log("Session after signup:", req.session);
            console.log("session res" , res.session);
            //store session in redis
            req.session.user = 
            { 
                id: newUser.id, 
                email: newUser.email 
            };

            // Save session explicitly and handle errors
            req.session.save((err) => {
                if (err) {
                    console.log(err);
                Logger.error("Session save error:", err);
                return res.status(500).json({ message: "Failed to save session" });
                }
                console.log("Session after storing:", req.session);
                Logger.info("Session saved successfully");
                res.status(201).json({message: "User registered successfully", user: newUser});
            });
            
        }
        catch(err){
            console.log(err);
            Logger.error("Signup Error: ", err);
            res.status(500).json({message: "Internal Server Error"});
        }
    }

    static async login(req, res){
        try{
            const { email, password } = req.body;
            Logger.info(`Login attempt for email: ${email}`);

            if( !email || !password ){
                Logger.info("Login attempt with missing fields");
                return res.status(400).json({message: "Email and password are required"});
            }

            const user = await AuthService.findUserByEmail(email);
            if(!user){
                Logger.info(`Login attempt with non-existing email: ${email}`);
                return res.status(400).json({message: "Invalid email or password"});
            }

            const isValidPassword = await AuthService.validatePassword(password, user.password);
            if(!isValidPassword){
                Logger.info(`Login attempt with incorrect password for email: ${email}`);
                return res.status(400).json({message: "Invalid email or password"});
            }

            Logger.info(`User logged in successfully: ${email}`);
            req.session.user = { id: user.id, email: user.email };
            await req.session.save();
            console.log("Session after login:", req.session);
            res.status(200).json({message: "Login successful", user: { id: user.id, email: user.email, created_at: user.created_at, updated_at: user.updated_at }} );
        }
        catch(err){
            console.log(err);
            Logger.error("Login Error: ", err);
            res.status(500).json({message: "Internal Server Error"});
        }
    }

    static async logout(req, res){
        try{
            req.session.destroy((err) =>{
                if(err){
                    Logger.error("Logout Error: ", err);
                    return res.status(500).json({message: "Could not log out. Please try again."});
                }
                res.clearCookie("connect.sid");
                Logger.info("User logged out successfully");
                return res.status(200).json({message: "Logout successful"});
            })
        }
        catch(err){
            Logger.error("Logout Error: ", err);
            res.status(500).json({message: "Internal Server Error"});
        }
    }

    static async getCurrentUser(req, res) {
        Logger.info("Fetching current user...");
        if (req.session.user) {
            Logger.info(`Current user found: ${req.session.user.email}`);
            res.json({ user: req.session.user });
        } else {
            Logger.info("No user is currently logged in");
            res.status(401).json({ message: "Not logged in" });
        }
    }
}

module.exports = AuthController;