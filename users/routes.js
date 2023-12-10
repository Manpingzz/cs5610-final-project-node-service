import * as dao from "./dao.js";

import jwt from "jsonwebtoken";

// let currentUser = null;

function UserRoutes(app) {
  const findAllUsers = async (req, res) => {
    const users = await dao.findAllUsers();
    res.json(users);
  };
  const findUserById = async (req, res) => {
    const id = req.params.id;
    const user = await dao.findUserById(id);
    res.json(user);
  };
  const findByUsername = async (req, res) => {
    const username = req.params.username;
    const user = await dao.findUserByUsername(username);
    res.json(user);
  };

  const findUserByCredentials = async (username, password) => {
    const user = await model.findOne({ username, password });
    return user;
  };

  const findUsersByRole = async (req, res) => {
    const role = req.params.role;
    const users = await dao.findUsersByRole(role);
    res.json(users);
  };

  const createUser = async (req, res) => {
    const user = await dao.createUser(req.body);
    res.json(user);
  };

  const updateUser = async (req, res) => {
    const id = req.params.id;
    const newUser = req.body;

    const status = await dao.updateUser(id, newUser);
    const currentUser = await dao.findUserById(id);
    req.session["currentUser"] = currentUser;
    res.json(status);
  };
  const updateFirstName = async (req, res) => {
    const id = req.params.id;
    const newFirstName = req.params.newFirstName;
    const status = await dao.updateUser(id, { firstName: newFirstName });
    res.json(status);
  };
  const deleteUser = async (req, res) => {
    const id = req.params.id;
    const status = await dao.deleteUser(id);
    res.json(status);
  };

  const signin = async (req, res) => {
    try {
      const user = await dao.findUserByUsername(req.body.username);

      if (user && req.body.password === user.password) {
        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
          expiresIn: "1h",
        });

        const userWithoutPassword = user.toObject();
        delete userWithoutPassword.password;

        res.json({ user: userWithoutPassword, token });
      } else {
        res.status(401).json({ message: "Invalid credentials" });
      }
    } catch (error) {
      console.error("Error during signin:", error);
      res.status(500).json({ message: error.message });
    }
  };

  const signout = async (req, res) => {
    // currentUser = null;
    req.session.destroy();
    res.sendStatus(200);
  };

  const signup = async (req, res) => {
    try {
      const { username, email, password, firstName, lastName } = req.body;

      const existingUser = await dao.findUserByUsername(username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already taken" });
      }

      const newUser = {
        username,
        email,
        password,
        firstName,
        lastName,
      };

      const savedUser = await dao.createUser(newUser);

      const { password: _, ...userWithoutPassword } = savedUser.toObject();
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Error creating user:", error);
      res.status(500).json({ message: "Error creating user" });
    }
  };

  const account = async (req, res) => {
    const currentUser = req.session["currentUser"];
    if (!currentUser) {
      res.sendStatus(403);
      return;
    }
    res.json(req.session["currentUser"]);
  };

  const getUserDetails = async (req, res) => {
    try {
      const username = req.params.username;
      const userDetails = await dao.findUserDetailsByUsername(username);
      if (!userDetails) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(userDetails);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };

  const verifyToken = (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({
        valid: false,
        message: "Access Denied / Unauthorized request",
      });
    }

    const token = authHeader.split(" ")[1];
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      // req.user = decoded;
      res.json({ valid: true, userId: decoded.userId });
    } catch (error) {
      res.status(400).json({ valid: false, message: "Invalid Token" });
    }
  };

  app.post("/api/users/:userId/watchlist", async (req, res) => {
    try {
      const userId = req.params.userId;
      const movieId = req.body.movieId;

      const user = await dao.findUserById(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      user.favorites.push(movieId);
      await user.save();

      res.status(200).json({ message: "Movie added to watchlist" });
    } catch (error) {
      console.error("Error in adding to watchlist: ", error);
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/users/:userId/ratings", async (req, res) => {
    try {
      const userId = req.params.userId;
      const { movieId, rating } = req.body;

      const user = await dao.findUserById(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      user.ratings.push({ movieId, rating });
      await user.save();

      res.status(200).json({ message: "Movie rated successfully" });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/users/signout", signout);
  app.post("/api/users/signin", signin);
  app.post("/api/users/account", account);
  app.post("/api/users/signup", signup);
  app.get("/api/verifyToken", verifyToken);

  app.post("/api/users", createUser);
  app.delete("/api/users/:id", deleteUser);
  app.get("/api/users/updateFirstName/:id/:newFirstName", updateFirstName);
  app.get("/api/users/profile/username/:username", getUserDetails);
  // app.get("/api/users/:username/:password/:email/:role", createUser);
  app.get("/api/users/role/:role", findUsersByRole);
  app.get("/api/users", findAllUsers);
  app.get("/api/users/:id", findUserById);
  app.get("/api/users/username/:username", findByUsername);
  app.get("/api/users/credentials/:username/:password", findUserByCredentials);
  app.put("/api/users/:id", updateUser);

  app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send("Something broke!");
  });
}

export default UserRoutes;
