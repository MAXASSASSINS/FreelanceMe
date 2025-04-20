import catchAsyncErrors from "../middleware/catchAsyncErrors";
import Gig from "../models/gigModel";
import Order from "../models/orderModel";
import User from "../models/userModel";
import ErrorHandler from "../utils/errorHandler";
import { razorpayInstance } from "../utils/razorpay";
import { sendSendGridEmail } from "../utils/sendEmail";
import { randomString } from "../utils/utilities";
import crypto from "crypto";
import { Request, Response } from "express";
import { frontendHomeUrl } from "../index";
import {
  IBuyerFeedback,
  IOrder,
  IOrderRequirement,
  IPackageDetails,
  ISellerFeedback,
} from "../types/order.types";
import { IReview, IUser } from "../types/user.types";
import { FREE_TEXT } from "../constants/globalConstants";
import { IGigRequirement } from "../types/gig.types";
import { title } from "process";
import { registerUser } from "./userController";
import { IFile } from "../types/file.types";

// Create new order
export const newOrder = async (user: IUser, body: any) => {
  const {
    razorpay_payment_id,
    razorpay_order_id,
    razorpay_signature,
    gigId,
    packageNumber,
  } = body;

  if (packageNumber === undefined || packageNumber < 0 || packageNumber > 2) {
    throw new Error("Please select a package");
  }

  const gig = await Gig.findById(gigId).populate("user");

  if (!gig) {
    throw new Error("Gig not found with this Id");
  }

  let rString = randomString(13, "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ");

  const price = gig.pricing![packageNumber].packagePrice;
  const totalAmount = Number(price).toFixed(2);

  let duration = Number(
    gig.pricing![packageNumber].packageDeliveryTime.toString().split(" ")[0]
  );

  let deliveryDate = new Date();
  deliveryDate.setDate(deliveryDate.getDate() + duration);

  const options = gig.requirements?.map((requirement) => {
    if (requirement.questionType === FREE_TEXT) {
      return;
    }
    return requirement.options?.map((option) => {
      return {
        title: option,
        selected: false,
      };
    });
  });

  const requirements: IOrderRequirement[] = gig.requirements?.map((requirement, index) => {
    return {
      questionTitle: requirement.questionTitle,
      questionType: requirement.questionType,
      answerRequired: requirement.answerRequired,
      multipleOptionSelect: requirement.multipleOptionSelect,
      options: options[index] ? options[index] : [],
      files: [],
    };
  });
  
  const packageDetails: IPackageDetails = {
    packageTitle: gig.pricing![packageNumber].packageTitle,
    packageDescription: gig.pricing![packageNumber].packageDescription,
    packageDeliveryTime: gig.pricing![packageNumber].packageDeliveryTime,
    revisions: gig.pricing![packageNumber].revisions,
    sourceFile: gig.pricing![packageNumber].sourceFile,
    commercialUse: gig.pricing![packageNumber].commercialUse,
    packagePrice: gig.pricing![packageNumber].packagePrice,
  };

  const image: IFile = gig.images![0];

  const paymentDetails = {
    razorpay_payment_id,
    razorpay_order_id,
    razorpay_signature,
  };

  const order: IOrder = await Order.create({
    orderId: rString,
    amount: totalAmount,
    duration,
    gig: gigId,
    seller: gig.user._id,
    buyer: user._id,
    requirements,
    packageDetails,
    paymentDetails,
    image,
    gigTitle: gig.title,
    deliveryDate: Date.now() + duration * 24 * 60 * 60 * 1000,
  });

  return order;
};

// Update Order
export const updateOrder = catchAsyncErrors(async (req, res, next) => {});

