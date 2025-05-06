import React, { useEffect, useState } from "react";
import "../../component/common.css";
import { BsFacebook, BsInstagram } from "react-icons/bs";
import { FaGooglePlay } from "react-icons/fa";
import { Link, useLocation } from "react-router-dom";

// List of paths where footer will be hidden
const pathsWithoutFooter = [
  "/get/all/messages/for/current/user",
  "/gig/create/new/gig",
  "/login",
  "/signUp",
  "/orders/",
  "/update/profile",
  "/reset/password/",
];

export const Footer = () => {
  const location = useLocation();
  const [hideFooter, setHideFooter] = useState(false);

  useEffect(() => {
    const hideFooter = pathsWithoutFooter.includes(location.pathname);
    setHideFooter(hideFooter);
  }, [location.pathname])

  return (
    !hideFooter &&
    <footer className="px-6 py-6 text-light_heading border-t w-full">
      <div className="flex items-center gap-12 justify-between">
        <div className="flex gap-2">
          <h4 className="font-[Pacifico,cursive] font-semibold text-2xl">
            FreelanceMe
          </h4>
        </div>
        <div className="text-xl  flex items-center gap-4">
          <Link to={''} className="p-2 hover:bg-dark_separator rounded-full">
            <BsFacebook className="" />
          </Link>
          <Link to={''} className="p-2 hover:bg-dark_separator rounded-full">
            <BsInstagram />
          </Link>
          <Link to={''} className="p-2 hover:bg-dark_separator rounded-full">
            <FaGooglePlay />
          </Link>
        </div>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-4">
        <a className="hover:underline" href='https://merchant.razorpay.com/policy/MZVm52OK1UYuZe/privacy'>
          Privacy Policy
        </a>

        <a className="hover:underline" href='https://merchant.razorpay.com/policy/MZVm52OK1UYuZe/terms'>
          Terms and Conditions
        </a>

        <a className="hover:underline" href='https://merchant.razorpay.com/policy/MZVm52OK1UYuZe/refund'>
          Cancellation and Refund Policy
        </a>

        <a className="hover:underline" href='https://merchant.razorpay.com/policy/MZVm52OK1UYuZe/shipping'>
          Shipping and Delivery
        </a>

        <a className="hover:underline" href='https://merchant.razorpay.com/policy/MZVm52OK1UYuZe/contact_us'>
          Contact Us
        </a>
      </div>
    </footer>
  );
};
