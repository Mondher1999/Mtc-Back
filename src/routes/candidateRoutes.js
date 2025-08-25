import express from "express";
import {
    registerCandidate
 
} from "../controllers/candidateController.js"

const router = express.Router();

router.post("/registerCandidate", registerCandidate);


export default router;
