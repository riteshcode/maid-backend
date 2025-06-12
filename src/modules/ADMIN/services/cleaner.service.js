const Cleaner = require('../../models/cleaners.model')
const bcrypt = require('bcryptjs');




// changePassword 
async function changePassword(userId, oldPassword, newPassword) {
  const user = await Cleaner.findById(userId);
  if (!user) {
    throw new Error('User not found');
  }

  const isMatch = await bcrypt.compare(oldPassword, user.password);
  if (!isMatch) {
    throw new Error('Old password is incorrect');
  }
  const hashedPassword = await bcrypt.hash(newPassword, 10);
  user.password = hashedPassword;
  await Cleaner.findByIdAndUpdate({ _id: user?._id }, { password: hashedPassword })
}


module.exports={
  changePassword,
}