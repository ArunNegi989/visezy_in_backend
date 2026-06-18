const express = require("express");

const router = express.Router();

const upload = require("../middleware/uploadBlog");

const {
    getBlogs,
    getBlog,
    getBlogBySlug,
    createBlog,
    updateBlog,
    deleteBlog,
    uploadBlockImageController,
    toggleBlogVisibility,
    getLatestFooterBlogs,
} = require("../controllers/blogController");

router.get("/", getBlogs);

router.get("/slug/:slug", getBlogBySlug);

router.get("/:id", getBlog);

router.post(
    "/",
    upload.single("image"),
    createBlog
);

router.post('/upload-block-image', upload.single('blockFile'), uploadBlockImageController);

router.put("/:id", upload.single("image"), updateBlog);

router.delete("/:id", deleteBlog);

router.patch("/:id/visibility", toggleBlogVisibility);


router.get("/footer/latest", getLatestFooterBlogs);

module.exports = router;