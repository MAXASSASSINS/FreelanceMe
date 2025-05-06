import { tagOptions } from "../Data/tagsData";
import catchAsyncErrors from "../middleware/catchAsyncErrors";
import Gig from "../models/gigModel";
import User from "../models/userModel";
import { IGig, IReview } from "../types/gig.types";
import ErrorHandler from "../utils/errorHandler";
import Features from "../utils/features";

type CheckForErrorsBody = {
  title: string;
  category: string;
  subCategory: string;
  searchTags: string[];
  description: string;
};

const checkForErrors = (body: CheckForErrorsBody, currentStep: number) => {
  let error = "";
  const { title, category, subCategory, searchTags, description } = body;
  switch (currentStep) {
    case 1:
      if (!title || title.trim().length < 15) {
        error = "Please enter your gig title";
        return error;
      }
      if (!category || category.toLowerCase() === "Select a category".toLowerCase()) {
        error = "Please enter your gig category";
        return error;
      }
      if (!subCategory || subCategory.toLowerCase() === "Select a sub-category".toLowerCase()) {
        error = "Please enter your gig sub category";
        return error;
      }

      if (!searchTags || searchTags.length < 1 || searchTags.length > 5) {
        error = "Number of tags must be between 1 & 5";
        return error;
      }

      if (searchTags) {
        for (let i = 0; i < searchTags.length; i++) {
          if (!tagOptions.includes(searchTags[i])) {
            error = "Please enter valid tags";
            return error;
          }
        }
      }
      break;
    case 3:
      if (!description) {
        error = "Please enter your gig description";
        return error;
      }
      if (description.trim().length < 15) {
        error = "Description should be more than 15 characters";
        return error;
      }
      if (description.trim().length > 1200) {
        error = "Description should be less than 1200 characters";
        return error;
      }

      break;
  }
};

// Create gig
export const createGig = catchAsyncErrors(async (req, res, next) => {
  req.body.user = req.user?.id;
  const { data } = req.body;

  const newData = { ...data, user: req.user?.id };
  const error = checkForErrors(newData, 1);

  newData.category = newData.category.toLowerCase();
  newData.subCategory = newData.subCategory.toLowerCase();

  if (error) {
    return next(new ErrorHandler(error, 400));
  }

  const gig = await Gig.create(newData);

  res.status(201).json({
    success: true,
    message: "sucessfully created your gig",
    gig,
    gigId: gig._id,
  });
});

// Get all gigs
export const getAllGigs = catchAsyncErrors(async (req, res, next) => {
  const resultPerPage = 10;
  const gigsCount = await Gig.countDocuments();

  const feature = new Features(Gig.find({ active: true }), req.query)
    .search()
    .filter()
    .pagination(resultPerPage)
    .populate()
    .select();

  let gigs: (IGig & { matchingStatus: number })[] = await feature.query;

  let keywords =
    typeof req.query.keywords === "string" ? req.query.keywords.split(",") : [];

  if (keywords.length > 0) {
    gigs.forEach((gig) => {
      gig.matchingStatus = keywords.reduce((count, kw) => {
        if (gig.title?.toLowerCase().includes(kw.toLowerCase())) {
          return count + 1;
        }
        const gigTags = gig.searchTags?.map((tag) => tag.toLowerCase());
        if (
          gigTags?.some((tag) => tag.toLowerCase().includes(kw.toLowerCase()))
        ) {
          return count + 1;
        }
        return count;
      }, 0);
    });
    gigs = gigs.sort((a, b) => b.matchingStatus - a.matchingStatus);
  }

  res.status(200).json({
    success: true,
    message: "successfully fetched all gigs from database",
    gigsCount,
    gigs,
  });
});

// Get Favorite gigs
export const getFavoriteGigs = catchAsyncErrors(async (req, res, next) => {
  const user = req.user;

  if (!user) {
    return next(new ErrorHandler("User not found", 404));
  }

  const favouriteGigs = await Gig.find({
    _id: { $in: user.favouriteGigs },
  })
    .select("title pricing images ratings numOfRatings searchTags")
    .populate("user", "name avatar");

  res.status(200).json({
    success: true,
    message: "successfully fetched all favorite gigs from database",
    favouriteGigs,
  });
});

// Get gig details
export const getGig = catchAsyncErrors(async (req, res, next) => {
  //
  const gig = await Gig.findById(req.params.id).populate(
    "user",
    "name avatar numOfRatings ratings userSince country description tagline online lastDelivery"
  );

  if (!gig) {
    return next(new ErrorHandler("Gig not found", 404));
  }

  res.status(200).json({
    success: true,
    message: "Gig found sucessfully",
    gig,
  });
});

