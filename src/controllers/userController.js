/*import UserModel from "../models/userModel.js";
import DriverModel from "../models/driverModel.js";

export const createUser = async (req, res) => {
  try {
    const { name, ...restOfBody } = req.body;

    // Check if a name (driver ID) is provided
    if (!name) {
      return res.status(400).json({ error: "Driver ID (name) is required." });
    }

    // Try to find the driver by their ID (name)
    const driver = await DriverModel.getDriverById(name);

    // If a driver is found, overwrite the name with the driver's name
    const userData = driver ? { ...restOfBody, name: driver.name } : req.body;

    // Create the user with the appropriate user data
    const user = await UserModel.createUser(userData);

    // Respond with the newly created user data
    return res.status(201).json({ user });
  } catch (error) {
    console.error("Error adding user:", error);

    // Return a generic error message if something else goes wrong
    return res
      .status(500)
      .json({ error: "An error occurred while adding the user." });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const user = await UserModel.getAllUsers();
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getUser = async (req, res) => {
  try {
    const user = await UserModel.getUserById(req.params.id);
    res.status(200).json(user);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
};

export const getUserByEmail = async (req, res) => {
  try {
    const email = req.params.email; // Use req.params to get URL parameters
    const user = await UserModel.getUserByEmail(email);
    res.status(200).json(user);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
};

*/