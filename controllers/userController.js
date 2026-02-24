const multer = require('multer');
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');
const User = require('../models/userModel');
const catchAsync = require('../Utils/catchAsync');
const AppError = require('../Utils/appError');
const factory = require('./handlerFactory');

const cloudinary = (() => {
  try {
    return require('cloudinary').v2;
  } catch (err) {
    return null;
  }
})();

const isCloudinaryConfigured = () =>
  Boolean(
    cloudinary &&
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET,
  );

const uploadBufferToCloudinary = (buffer, publicId) => {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: 'natours/users',
        public_id: publicId,
        resource_type: 'image',
      },
      (err, result) => {
        if (err) return reject(err);
        return resolve(result);
      },
    );

    uploadStream.end(buffer);
  });
};

const isReadOnlyFsRuntime = () =>
  process.env.VERCEL === '1' || process.env.NODE_ENV === 'production';

// const multerStorage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, 'public/img/users');
//   },
//   filename: (req, file, cb) => {
//     // user - 8dsd3ffhhh4546-2322323.jpeg
//     const ext = file.mimetype.split('/')[1];
//     cb(null, `user-${req.user.id}-${Date.now()}.${ext}`);
//   },
// });

const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new AppError('Not an image ! Please upload only image.', 400), false);
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
  limits: { fileSize: 6 * 1024 * 1024 }, // 6MB hard cap to avoid serverless payload limits
});

exports.uploadUserPhoto = upload.single('photo');

exports.resizeUserPhoto = catchAsync(async (req, res, next) => {
  if (!req.file) return next();

  const filename = `user-${req.user.id}-${Date.now()}.jpeg`;
  const processedBuffer = await sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toBuffer();

  if (isReadOnlyFsRuntime()) {
    if (!isCloudinaryConfigured()) {
      return next(
        new AppError(
          'Profile photo upload is not configured for production. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET.',
          503,
        ),
      );
    }

    try {
      const publicId = filename.replace('.jpeg', '');
      const uploaded = await uploadBufferToCloudinary(
        processedBuffer,
        publicId,
      );
      req.file.filename = uploaded.secure_url;
      return next();
    } catch (err) {
      return next(
        new AppError(`Unable to upload profile photo: ${err.message}`, 500),
      );
    }
  }

  req.file.filename = filename;
  const uploadDir = path.join(__dirname, '..', 'public', 'img', 'users');
  const outputPath = path.join(uploadDir, req.file.filename);

  try {
    await fs.promises.mkdir(uploadDir, { recursive: true });
    await sharp(processedBuffer).toFile(outputPath);
  } catch (err) {
    return next(
      new AppError(
        `Unable to process profile photo upload: ${err.message}`,
        500,
      ),
    );
  }

  next();
});

const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

exports.getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};

exports.updateMe = catchAsync(async (req, res, next) => {
  //1) Create error if user POSTs password data
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError(
        'This route is not for password updates. Please use /updateMyPassword',
        400,
      ),
    );
  }
  //2) Filtered out unwanted fields names that are not allowed to be updated
  const filteredBody = filterObj(req.body, 'name', 'email');
  if (req.file) filteredBody.photo = req.file.filename;
  //3) Update user document
  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true,
  });
  res.status(200).json({
    status: 'success',
    user: updatedUser,
  });
});

exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });
  res.status(204).json({
    status: 'success',
    data: null,
  });
});

exports.createUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined!Please use /signup instead',
  });
};

exports.updateUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined!',
  });
};

exports.getAllUsers = factory.getAll(User);
// Do NOT update passwords with this!
exports.updateUser = factory.updateOne(User);
exports.getUser = factory.getOne(User);
exports.deleteUser = factory.deleteOne(User);
