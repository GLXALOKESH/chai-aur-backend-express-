import { Router } from "express";
import {
  registerUser,
  logoutUser,
  loginUser,
  refreshAuthToken,
  changeCurrentPassword,
  getCurrentUser,
  updateAccountDetails,
  updateUserAvatar,
  updateUserCoverImage,
} from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyToken } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/register").post(
  upload.fields([
    {
      name: "avatar",
      maxCount: 1,
    },
    {
      name: "coverImage",
      maxCount: 1,
    },
  ]),
  registerUser
);

router.route("/login").post(loginUser);

router.route("/logout").post(verifyToken, logoutUser);
router.route("/refresh-token", refreshAuthToken);

router.route("/change-pass").post(verifyToken, changeCurrentPassword);

router.route("/get-user").post(verifyToken, getCurrentUser);

router.route("/update-details").post(verifyToken, updateAccountDetails);

router
  .route("/update-avatar")
  .post(verifyToken, upload.single("avatar"), updateUserAvatar);

router
  .route("/update-coverImage")
  .post(verifyToken, upload.single("coverImage"), updateUserCoverImage);

export default router;