// update order requirements
export const updateOrderRequirements = catchAsyncErrors(
  async (req, res, next) => {
    const { answers } = req.body;
    
    let order = await Order.findById(req.params.id).populate(
      "seller buyer",
      "name email"
    );

    if (!order) {
      return next(new ErrorHandler("Order not found with this Id", 404));
    }

    if (order.requirementsSubmitted) {
      return next(new ErrorHandler("Requirements already submitted", 400));
    }

    const requirements = order.requirements.map((requirement, index) => {
      const temp: IOrderRequirement = {
        questionTitle: requirement.questionTitle,
        questionType: requirement.questionType,
        answerRequired: requirement.answerRequired,
        multipleOptionSelect: requirement.multipleOptionSelect,
        options: [],
        files: [],
      };

      if (requirement.questionType === FREE_TEXT) {
        temp.answerText = answers[index].answerText;
        temp.files = answers[index].files;
      } else {
        temp.options = answers[index].options;
      }
      return temp;
    });

    order = await Order.findByIdAndUpdate(
      req.params.id,
      {
        requirements,
        requirementsSubmitted: true,
        requirementsSubmittedAt: Date.now(),
        status: "In Progress",
        deliveryDate: Date.now() + order.duration * 24 * 60 * 60 * 1000,
      },
      {
        new: true,
        runValidators: true,
        useFindAndModify: false,
      }
    )
      .populate("seller buyer", "name email")
      .exec();

    if (!order) {
      return next(new ErrorHandler("Order not found with this Id", 404));
    }

    // send email to seller
    try {
      await sendSendGridEmail({
        to: order.seller.email,
        subject: "New Order",
        templateId: "newOrder",
        data: {
          sellerName: order.seller.name,
          buyerName: order.buyer.name,
          gigTitle: order.gigTitle,
          orderId: order.orderId,
          orderAmount: order.amount,
          link: `${frontendHomeUrl}/orders/${order._id}`,
          deliveryDate: order.deliveryDate.toDateString(),
        },
        text: `You have a new order with order id ${order.orderId}`,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error, 400));
    }

    res.status(200).json({
      success: true,
      message: "Sucessfully update your order requirements",
      order,
    });
  }
);

// add order delivery
export const addOrderDelivery = catchAsyncErrors(async (req, res, next) => {
  const { message, files } = req.body;

  if (!message && !files?.length) {
    return next(new ErrorHandler("Please add a message or a file", 400));
  }

  let order = await Order.findById(req.params.id).populate(
    "seller buyer",
    "name email"
  );

  const buyerEmail = order?.buyer.email;

  if (!order) {
    return next(new ErrorHandler("Order not found with this Id", 404));
  }

  if (order.seller._id.toString() !== req.user?._id.toString()) {
    return next(
      new ErrorHandler(
        "You are not authorized to add delivery to this order",
        401
      )
    );
  }

  if (
    order.status !== "In Progress" &&
    order.status !== "In Revision" &&
    order.status !== "Delivered"
  ) {
    return next(
      new ErrorHandler(
        "You can only deliver an order which is in progress or in revision",
        400
      )
    );
  }

  order = await Order.findByIdAndUpdate(
    req.params.id,
    { $push: { deliveries: { message, files } }, status: "Delivered" },
    {
      new: true,
      runValidators: true,
      useFindAndModify: false,
    }
  ).populate("seller buyer", "name email avatar");

  if (!order) {
    return next(new ErrorHandler("Order not found with this Id", 404));
  }

  // send email to buyer about the delivery
  await sendSendGridEmail({
    to: order.buyer.email,
    subject: "Order Delivered",
    templateId: "orderDelivered",
    data: {
      buyerName: order.buyer.name,
      sellerName: order.seller.name,
      orderId: order.orderId,
      link: `${frontendHomeUrl}/orders/${order._id}`,
    },
    text: `${order.seller.name} has delivered your order with order id ${order.orderId}`,
  });

  res.status(200).json({
    success: true,
    message: "Sucessfully added your order delivery",
    order,
  });
});

