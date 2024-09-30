import * as factory from './factoryHandler.js';
import User from '../models/user.model.js';

export const getAllUsers = factory.getAll(User);
export const getUser = factory.getOne(User);
export const createUser = factory.createOne(User);
export const deleteUser = factory.deleteOne(User);
export const updateUser = factory.updateOne(User);
