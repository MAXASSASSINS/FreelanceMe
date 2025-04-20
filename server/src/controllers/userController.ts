import crypto from "crypto";
import mongoose from "mongoose";
import { Accounts } from "razorpay/dist/types/accounts";
import { Products } from "razorpay/dist/types/products";
import { Stakeholders } from "razorpay/dist/types/stakeholders";
import { frontendHomeUrl } from "../index";
import catchAsyncErrors from "../middleware/catchAsyncErrors";
import Gig from "../models/gigModel";
import Order from "../models/orderModel";
import User from "../models/userModel";
import { IRazorPayAccountDetails } from "../types/user.types";
import ErrorHandler from "../utils/errorHandler";
import sendToken from "../utils/jwtToken";
import { razorpayInstance } from "../utils/razorpay";
import { sendSendGridEmail } from "../utils/sendEmail";

// Register our user
export const registerUser = catchAsyncErrors(async (req, res, next) => {
  const { name, email, password, confirmPassword } = req.body;

  if (!name || !email || !password || !confirmPassword) {
    return next(new ErrorHandler("Please provide all the details", 400));
  }

  if (password && confirmPassword && password !== confirmPassword) {
    return next(
      new ErrorHandler("Password and confirm passowrd does not match", 400)
    );
  }

  let user = await User.findOne({ email });
  if (!user) {
    user = await User.create({
      name,
      email,
      password,
    });
  } else if (user.isEmailVerified) {
    return next(new ErrorHandler("User already exists", 400));
  }
  const emailVerificationToken = user.getEmailVerifyToken();
  await user.save({
    validateBeforeSave: false,
  });

  const emailVerificationURL = `${req.protocol}://${req.get(
    "host"
  )}/verifyEmail/${emailVerificationToken}/${user.id}`;

  const message = `Your verify email token is :- \n\n ${emailVerificationURL} \n\n if you have not requested this email then, please ignore it`;

  try {
    await sendSendGridEmail({
      to: user.email,
      subject: "Email Verification Request",
      templateId: "verifyEmail",
      data: {
        username: user.name,
        verifyEmailURL: emailVerificationURL,
      },
      text: message,
    });
    res.status(200).json({
      success: true,
      message: `Verification email has been sent to your email.`,
    });
  } catch (error) {
    user.emailVerificationToken = undefined;
    user.emailVerificationExpire = undefined;
    await user.save({ validateBeforeSave: false });
    return next(new ErrorHandler("error.message", 500));
  }
});

// Login our User
export const loginUser = catchAsyncErrors(async (req, res, next) => {
  const { email, password } = req.body;

  // checking if user has given both email and password
  if (!email || !password) {
    return next(new ErrorHandler("Please enter email and password", 400));
  }

  const user = await User.findOne({ email }).select(
    "+email +password +role +phone.code +phone.number +balance +withdrawEligibility +razorPayAccountDetails.status +razorPayAccountDetails.accountHolderName +favouriteGigs +resetPasswordToken +resetPasswordExpire +emailVerificationToken +emailVerificationExpire +isEmailVerified"
  );

  if (!user) {
    return next(new ErrorHandler("Invalid email or password", 401));
  }

  const isPasswordMatched = await user.comparePassword(password);

  if (!isPasswordMatched) {
    return next(new ErrorHandler("Invalid email or password", 401));
  }

  if (!user.isEmailVerified) {
    return next(
      new ErrorHandler("Please verify your email to activate your account", 401)
    );
  }

  sendToken(user, 200, res);
});

// Logout
export const logout = catchAsyncErrors(async (req, res, next) => {
  res.cookie("token", null, {
    expires: new Date(Date.now()),
    httpOnly: true,
  });

  res.status(200).json({
    success: true,
    message: "Successfully logged out",
  });
});

