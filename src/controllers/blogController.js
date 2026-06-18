import Blog from "../models/Blog.js"
import fs from "fs";
import path from "path";

const deleteImage = (imagePath) => {
    if (!imagePath) return;

    const fullPath = path.join(
        process.cwd(),
        imagePath.replace(/^\/+/, "")
    );

    if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
    }
};

export const getBlogs = async (req, res) => {
    try {
        const filter = {};

        if (req.query.public === "true") {
            filter.status = "Published";
            filter.isVisible = true;
        }

        const blogs = await Blog.find(filter).sort({
            createdAt: -1,
        });

        res.status(200).json({
            success: true,
            data: blogs,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

export const getBlog = async (req, res) => {
    try {
        const blog = await Blog.findById(req.params.id);

        if (!blog) {
            return res.status(404).json({
                success: false,
                message: "Blog not found",
            });
        }

        res.status(200).json({
            success: true,
            data: blog,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

export const getBlogBySlug = async (req, res) => {
    try {
        const blog = await Blog.findOne({
            slug: req.params.slug,
            status: "Published",
            isVisible: true,
        });
        if (!blog) {
            return res.status(404).json({
                success: false,
                message: "Blog not found",
            });
        }

        res.status(200).json({
            success: true,
            data: blog,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

export const createBlog = async (req, res) => {
    try {
        if (req.body.contentBlocks) {
            req.body.contentBlocks = JSON.parse(req.body.contentBlocks);
        }

        let image = "";

        // Upload image selected
        if (req.file) {
            image = `/uploads/blogs/${req.file.filename}`;
        }

        // Remote URL selected
        else if (req.body.image?.trim()) {
            image = req.body.image.trim();
        }

        else {
            return res.status(400).json({
                success: false,
                message: "Please upload an image or provide an image URL",
            });
        }

        const blog = await Blog.create({
            ...req.body,
            image,
        });

        res.status(201).json({
            success: true,
            data: blog,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};


export const updateBlog = async (req, res) => {
    try {
        const blog = await Blog.findById(req.params.id);

        if (!blog) {
            return res.status(404).json({
                success: false,
                message: "Blog not found",
            });
        }

        // Content blocks parsing logic
        if (req.body.contentBlocks) {
            try {
                req.body.contentBlocks = typeof req.body.contentBlocks === 'string'
                    ? JSON.parse(req.body.contentBlocks)
                    : req.body.contentBlocks;
            } catch (e) {
                console.error("Error parsing content blocks:", e);
            }
        }

        let image = blog.image;

        // New uploaded file
        if (req.file) {
            if (
                blog.image &&
                blog.image.startsWith("/uploads/blogs/")
            ) {
                deleteImage(blog.image);
            }

            image = `/uploads/blogs/${req.file.filename}`;
        }

        // Remote URL
        else if (req.body.image?.trim()) {
            if (
                blog.image &&
                blog.image.startsWith("/uploads/blogs/")
            ) {
                deleteImage(blog.image);
            }

            image = req.body.image.trim();
        }

        // Remove image
        else if (req.body.serverImageRemaining === "false") {
            if (
                blog.image &&
                blog.image.startsWith("/uploads/blogs/")
            ) {
                deleteImage(blog.image);
            }

            image = "";
        }

        // req.body me se serverImageRemaining ko hatao taaki body direct schema se save ho sake
        const { serverImageRemaining, ...cleanUpdateBody } = req.body;

        const updatedBlog = await Blog.findByIdAndUpdate(
            req.params.id,
            {
                ...cleanUpdateBody,
                image,
            },
            {
                new: true,
                runValidators: true,
            }
        );

        res.status(200).json({
            success: true,
            message: "Blog layout updated perfectly!",
            data: updatedBlog,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};


export const deleteBlog = async (req, res) => {
    try {
        const blog = await Blog.findById(req.params.id);

        if (!blog) {
            return res.status(404).json({
                success: false,
                message: "Blog not found",
            });
        }

        if (
            blog.image &&
            blog.image.startsWith("/uploads/blogs/")
        ) {
            deleteImage(blog.image);
        }

        await blog.deleteOne();

        res.status(200).json({
            success: true,
            message: "Blog deleted successfully",
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

export const uploadBlockImageController = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: "No file uploaded" });
        }

        // Permanent web accessible address generated by Multer setup
        const fileUrl = `/uploads/blogs/${req.file.filename}`;

        return res.status(200).json({
            success: true,
            url: fileUrl
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

export const toggleBlogVisibility = async (
    req,
    res
) => {
    try {
        const blog = await Blog.findById(
            req.params.id
        );

        if (!blog) {
            return res.status(404).json({
                success: false,
                message: "Blog not found",
            });
        }

        blog.isVisible = !blog.isVisible;

        await blog.save();

        res.status(200).json({
            success: true,
            data: blog,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};


export const getLatestFooterBlogs = async (req, res) => {
    try {
        const blogs = await Blog.find({
            status: "Published",
            isVisible: true,
        })
            .select("title slug image publishedAt")
            .sort({ publishedAt: -1 })
            .limit(3);

        res.status(200).json({
            success: true,
            data: blogs,
        });
    } catch (error) {
        console.error("Footer blogs error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch latest blogs",
        });
    }
};