import mongoose from "mongoose";
import { IGig } from "../types/gig.types";
import { FREE_TEXT, MULTIPLE_CHOICE } from "../constants/globalConstants";
import fileSchema from "./fileSchema";
import { IFile } from "../types/file.types";

const gigSchema = new mongoose.Schema<IGig>({
  title: {
    type: String,
    // required: [true, "Please enter you gig title"],
  },
  category: {
    type: String,
    // required: [true, "Please enter you gig category"],
  },
  subCategory: {
    type: String,
    // required: [true, "Please enter you gig sub category"],
  },
  searchTags: [String],
  pricing: [
    {
      packageTitle: {
        type: String,
        required: [true, "Please enter the title of your package"],
      },
      packageDescription: {
        type: String,
        required: [true, "Please enter the description of your package"],
      },
      packageDeliveryTime: {
        type: String,
        required: [true, "Please enter the delivery time of your package"],
        default: "1 day",
      },
      revisions: {
        type: Number,
        required: [true, "Please enter the delivery time of your package"],
        default: 1,
      },
      sourceFile: {
        type: Boolean,
        default: false,
        required: [
          true,
          "Please tell whether to include source file or not for your package",
        ],
      },
      commercialUse: {
        type: Boolean,
        default: false,
        required: [
          true,
          "Please tell whether to include commercial use  or not for your package",
        ],
      },
      packagePrice: {
        type: Number,
        required: [true, "Please enter the price of your package"],
        default: 0,
      },
    },
  ],
  description: {
    type: String,
    // required: [true, "Please enter the description of your gig"]
  },
  images: [fileSchema],
  video: {
    type: fileSchema,
    validate: {
      validator: function (value: IFile | null | undefined) {
        if (!value) return true; 
        return (
          value.name && value.url && value.type && value.size && value.publicId
        );
      },
      message:
        "If a video is provided, it must include 'name', 'url', 'type', 'size', and 'publicId'.",
    },
  },
  ratings: {
    type: Number,
    default: 0,
    required: true,
  },

  numOfRatings: {
    type: Number,
    default: 0,
    required: true,
  },

  numOfReviews: {
    type: Number,
    default: 0,
    required: true,
  },

  reviews: [
    {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
      name: {
        type: String,
        required: true,
      },
      avatar: fileSchema,
      country: {
        type: String,
        required: true,
      },
      rating: {
        type: Number,
        required: true,
      },
      comment: {
        type: String,
        required: true,
        default: "",
      },
      createdAt: {
        type: Date,
        default: Date.now,
      },
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  active: {
    required: true,
    type: Boolean,
    default: false,
  },
  requirements: [
    {
      questionTitle: {
        type: String,
        required: [true, "Please enter the question"],
      },
      questionType: {
        type: String,
        enum: [FREE_TEXT, MULTIPLE_CHOICE],
        default: FREE_TEXT,
      },
      answerRequired: {
        type: Boolean,
        default: false,
      },
      multipleOptionSelect: {
        type: Boolean,
        default: false,
      },
      options: [
        {
          type: String,
        },
      ],
    },
  ],
});

gigSchema.index({ title: "text", searchTags: "text" });

export default mongoose.model<IGig>("Gig", gigSchema);