// add order revision
export const addOrderRevision = catchAsyncErrors(async (req, res, next) => {
  const { message, files } = req.body;

  if (!message && !files?.length) {
    return next(new ErrorHandler("Please add a message or a file", 400));
  }

  let order = await Order.findById(req.params.id).populate(
    "seller buyer",
    "name email"
  );

  if (!order) {
    return next(new ErrorHandler("Order not found with this Id", 404));
  }

  const sellerEmail = order.seller.email;

  if (!order) {
    return next(new ErrorHandler("Order not found with this Id", 404));
  }

  if (order.buyer._id.toString() !== req.user?._id.toString()) {
    return next(
      new ErrorHandler(
        "You are not authorized to add revision to this order",
        401
      )
    );
  }

  if (order.deliveryDate.getTime() < Date.now()) {
    return next(
      new ErrorHandler("Order already passed its expected delivery date", 400)
    );
  }

  if (order.status !== "Delivered") {
    return next(
      new ErrorHandler(
        "You can only request a revision if your order is delivered",
        400
      )
    );
  }

  if (order.revisions.length > order.packageDetails.revisions) {
    return next(
      new ErrorHandler(
        "You have already requested the maximum number of revisions",
        400
      )
    );
  }

  order = await Order.findByIdAndUpdate(
    req.params.id,
    { $push: { revisions: { message, files } }, status: "In Revision" },
    {
      new: true,
      runValidators: true,
      useFindAndModify: false,
    }
  ).populate("seller buyer", "name email avatar");

  if (!order) {
    return next(new ErrorHandler("Order not found with this Id", 404));
  }

  // send email to seller about the revision
  await sendSendGridEmail({
    to: order.seller.email,
    subject: "Revision Requested",
    templateId: "revisionRequested",
    data: {
      sellerName: order.seller.name,
      buyerName: order.buyer.name,
      orderId: order.orderId,
      link: `${frontendHomeUrl}/orders/${order._id}`,
    },
    text: `${order.buyer.name} has requested a revision for order with order id ${order.orderId}`,
  });

  res.status(200).json({
    success: true,
    message: "Sucessfully added your order revision",
    order,
  });
});

// order completed
export const markOrderAsCompleted = catchAsyncErrors(async (req, res, next) => {
  let order = await Order.findById(req.params.id).populate(
    "seller buyer",
    "name email avatar"
  );

  if (!order) {
    return next(new ErrorHandler("Order not found with this Id", 404));
  }

  const buyerEmail = order.buyer.email;
  const sellerEmail = order.seller.email;

  if (!order) {
    return next(new ErrorHandler("Order not found with this Id", 404));
  }

  if (order.buyer._id.toString() !== req.user?._id.toString()) {
    return next(
      new ErrorHandler("You are not authorized to complete this order", 401)
    );
  }

  if (order.status !== "Delivered") {
    return next(
      new ErrorHandler("You can only complete an order which is delivered", 400)
    );
  }

  order = await Order.findByIdAndUpdate(
    req.params.id,
    { status: "Completed", completedAt: Date.now() },
    {
      new: true,
      runValidators: true,
      useFindAndModify: false,
    }
  ).populate("seller buyer", "name email avatar");

  if (!order) {
    return next(new ErrorHandler("Order not found with this Id", 404));
  }

  // adding balance to seller's account
  const seller = await User.findById(order.seller._id);

  if (!seller) {
    return next(new ErrorHandler("Seller not found with this Id", 404));
  }

  seller.balance += order.amount;
  if (seller.balance > 2000) seller.withdrawEligibility = true;
  seller.lastDelivery = new Date();
  await seller.save({ validateBeforeSave: false });

  // send email to seller
  await sendSendGridEmail({
    to: order.seller.email,
    subject: "Order Completed",
    templateId: "orderCompleted",
    data: {
      sellerName: order.seller.name,
      buyerName: order.buyer.name,
      orderId: order.orderId,
      link: `${frontendHomeUrl}/orders/${order._id}`,
    },
    text: `${order.buyer.name} has marked your order with order id ${order.orderId} as completed`,
  });

  res.status(200).json({
    success: true,
    message: "Sucessfully completed your order",
    order,
  });
});

