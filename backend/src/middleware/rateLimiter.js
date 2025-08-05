import rateLimit from "../config/upstash.js";

const rateLimiter = async(req, res, next) => {
    try {
        // TODO: Use a unique identifier for the user, such as user ID
        const {success} = await rateLimit.limit("UniqueIdentifier");
        if (!success) {
            return res.status(429).json({message: "Too many requests"});
        }
        next();
    } catch (error) {
        console.error("Rate limiter error:", error);
        next(error);
    }
}

export default rateLimiter;