// Update gig
export const updateGig = catchAsyncErrors(async (req, res, next) => {
  const { data, step } = req.body;

  const error = checkForErrors(data, step);

  if (error) {
    return next(new ErrorHandler(error, 400));
  }

  let gig = await Gig.findById(req.params.id);

  if (!gig) {
    return next(new ErrorHandler("Gig not found", 404));
  }

  if (gig.user.toString() !== req.user?.id) {
    return next(
      new ErrorHandler("You are not authorized to update this gig", 401)
    );
  }

  if (step === 2) {
    gig = await Gig.findByIdAndUpdate(
      req.params.id,
      { $set: { pricing: data } },
      {
        new: true,
        runValidators: true,
        useFindandModify: false,
      }
    );
  } else if (step === 3) {
    gig = await Gig.findByIdAndUpdate(
      req.params.id,
      { $set: { description: data.contentState } },
      {
        new: true,
        runValidators: true,
        useFindandModify: false,
      }
    );
  } else {
    gig = await Gig.findByIdAndUpdate(req.params.id, data, {
      new: true,
      runValidators: true,
      useFindandModify: false,
    });
  }

  gig = await Gig.findById(req.params.id).populate(
    "user",
    "name avatar numOfRatings ratings userSince country description tagline online lastDelivery"
  );

  res.status(200).json({
    success: true,
    message: "Gig updated sucessfully",
    gig,
  });
});

// Delete gig
export const deleteGig = catchAsyncErrors(async (req, res, next) => {
  const gig = await Gig.findById(req.params.id);

  if (!gig) {
    return next(new ErrorHandler("Gig not found", 404));
  }

  await gig.remove();

  res.status(200).json({
    success: true,
    message: "Gig deleted sucessfully",
  });
});

// Create gig review
export const createGigReview = catchAsyncErrors(async (req, res, next) => {
  const { rating, comment, gigId } = req.body;

  if (!rating || !comment || !gigId) {
    return next(new ErrorHandler("Please provide all the fields", 400));
  }

  const review: IReview = {
    user: req.user?._id,
    name: req.user?.name!,
    avatar: req.user?.avatar!,
    country: req.user?.country!,
    rating: Number(rating),
    comment,
  };

  const gig = await Gig.findById(gigId);

  if (!gig) {
    return next(new ErrorHandler("Gig not found", 404));
  }

  const gigUser = await User.findById(gig.user);

  if (!gigUser) {
    return next(new ErrorHandler("Gig User not found", 404));
  }

  gig.reviews?.push(review);
  gig.numOfReviews = gig.reviews?.length ?? 0;
  gig.numOfRatings = (gig.numOfRatings ?? 0) + 1;
  gigUser.numOfRatings = (gigUser.numOfRatings ?? 0) + 1;
  gigUser.numOfReviews = (gigUser.numOfReviews ?? 0) + 1;

  gig.ratings = gig.ratings || 0;

  const newRatingsGig =
    (gig.ratings * (gig.numOfRatings - 1) + review.rating) / gig.numOfRatings;

  const newRatingsUser =
    (gigUser.ratings * (gigUser.numOfRatings - 1) + review.rating) /
    gigUser.numOfRatings;

  gig.ratings = newRatingsGig;
  gigUser.ratings = newRatingsUser;

  await gig.save({ validateBeforeSave: false });
  await gigUser.save({ validateBeforeSave: false });

  res.status(200).json({
    success: true,
    message: "Sucessfully added the review",
    review,
  });
});

export const getAllReviews = catchAsyncErrors(async (req, res, next) => {
  const gigId = req.query.id;

  const gig = await Gig.findById(gigId);
  if (!gig) {
    return next(new ErrorHandler("Product not found", 404));
  }

  res.status(200).json({
    success: true,
    reviews: gig.reviews,
  });
});

export const getUserGigs = catchAsyncErrors(async (req, res, next) => {
  const userGigs = await Gig.find({ user: req.params.id }).populate(
    "user",
    "name avatar online"
  );

  if (!userGigs) {
    return next(new ErrorHandler("User gigs not found", 404));
  }

  res.status(200).json({
    success: true,
    message: "User gigs found sucessfully",
    userGigs,
  });
});

// const fileUpload = catchAsyncErrors(async (req, res, next) => {
//   const files = req.files;

//   let fileUrls: string[] = [];
//   const p = await Promise.all(
//     Array.from(files).map(async (file , index) => {
//       if (!file) return;

//       const fileType = file.mimetype;
//       let fileUrl;

//       if (fileType.includes("application/json")) {
//         fileUrls.push(null);
//         return;
//       } else if (fileType.includes("video")) {
//         cloudinary.v2.uploader
//           .upload(file.path, {
//             folder: "FreelanceMe",
//             resource_type: "video",
//             chunk_size: 6000000,
//           })
//           .then((result) => {
//             fileUrl = {
//               public_id: result.public_id,
//               url: result.secure_url,
//             };
//             fileUrls.push(fileUrl);
//           })
//           .catch((err) => {
//             console.log(err);
//           });
//       } else {
//         cloudinary.v2.uploader
//           .upload(file.path, {
//             folder: "FreelanceMe",
//           })
//           .then((result) => {
//             fileUrl = {
//               public_id: result.public_id,
//               url: result.secure_url,
//             };
//             fileUrls.push(fileUrl);
//           })
//           .catch((err) => {
//             console.log(err);
//           });
//       }
//     })
//   );

//   return fileUrls;
// });
