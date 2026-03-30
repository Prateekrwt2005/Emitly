import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { ENV } from '../lib/env.js';

export const socketAuthMiddleware = async (socket, next) => {
    try{
        const token = socket.handshake.headers.cookie
        ?.split("; ")
        .find((row) => row.startsWith("token="))
        ?.split("=")[1];
        if (!token) {
            console.log("No token provided in socket handshake");
            return next(new Error("Authentication error: No token provided"));
        }
        const decoded = jwt.verify(token, ENV.JWT_SECRET);
        if(!decoded){
            console.log("Invalid token in socket handshake");
            return next(new Error("Authentication error: Invalid token"));
        }

          const user = await User.findById(decoded.userId).select("-password");
    if (!user) {
      console.log("Socket connection rejected: User not found");
      return next(new Error("User not found"));
    }
    
      socket.user = user;
    socket.userId = user._id.toString();

    console.log(`Socket authenticated for user: ${user.fullName} (${user._id})`);

    next();


    }catch(error){
        console.error("Authentication error:", error);
        return next(new Error("Authentication error: Invalid token"));
    }
}
    
