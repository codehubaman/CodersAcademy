const mongoose = require("mongoose");
const Category = require("../models/Category");

function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}

// Create Category
exports.createCategory = async (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    const categoryDetails = await Category.create({
      name,
      description,
    });

    console.log(categoryDetails);
    return res.status(200).json({
      success: true,
      message: "Category Created Successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Show All Categories
exports.showAllCategories = async (req, res) => {
  try {
    console.log("INSIDE SHOW ALL CATEGORIES");
    const allCategories = await Category.find({});
    console.log(allCategories);

    res.status(200).json({
      success: true,
      data: allCategories,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get Category Page Details
exports.categoryPageDetails = async (req, res) => {
  try {
    const { categoryId } = req.body;

    console.log("PRINTING CATEGORY ID:", categoryId);

    // Validate categoryId
    if (!mongoose.Types.ObjectId.isValid(categoryId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid category ID",
      });
    }

    // Find category and populate courses
    const selectedCategory = await Category.findById(categoryId)
      .populate({
        path: "courses",
        match: { status: "Published" },
        populate: { path: "ratingAndReviews" },
      })
      .exec();

    console.log("SELECTED CATEGORY:", selectedCategory);

    // If category is not found
    if (!selectedCategory) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    // If no courses found in the category
    if (!selectedCategory.courses || selectedCategory.courses.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No courses found for the selected category.",
      });
    }

    // Find other categories excluding the selected one
    const categoriesExceptSelected = await Category.find({
      _id: { $ne: categoryId },
    });

    let differentCategory = null;
    if (categoriesExceptSelected.length > 0) {
      const randomCategory =
        categoriesExceptSelected[getRandomInt(categoriesExceptSelected.length)];

      differentCategory = await Category.findById(randomCategory._id)
        .populate({
          path: "courses",
          match: { status: "Published" },
        })
        .exec();
    }

    console.log("Different CATEGORY:", differentCategory);

    // Fetch all categories with courses for top-selling courses
    const allCategories = await Category.find()
      .populate({
        path: "courses",
        match: { status: "Published" },
        populate: { path: "instructor" },
      })
      .exec();

    const allCourses = allCategories.flatMap((category) => category.courses);
    const mostSellingCourses = allCourses
      .sort((a, b) => (b.sold || 0) - (a.sold || 0))
      .slice(0, 10);

    res.status(200).json({
      success: true,
      data: {
        selectedCategory,
        differentCategory,
        mostSellingCourses,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};
