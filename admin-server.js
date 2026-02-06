import express from "express";
import cors from "cors";
import fs from "fs";
import path from "path";
import multer from "multer";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 5000;
const DATA_FILE = path.join(__dirname, "src", "constants", "portfolio-data.json");
const UPLOADS_DIR = path.join(__dirname, "public", "uploads");

// Ensure uploads directory exists
if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

app.use(cors());
app.use(express.json());
// Serve uploaded files statically
app.use("/uploads", express.static(UPLOADS_DIR));

// Multer storage config
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, UPLOADS_DIR);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + "-" + file.originalname);
    }
});

const upload = multer({ storage });

// Get all portfolio data
app.get("/api/data", (req, res) => {
    fs.readFile(DATA_FILE, "utf8", (err, data) => {
        if (err) {
            return res.status(500).json({ error: "Failed to read data file" });
        }
        res.json(JSON.parse(data));
    });
});

// Update portfolio data
app.post("/api/data", (req, res) => {
    const newData = req.body;
    fs.writeFile(DATA_FILE, JSON.stringify(newData, null, 2), "utf8", (err) => {
        if (err) {
            return res.status(500).json({ error: "Failed to write data file" });
        }
        res.json({ message: "Data updated successfully" });
    });
});

// Upload image
app.post("/api/upload", upload.single("image"), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
    }
    const fileUrl = `/uploads/${req.file.filename}`;
    res.json({ url: fileUrl });
});

app.listen(PORT, () => {
    console.log(`Admin server running at http://localhost:${PORT}`);
});
