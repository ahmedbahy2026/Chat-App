import asyncHandler from 'express-async-handler';
import {
  uploadOnCloudinary,
  deleteFromCloudinary
} from '../utils/cloudinary.js';

export const getAll = (Model) => {
  return asyncHandler(async (req, res, next) => {
    const docs = await Model.find();

    res.status(200).json({
      status: 'success',
      length: docs.length,
      data: {
        data: docs
      }
    });
  });
};

export const getOne = (Model) => {
  return asyncHandler(async (req, res, next) => {
    const doc = await Model.findById(req.params.id);

    res.status(200).json({
      status: 'success',
      data: {
        data: doc
      }
    });
  });
};

export const createOne = (Model) => {
  return asyncHandler(async (req, res, next) => {
    const newDoc = await Model.create(req.body);

    res.status(201).json({
      status: 'success',
      data: {
        data: newDoc
      }
    });
  });
};

export const deleteOne = (Model) => {
  return asyncHandler(async (req, res, next) => {
    await Model.findByIdAndDelete(req.params.id);

    res.status(204).json({
      status: 'success',
      data: null
    });
  });
};

export const updateOne = (Model) => {
  return asyncHandler(async (req, res, next) => {
    const updatedDoc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runvalidators: true
    });

    res.status(200).json({
      status: 'success',
      data: {
        data: updatedDoc
      }
    });
  });
};
