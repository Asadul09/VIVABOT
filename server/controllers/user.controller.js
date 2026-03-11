import User from "../models/user.model.js";

export const getCurrentUser = async(req, res) => {
    try {
        const userId = req.userId; 
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // ✅ Return only necessary fields
        return res.status(200).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            credits: user.credits
        });

    } catch (error) {
        return res.status(500).json({ message: `Error fetching current user: ${error}` });
    }
}