// Forgot Password
export const forgotPassword = catchAsyncErrors(async (req, res, next) => {
  if (!req.body.email) {
    return next(new ErrorHandler("Please provide your email", 400));
  }
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return next(new ErrorHandler("You are not registered", 404));
  }

  // Get Reset Password Token
  const resetToken = user.getResetPasswordToken();

  await user.save({ validateBeforeSave: false });

  const resetPasswordURL = `${req.protocol}://${req.get(
    "host"
  )}/forgotPassword/${resetToken}`;

  const message = `Your password reset token is :- \n\n ${resetPasswordURL} \n\n if you have not requested this email then, please ignore it`;

  try {
    await sendSendGridEmail({
      to: user.email,
      subject: "Reset Password Request",
      templateId: "resetPassword",
      data: {
        username: user.name,
        resetPasswordURL,
      },
      text: message,
    });
    res.status(200).json({
      success: true,
      message: `A password reset link has been sent to your email.`,
    });
  } catch (error) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save({ validateBeforeSave: false });

    return next(new ErrorHandler("error.message", 500));
  }
});

// Reset Password
export const resetPassword = catchAsyncErrors(async (req, res, next) => {
  if (!req.body.password || !req.body.confirm_password) {
    return res.render("error", {
      error: "Please provide password and confirm password",
    });
  }
  // Creating token hash
  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) {
    return res.render("error", {
      error: "Reset password token is invalid or has been expired",
    });
  }

  console.log(user);

  if (req.body.password != req.body.confirm_password) {
    return res.render("error", {
      error: "Password is not matching with confirm password",
    });
  }

  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;

  await user.save({
    validateBeforeSave: false,
  });

  res.clearCookie("token").redirect(frontendHomeUrl!);
});

export const resetPasswordForm = catchAsyncErrors(async (req, res, next) => {
  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) {
    return res.render("error", {
      error: "Reset password token is invalid or has been expired",
    });
  }

  return res.render("changePassword");
});

// Get my details
export const getMyDetails = catchAsyncErrors(async (req, res, next) => {
  const user = req.user;

  if (!user) {
    return next(new ErrorHandler("User not found", 404));
  }

  res.status(200).json({
    success: true,
    message: "Successfully fetched your details",
    user,
  });
});

// Change password
export const changePassword = catchAsyncErrors(async (req, res, next) => {
  const user = req.user;
  if (!user) {
    return next(new ErrorHandler("User not found", 404));
  }
  const isPasswordMatched = await user.comparePassword(req.body.oldPassword);

  if (!isPasswordMatched) {
    return next(new ErrorHandler("Old password is incorrect", 400));
  }

  if (req.body.newPassword !== req.body.confirmPassword) {
    return next(
      new ErrorHandler("password does not match with confirm password", 400)
    );
  }

  user.password = req.body.newPassword;

  await user.save();

  sendToken(user, 200, res);
});

// Get All Users -- admin
export const getAllUsers = catchAsyncErrors(async (req, res, next) => {
  const users = await User.find();

  res.status(200).json({
    success: true,
    message: "Successfully fetched all users",
    users,
  });
});

// Get single user
export const getUser = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(
      new ErrorHandler(`user does not exist with id: ${req.params.id}`, 400)
    );
  }

  res.status(200).json({
    success: true,
    message: "Successfully fetched user",
    user,
  });
});

// Update user data
export const updateUser = catchAsyncErrors(async (req, res, next) => {
  let user = req.user;

  if (!user) {
    return next(
      new ErrorHandler(`user does not exist with id: ${req.params.id}`, 400)
    );
  }

  let updatedUser = await User.findByIdAndUpdate(req.user?.id, req.body, {
    new: true,
    runValidators: true,
    useFindandModify: false,
  });

  res.status(200).json({
    success: true,
    message: "User details updated sucessfully",
    user: updatedUser,
  });
});