// Get order detail
export const getOrderDetails = catchAsyncErrors(async (req, res, next) => {
  let order = await Order.findById(req.params.id)
    .populate("seller buyer", "name email avatar")
    .select(
      "+buyerFeedback.comment +buyerFeedback.communication +buyerFeedback.recommend +buyerFeedback.service +sellerFeedback.comment +sellerFeedback.rating"
    );

  if (!order) {
    return next(new ErrorHandler("Order not found with this Id", 404));
  }

  const { buyer, seller } = order;

  if (
    req.user?._id.toString() !== buyer._id.toString() &&
    req.user?.id.toString() !== seller._id.toString()
  ) {
    return next(
      new ErrorHandler("You are not authorized to view this order", 401)
    );
  }

  if (order.status !== "Completed") {
    order.buyerFeedback = undefined;
    order.sellerFeedback = undefined;
  }

  if (
    order.status === "Completed" &&
    seller._id.toString() === req.user!._id.toString()
  ) {
    if (order.buyerFeedbackSubmitted && !order.sellerFeedbackSubmitted) {
      order.buyerFeedback = undefined;
      order.sellerFeedback = undefined;
    }
  }

  if (
    order.status === "Completed" &&
    buyer._id.toString() === req.user!._id.toString()
  ) {
    if (!order.sellerFeedbackSubmitted) {
      order.sellerFeedback = undefined;
    }
  }

  res.status(200).json({
    success: true,
    message: "Sucessfully found your order",
    order,
  });
});

// Get logged in user orders
export const myOrders = catchAsyncErrors(async (req, res, next) => {
  const { status } = req.body;
  const userId = req.user!._id;
  const orders = await Order.find({
    $or: [
      { buyer: userId },
      {
        seller: userId,
        status: { $ne: "Pending" },
      },
    ],
    status: status ? status : { $ne: "Deleted" },
  })
    // .or({ buyer: req.user._id })
    .populate("gig", "title images")
    .populate("seller buyer", "name avatar")
    .sort("-createdAt");

  res.status(200).json({
    success: true,
    message: "Sucessfully found your orders",
    orders,
  });
});

// add buyer feedback
export const addBuyerFeedback = catchAsyncErrors(async (req, res, next) => {
  const { communication, service, recommend, comment } = req.body;

  const order = await Order.findById(req.params.id).populate(
    "seller buyer",
    "name email"
  );

  if (!order) {
    return next(new ErrorHandler("Order not found with this Id", 404));
  }

  if (order.buyer._id.toString() !== req.user!._id.toString()) {
    return next(
      new ErrorHandler(
        "You are not authorized to add feedback to this order",
        401
      )
    );
  }

  if (order.status !== "Completed") {
    return next(
      new ErrorHandler(
        "You can only add feedback to an order which is completed",
        400
      )
    );
  }

  if (order.buyerFeedbackSubmitted) {
    return next(
      new ErrorHandler("You have already added feedback to this order", 400)
    );
  }

  const buyerFeedback: IBuyerFeedback = {
    communication,
    service,
    recommend,
    comment,
    createdAt: new Date(),
  };

  const updatedOrder = await Order.findByIdAndUpdate(
    req.params.id,
    { buyerFeedback, buyerFeedbackSubmitted: true },
    { new: true, runValidators: true, useFindAndModify: false }
  ).populate("seller buyer", "name email avatar");

  res.status(200).json({
    success: true,
    message: "Sucessfully added your feedback",
    order: updatedOrder,
  });
});

