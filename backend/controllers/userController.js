const { getAllUsers, blockUser, unblockUser } = require('../services/userService');

module.exports.getAllUsersController = async (req, res) => {
  try {
    const users = await getAllUsers();
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching users' });
  }
};

module.exports.blockUserController = async (req, res) => {
  try {
    const { userId } = req.params;

    // Адмін не може заблокувати сам себе
    if (String(userId) === String(req.user.id)) {
      return res.status(400).json({ message: 'Не можна заблокувати власний акаунт' });
    }

    const user = await blockUser(userId);
    if (!user) return res.status(404).json({ message: 'Користувача не знайдено' });
    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error blocking user' });
  }
};

module.exports.unblockUserController = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await unblockUser(userId);
    if (!user) return res.status(404).json({ message: 'Користувача не знайдено' });
    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error unblocking user' });
  }
};