export const withdrawl = catchAsyncErrors(async (req, res, next) => {
  const { amount } = req.body;

  if (!amount) {
    return next(new ErrorHandler("Please provide amount", 400));
  }

  if (!req.user?.withdrawEligibility) {
    return next(new ErrorHandler("Minimum balance for withdrawl is 2000", 400));
  }

  if (amount > req.user.balance) {
    return next(new ErrorHandler("Amount is greater than balance", 400));
  }

  const orders = await Order.find({
    seller: req.user.id,
    status: "Completed",
  });

  let transferAmount = 0;
  const transfers = [];
  for (let i = 0; i < orders.length && transferAmount < amount; i++) {
    const order = orders[i];
    const paymentId = order.paymentDetails.razorpay_payment_id;
    if (!paymentId) {
      return next(new ErrorHandler("Payment id is not found", 400));
    }
    if (order.transferredAmount < order.amount && transferAmount < amount) {
      let tfa = Math.min(
        order.amount - order.transferredAmount,
        amount - transferAmount
      );
      transferAmount += tfa;
      order.transferredAmount += tfa;
      const transfer = await razorpayInstance.payments.transfer(paymentId, {
        transfers: [
          {
            account: req.user.razorPayAccountDetails.accountId,
            amount: tfa * 100,
            currency: "INR",
            // on_hold: 1,
            // on_hold_until: 1671222870,
          },
        ],
      });
      transfers.push(transfer);
      await order.save({
        validateBeforeSave: false,
      });
    }
  }

  req.user.balance -= transferAmount;
  await req.user.save({
    validateBeforeSave: false,
  });

  return res.status(200).json({
    success: true,
    message: "Withdrawl request is successful",
    user: req.user,
  });
});

export const updateFavouriteList = catchAsyncErrors(async (req, res, next) => {
  const gigId = req.params.id;

  const gig = await Gig.findById(gigId);

  if (!gig) {
    return next(new ErrorHandler("Gig does not exist", 404));
  }

  const user = req.user;

  if (!user) {
    return next(new ErrorHandler("User does not exist", 404));
  }

  let isFavourite = false;
  const gigObjectId = new mongoose.Types.ObjectId(gigId);

  if (user?.favouriteGigs.includes(gigObjectId)) {
    user.favouriteGigs.splice(user.favouriteGigs.indexOf(gigObjectId), 1);
  } else {
    isFavourite = true;
    user?.favouriteGigs.push(gigObjectId);
  }

  await user?.save({
    validateBeforeSave: false,
  });
  res.status(200).json({
    success: true,
    message: "Favourite list is updated",
    isFavourite,
  });
});

