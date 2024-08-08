import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponce } from "../utils/ApiResponce.js";
import { User } from "../models/user.models.js";
import mongoose from "mongoose";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { decode } from "jsonwebtoken";

const getRefreshAndAccessToken = async (userid) => {
  try {
    const user = User.findById(userid);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;

    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      error?.messege || "Error while generating access or refresh token"
    );
  }
};

const registerUser = asyncHandler(async (req, res) => {
  const { username, email, fullName, password } = req.body;
  if (
    [username, email, fullName, password].some((field) => field?.trim() === "")
  ) {
    throw new ApiError(400, "All fields are required");
  }

  const existuser = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (existuser) {
    throw new ApiError(409, "Username or email already exists");
  }

  const avatarLocalPath = req.files?.avatar?.[0]?.path;
  const coverLocalPath = req.files?.coverImage?.[0]?.path;

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar File Is Required");
  }

  const avatar = await uploadOnCloudinary(avatarLocalPath);
  const cover = coverLocalPath
    ? await uploadOnCloudinary(coverLocalPath)
    : null;
  if (!avatar) {
    throw new ApiError(400, "Avatar file is reqired for cludinary");
  }

  const user = await User.create({
    fullName,
    avatar: avatar.url,
    coverImage: cover?.url || "",
    email,
    password,
    username: username.toLowerCase(),
  });

  const createduser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  if (!createduser) {
    throw new ApiError(500, "Something Went Wrong in server");
  }

  return res
    .status(201)
    .json(new ApiResponce(200, createduser, "Successfully registered"));
});

const loginUser = asyncHandler(async (req, res) => {
  const { username, email, password } = req.body;

  if (!(username || email)) {
    throw new ApiError(401, "Username Or Email is required");
  }

  const user = User.findOne($or[({ username }, { email })]);

  const isPasswordvalid = user.isPasswordCorrect(password);

  if (!isPasswordvalid) {
    throw new ApiError(401, "Password is incorrect");
  }

  const { accessToken, refreshToken } = getRefreshAndAccessToken(user._id);

  const loggedinUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );
  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponce(
        200,
        { user: loggedinUser, accessToken, refreshToken },
        "User Logged in Successfully"
      )
    );
});

const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $unset: {
        refreshToken: 1,
      },
    },
    {
      new: true,
    }
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponce(200, {}, "Successfully Logged Out"));
});

const refreshAuthToken = asyncHandler(async (req, res) => {
  //get the refresh token from cookies
  //decode the refreshtoken and get the _id
  //compare the user refresh token with the saved one
  // generate new access and refresh token
  //send the responce

  const incomingrefreshtoken =
    req.cookies.refreshToken || req.body.refreshToken;

  if (!incomingrefreshtoken) {
    throw new ApiError(401, "No refresh token found");
  }
  try {
    const decoded = jwt.verify(
      incomingrefreshtoken,
      process.env.REFRESH_TOKEN_SECRET
    );

    const user = User.findById(decoded._id);

    if (!user) {
      throw new ApiError(401, "invalid refresh token");
    }

    if (incomingrefreshtoken !== user.refreshToken) {
      throw new ApiError(401, "invalid refresh token");
    }

    const { accessToken, newrefreshToken } = getRefreshAndAccessToken(user._id);

    const options = {
      httpOnly: true,
      secure: true,
    };

    return res
      .status(200)
      .clearCookie("accessToken", accessToken, options)
      .clearCookie("refreshToken", newrefreshToken, options)
      .json(
        new ApiResponce(
          200,
          {
            accessToken,
            refreshToken: newrefreshToken,
          },
          "new RefreshToken and AccessToken Generated"
        )
      );
  } catch (error) {
    throw new ApiError(
      400,
      error?.messege || "Something Went wrong while generating new tokens"
    );
  }
});

const changeCurrentPassword = asyncHandler(async (req, res) => {
  const { oldPassword, NewPassword } = req.body;

  const user = User.findById(req.user._id);

  const isPasswordCorrect = user.isPasswordCorrect(oldPassword);

  if (!isPasswordCorrect) {
    throw new ApiError(401, "Invalid Password");
  }

  user.password = NewPassword;

  await user.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(new ApiResponce(200, {}, "Password Changed Sucessfully"));
});

const getCurrentUser = asyncHandler(async (req, res) => {
  return res.status(200).json(200, res.user, "User fetched Successfully");
});

const updateAccountDetails = asyncHandler(async (req, res) => {
  const { email, fullName } = res.body;
  if (!email || !fullName) {
    throw new ApiError(401, "Invalid email or fullname");
  }
  const user = User.findByIdAndUpdate(
    res.user._id,
    {
      $set: {
        fullName,
        email,
      },
    },
    {
      new: true,
    }
  ).select("-password");

  return res.status(200).json(200, user, "Details Updated");
});

const updateUserAvatar = asyncHandler(async (req, res) => {
  const avatarLocalPath = req.file?.path;

  if (!avatarLocalPath) {
    throw new ApiError(401, "Invalid Input");
  }

  const avatar = await uploadOnCloudinary(avatarLocalPath);

  if (!avatar) {
    throw new ApiError(500, "Internal server faliur");
  }

  const user = User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        avatar: avatar.url,
      },
    },
    {
      new: true,
    }
  );
  return res.status(200).json(200, avatar.url, "avatar changed successfully");
});

const updateUserCoverImage = asyncHandler(async (req, res) => {
  const CoverImageLocalPath = req.file?.path;

  if (!CoverImageLocalPath) {
    throw new ApiError(401, "Invalid Input");
  }

  const CoverImage = await uploadOnCloudinary(CoverImageLocalPath);

  if (!CoverImage) {
    throw new ApiError(500, "Internal server faliur");
  }

  const user = User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        coverImage: CoverImage.url,
      },
    },
    {
      new: true,
    }
  );
  return res
    .status(200)
    .json(200, CoverImage.url, "avatar changed successfully");
});

export {
  registerUser,
  logoutUser,
  loginUser,
  refreshAuthToken,
  changeCurrentPassword,
  getCurrentUser,
  updateAccountDetails,
  updateUserAvatar,
  updateUserCoverImage
};
