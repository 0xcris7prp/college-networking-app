import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { getSuggestedConnections, getPublicProfile, updateProfile} from "../controllers/user.controller.js";

const router = express.Router();



router.get("/suggestions", protectRoute, getSuggestedConnections);
//to get suggested user's profile
router.get("/:username", protectRoute, getPublicProfile);
//used ':' so that we know that dynamic query.
router.put("/profile", protectRoute, updateProfile);
//route to update profile
export default router;