// add seller feedback
export const addSellerFeedback = catchAsyncErrors(async (req, res, next) => {
  const { rating, comment } = req.body;

  let order = await Order.findById(req.params.id)
    .populate("seller buyer", "name email avatar")
    .select(
      "+buyerFeedback.comment +buyerFeedback.communication +buyerFeedback.recommend +buyerFeedback.service  +sellerFeedback.comment +sellerFeedback.rating"
    );

  if (!order) {
    return next(new ErrorHandler("Order not found with this Id", 404));
  }
  if (order.seller._id.toString() !== req.user!._id.toString()) {
    return next(
      new ErrorHandler(
        "You are not authorized to add feedback as a seller to this order",
        401
      )
    );
  }

  if (order.status !== "Completed") {
    return next(
      new ErrorHandler(
        "You can only add feedback to an order which is completed",
        400
      )
    );
  }

  if (!order.buyerFeedbackSubmitted) {
    return next(
      new ErrorHandler(
        "You can only add feedback after the buyer has added feedback",
        400
      )
    );
  }

  if (order.sellerFeedbackSubmitted) {
    return next(
      new ErrorHandler("You have already added feedback to this order", 400)
    );
  }

  const sellerFeedback: ISellerFeedback = {
    rating,
    comment,
    createdAt: new Date(),
  };

  order = await Order.findByIdAndUpdate(
    req.params.id,
    { sellerFeedback, sellerFeedbackSubmitted: true },
    { new: true, runValidators: true, useFindAndModify: false }
  )
    .populate("seller buyer", "name email avatar country ")
    .select(
      "+buyerFeedback.comment +buyerFeedback.communication +buyerFeedback.recommend +buyerFeedback.service +sellerFeedback.comment +sellerFeedback.rating"
    );

  if (!order) {
    return next(new ErrorHandler("Order not found with this Id", 404));
  }

  const buyer = await User.findById(order.buyer._id);
  const seller = await User.findById(order.seller._id);
  const gig = await Gig.findById(order.gig);

  if (!buyer) {
    return next(new ErrorHandler("Buyer not found with this Id", 404));
  }

  if (!seller) {
    return next(new ErrorHandler("Seller not found with this Id", 404));
  }

  if (!gig) {
    return next(new ErrorHandler("Gig not found with this Id", 404));
  }

  const reviewForSeller: IReview = {
    user: order.buyer._id,
    name: order.buyer.name,
    avatar: order.buyer.avatar,
    country: order.buyer.country,
    rating: Math.round(
      Number(
        (Number(order.buyerFeedback?.communication) +
          Number(order.buyerFeedback?.service) +
          Number(order.buyerFeedback?.recommend)) /
          3
      )
    ),
    comment: order.buyerFeedback?.comment!,
  };

  const reviewForBuyer: IReview = {
    user: order.seller._id,
    name: order.seller.name,
    avatar: order.seller.avatar,
    country: order.seller.country,
    rating: rating,
    comment: comment,
  };

  if (reviewForSeller.comment) gig.reviews?.push(reviewForSeller);
  gig.numOfReviews = gig.reviews?.length ?? 0;
  gig.numOfRatings = gig.numOfRatings + 1;

  if (reviewForSeller.comment) seller.reviews.push(reviewForSeller);
  seller.numOfRatings += 1;
  seller.numOfReviews = seller.reviews.length;

  if (reviewForBuyer.comment) buyer.reviews.push(reviewForBuyer);
  buyer.numOfRatings += 1;
  buyer.numOfReviews = buyer.reviews.length;

  const newRatingsGig =
    (gig.ratings * (gig.numOfRatings - 1) + reviewForSeller.rating) /
    gig.numOfRatings;

  const newRatingsSeller =
    (seller.ratings * (seller.numOfRatings - 1) + reviewForSeller.rating) /
    seller.numOfRatings;

  const newRatingsBuyer =
    (buyer.ratings * (buyer.numOfRatings - 1) + reviewForBuyer.rating) /
    buyer.numOfRatings;

  gig.ratings = newRatingsGig;
  seller.ratings = newRatingsSeller;
  buyer.ratings = newRatingsBuyer;

  await gig.save({ validateBeforeSave: false });
  await seller.save({ validateBeforeSave: false });
  await buyer.save({ validateBeforeSave: false });

  res.status(200).json({
    success: true,
    message: "Sucessfully added your feedback",
    order,
  });
});

