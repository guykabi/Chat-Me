import rateLimit from 'express-rate-limit'

export const userLimiter = rateLimit({
	windowMs: 10 * 1000,
	max: 20, 
	standardHeaders: true,  
	legacyHeaders: false, 
})