export const addAccount = catchAsyncErrors(async (req, res, next) => {
  const {
    accountHolderName,
    accountNumber,
    ifscCode,
    beneficiaryName,
    street1,
    street2,
    city,
    state,
    postalCode,
    country,
    panNumber,
  } = req.body;

  if (
    !accountHolderName ||
    !accountNumber ||
    !ifscCode ||
    !beneficiaryName ||
    !street1 ||
    !street2 ||
    !city ||
    !state ||
    !postalCode ||
    !country ||
    !panNumber
  ) {
    return next(new ErrorHandler("Please provide all the details", 400));
  }
  const user = req.user;
  if (!user) {
    return next(new ErrorHandler("User does not exist", 404));
  }

  if (user.razorPayAccountDetails.accountId) {
    return next(new ErrorHandler("You have already added your account", 400));
  }

  // const email = "a43433342f31332234434493343444343354@gmail.com";

  // creating linked account
  try {
    const createAccPayload: Accounts.RazorpayAccountCreateRequestBody = {
      email: req.user?.email!,
      phone: user.phone!.number!,
      type: "route",
      legal_business_name: user.name,
      contact_name: user.name,
      business_type: "individual",
      profile: {
        category: "services",
        subcategory: "professional_services",
        addresses: {
          registered: {
            street1,
            street2,
            city,
            state,
            country,
            postal_code: postalCode.to_string(),
          },
        },
      },
      legal_info: {
        pan: panNumber,
      },
    };
    const acc = await razorpayInstance.accounts.create(createAccPayload);
    user.razorPayAccountDetails.accountId = acc.id;
    await user.save({
      validateBeforeSave: false,
    });
  } catch (err: any) {
    return next(new ErrorHandler(err.error, 400));
  }

  // creating stakeholder account
  try {
    const createStackholderPayload: Stakeholders.RazorpayStakeholderCreateRequestBody =
      {
        email: req.user?.email!,
        name: accountHolderName.to_string(),
        phone: {
          primary: user.phone!.number!,
        },
        kyc: {
          pan: panNumber,
        },
      };
    const stakeholder = await razorpayInstance.stakeholders.create(
      user.razorPayAccountDetails.accountId,
      createStackholderPayload
    );
    user.razorPayAccountDetails.stakeholderId = stakeholder.id;
    user.razorPayAccountDetails.accountHolderName = accountHolderName;
    await user.save({
      validateBeforeSave: false,
    });
  } catch (err: any) {
    return next(new ErrorHandler(err.error, 400));
  }

  // request product configuration
  try {
    const requestProductPayload: Products.RazorpayProductCreateRequestBody = {
      product_name: "route",
      tnc_accepted: true,
      ip: req.socket.remoteAddress!,
    };
    const product = await razorpayInstance.products.requestProductConfiguration(
      user.razorPayAccountDetails.accountId,
      requestProductPayload
    );
    user.razorPayAccountDetails.productId = product.id;
    await user.save({
      validateBeforeSave: false,
    });
  } catch (err: any) {
    return next(new ErrorHandler(err.error, 400));
  }

  // update product configuration
  try {
    const updateProductPayload = {
      settlements: {
        account_number: accountNumber,
        ifsc_code: ifscCode,
        beneficiary_name: beneficiaryName,
      },
    };
    const productAfter = await razorpayInstance.products.edit(
      user.razorPayAccountDetails.accountId,
      user.razorPayAccountDetails.productId,
      updateProductPayload
    );
    user.razorPayAccountDetails.status =
      productAfter.activation_status as IRazorPayAccountDetails["status"];
    await user.save({
      validateBeforeSave: false,
    });
  } catch (err: any) {
    return next(new ErrorHandler(err.error, 400));
  }

  res.status(200).json({
    success: true,
    message: "Account is under review.",
    user,
  });
});

export const getAccount = catchAsyncErrors(async (req, res, next) => {
  const user = req.user;
  if (!user) {
    return next(new ErrorHandler("User does not exist", 404));
  }
  if (!user.razorPayAccountDetails.accountId) {
    return next(new ErrorHandler("You have not added your account", 400));
  }
  const acc = await razorpayInstance.accounts.fetch(
    user.razorPayAccountDetails.accountId
  );

  const configuration = await razorpayInstance.products.fetch(
    user.razorPayAccountDetails.accountId,
    user.razorPayAccountDetails.productId
  );

  const beneficiary_nameRequired = configuration.requirements.filter((req) =>
    req.field_reference.includes("beneficiary_name")
  );

  const account_numberRequired = configuration.requirements.filter((req) =>
    req.field_reference.includes("account_number")
  );

  const ifsc_codeRequired = configuration.requirements.filter((req) =>
    req.field_reference.includes("ifsc_code")
  );

  res.status(200).json({
    success: true,
    message: "Account is fetched",
    account: {
      accountHolderName: user.razorPayAccountDetails.accountHolderName,
      accountNumber:
        configuration.active_configuration.settlements.account_number,
      ifscCode: configuration.active_configuration.settlements.ifsc_code,
      beneficiaryName:
        configuration.active_configuration.settlements.beneficiary_name,
      street1: acc.profile.addresses?.registered?.street1,
      street2: acc.profile.addresses?.registered?.street2,
      city: acc.profile.addresses?.registered?.city,
      state: acc.profile.addresses?.registered?.state,
      postalCode: acc.profile.addresses?.registered?.postal_code,
      country: acc.profile.addresses?.registered?.country,
      panNumber: acc.legal_info?.pan,
      requirements: {
        beneficiaryName: beneficiary_nameRequired.length > 0,
        accountNumber: account_numberRequired.length > 0,
        ifscCode: ifsc_codeRequired.length > 0,
      },
    },
  });
});

