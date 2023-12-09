import model from "./model.js";

export const findAllUsers = () => model.find();
export const findUserById = (id) => model.findById(id); //model.find({ _id: id });
export const findUserByUsername = (username) =>
  model.findOne({ username: username });
//   model.find({ username: username });
export const findUserByCredentials = (username, password) =>
  model.findOne({ username, password });
export const findUsersByRole = (role) => model.find({ role: role });
// export const createUser = (user) => model.create(user);
export const createUser = async (userData) => {
  console.log("Attempting to create a new user:", userData);
  try {
    const newUser = await model.create(userData);
    console.log("New user created:", newUser);
    return newUser;
  } catch (error) {
    console.error("Error creating user:", error);
    throw error;
  }
};

export const updateUser = (id, user) => {
  console.log(`Updating user in database. ID: ${id}, Data:`, user);
  return model.updateOne({ _id: id }, { $set: user });
};

export const deleteUser = (id) => model.deleteOne({ _id: id });

export const findUserDetailsByUsername = async (username) => {
  try {
    const userDetails = await model.findOne({ username: username });
    if (!userDetails) {
      console.log(`User not found with username: ${username}`);
      return null;
    }
    console.log(`User details for username ${username}:`, userDetails);
    return userDetails;
  } catch (error) {
    console.error("Error fetching user details by username:", error);
    throw error;
  }
};
