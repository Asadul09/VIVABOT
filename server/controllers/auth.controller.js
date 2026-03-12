import User from "../models/user.model.js";
import genToken from "../config/token.js";

export const googleAuth = async(req, res) => {
    try {
        const { name, email } = req.body;
        let user = await User.findOne({ email });

        if (!user) {
            
            user = await User.create({ name, email});
        }

        const token = await genToken(user._id);
        res.cookie('token', token, {
            httpOnly: true,
            secure: true,
            sameSite: 'none',
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        // ✅ Return only necessary fields
        return res.status(200).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            credits: user.credits
        });

    } catch (error) {
        return res.status(500).json({ message: `Google authentication error: ${error}` });
    }
}

export const logout = async (req, res) => {
    try {
        await res.clearCookie('token');
        return res.status(200).json({ message: 'Logged out successfully' });
    } catch (error) {
        return res.status(500).json({ message: `Logout error: ${error}` });
    }
}