export const getProductConfig = catchAsyncErrors(async (req, res, next) => {
  const user = req.user;
  if (!user) {
    return next(new ErrorHandler("User does not exist", 404));
  }
  if (!user.razorPayAccountDetails.accountId) {
    return next(new ErrorHandler("You have not added your account", 400));
  }
  if (!user.razorPayAccountDetails.productId) {
    return next(new ErrorHandler("You have not added your account", 400));
  }
  const product = await razorpayInstance.products.fetch(
    user.razorPayAccountDetails.accountId,
    user.razorPayAccountDetails.productId
  );
  res.status(200).json({
    success: true,
    message: "Product configuration is fetched",
    product,
  });
});

export const updateAccount = catchAsyncErrors(async (req, res, next) => {
  const {
    accountHolderName,
    accountNumber,
    ifscCode,
    beneficiaryName,
    street1,
    street2,
    city,
    state,
    postalCode,
    country,
    panNumber,
  } = req.body;

  if (
    !accountHolderName ||
    !accountNumber ||
    !ifscCode ||
    !beneficiaryName ||
    !street1 ||
    !street2 ||
    !city ||
    !state ||
    !postalCode ||
    !country ||
    !panNumber
  ) {
    return next(new ErrorHandler("Please provide all the details", 400));
  }
  const user = req.user;
  if (!user) {
    return next(new ErrorHandler("User does not exist", 404));
  }
  if (!user.razorPayAccountDetails.accountId) {
    return next(new ErrorHandler("You have not added your account", 400));
  }
  if (!user.razorPayAccountDetails.productId) {
    return next(new ErrorHandler("You have not added your account", 400));
  }

  const configuration = razorpayInstance.products
    .edit(
      user.razorPayAccountDetails.accountId,
      user.razorPayAccountDetails.productId,
      {
        settlements: {
          account_number: accountNumber,
          ifsc_code: ifscCode,
          beneficiary_name: beneficiaryName,
        },
        tnc_accepted: true,
      }
    )
    .then(() => {
      res.status(200).json({
        success: true,
        message: "Your account is under review",
      });
    })
    .catch((err) => {
      if (err.error?.description.includes("admin")) {
        user.razorPayAccountDetails.status = "under_review";
        user.save({
          validateBeforeSave: false,
        });
        return res.status(200).json({
          success: true,
          message: "Your account is under review",
          user,
        });
      }
      return next(new ErrorHandler(err.error.description, 400));
    });
});

export const updateAccountStatus = catchAsyncErrors(async (req, res, next) => {
  const secret = process.env.RAZORPAY_KEY_SECRET;

  const shasum = crypto.createHmac("sha256", secret!);
  shasum.update(JSON.stringify(req.body));
  const digest = shasum.digest("hex");

  if (digest !== req.headers["x-razorpay-signature"]) {
    return next(new ErrorHandler("Invalid signature", 400));
  } else {
    console.log("signature matched");
  }

  return res.json({
    status: "ok",
  });
});

export const verifyEmail = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findOne({
    _id: req.params.userId,
    emailVerificationExpire: { $gt: Date.now() },
  });

  if (!user) {
    return res.render("error", {
      error: "Link is invalid or has been expired",
    });
  }

  const token = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  const emailVerificationToken = user.emailVerificationToken?.toString();

  if (!emailVerificationToken) {
    return res.render("error", {
      error: "No email verification token found",
    });
  }

  if (emailVerificationToken !== token) {
    return res.render("error", {
      error: "Link is invalid or has been expired",
    });
  }

  user.isEmailVerified = true;
  user.emailVerificationToken = undefined;
  user.emailVerificationExpire = undefined;
  await user.save({ validateBeforeSave: false });
  return res.render("success", {
    message: "Your email has been verified successfully",
  });
});