// Get all orders -- Admin
export const getAllOrders = catchAsyncErrors(async (req, res, next) => {
  const orders = await Order.find();

  let totalAmount = 0;
  orders.forEach((order) => {
    totalAmount += order.amount;
  });

  res.status(200).json({
    success: true,
    message: "Sucessfully fetched all orders",
    totalAmount,
    orders,
  });
});

// Update order status -- Admin
export const updateOrderStatus = catchAsyncErrors(async (req, res, next) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    return next(new ErrorHandler("Order not found with this Id", 404));
  }

  if (order.status == "Completed") {
    return next(new ErrorHandler("Order already completed", 400));
  }

  order.status = req.body.status;

  await order.save({ validateBeforeSave: false });

  res.status(200).json({
    success: true,
    message: "Sucessfully fetched all orders",
    order,
  });
});

// process payment
export const packagePayment = catchAsyncErrors(async (req, res, next) => {
  const { packageNumber, gigId } = req.body;

  if (packageNumber === undefined || packageNumber < 0 || packageNumber > 2) {
    return next(new ErrorHandler("Please select a package", 400));
  }

  const gig = await Gig.findById(gigId);

  if (!gig) {
    return next(new ErrorHandler("Gig not found with this Id", 404));
  }

  const price = Number(gig.pricing![packageNumber].packagePrice);

  const serviceFee = Number(Number(price * 0.21).toFixed(2));

  const totalAmount = (price + serviceFee).toFixed(2);

  const options = {
    amount: Number(totalAmount) * 100,
    currency: "INR",
  };

  const order = await razorpayInstance.orders.create(options);

  res.status(201).json({
    success: true,
    message: "Payment Intent created Sucessfully",
    order,
  });
});

// payment verification
export const paymentVerification = catchAsyncErrors(async (req, res, next) => {
  const { razorpay_payment_id, razorpay_order_id, razorpay_signature, gigId, packageNumber } =
    req.body;

  if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature) {
    return next(
      new ErrorHandler("Please provide payment id, order id and signature", 400)
    );
  }

  const hmac_sha256 = (message: string, key: string) => {
    return crypto.createHmac("sha256", key).update(message).digest("hex");
  };

  const generated_signature = hmac_sha256(
    razorpay_order_id + "|" + razorpay_payment_id,
    process.env.RAZORPAY_KEY_SECRET!
  );

  if (generated_signature !== razorpay_signature) {
    return next(new ErrorHandler("Payment not verified", 400));
  }

  try {
    const order = await newOrder(req.user!, req.body);
    res.status(200).json({
      success: true,
      order,
    });
  } catch (error: any) {
    return next(new ErrorHandler(error, 400));
  }
});

export const checkout = async (req: Request, res: Response) => {
  const { amount } = req.body;

  if (!amount) {
    return res.status(400).json({
      success: false,
      message: "Please provide amount",
    });
  }

  const options = {
    amount: Number(amount) * 100,
    currency: "INR",
  };

  const order = await razorpayInstance.orders.create(options);

  res.status(201).json({
    success: true,
    message: "Payment Intent created Sucessfully",
    order,
  });
};

export const getStripePublishableKey = catchAsyncErrors(
  async (req, res, next) => {
    res.status(200).json({
      stripePublishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
    });
  }
);

export const deleteAllOrders = catchAsyncErrors(async (req, res, next) => {
  await Order.deleteMany();

  res.status(200).json({
    success: true,
    message: "Sucessfully deleted all orders",
  });
});
