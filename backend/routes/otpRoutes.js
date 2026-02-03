import express from "express";
import { receiveOTP, getOTP } from "../controllers/otpController.js";

const router = express.Router();

router.post("/receive", receiveOTP);
router.get("/:aliasId", getOTP);

export default router;


