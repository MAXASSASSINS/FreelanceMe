import React, { useState } from "react";

export const ResetPassword = () => {
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");

  const handleResetPassword = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert("Password and confirm password does not match");
      return;
    }
  };

  return (
    <div className="p-8 mt-20 md:mt-40 col-md-4 offset-md-4">
      <div className="text-center">
        <h2 className="text-4xl">Reset Password</h2>
      </div>
      <form className="mt-8 flex flex-col gap-4" onSubmit={handleResetPassword}>
        <div className="form-group">
          <label className="mb-2" htmlFor="password">
            Password
          </label>
          <input
            onChange={(e) => setPassword(e.target.value)}
            id="password"
            type="password"
             className="form-control"
            required
          />
        </div>
        <div className="form-group">
          <label className="mb-2" htmlFor="confirm_password">
            Confirm Password
          </label>
          <input
            onChange={(e) => setConfirmPassword(e.target.value)}
            id="confirm_password"
            type="password"
             className="form-control"
            required
          />
        </div>
        <div className="form-group">
          <button className="btn bg-primary text-white hover:bg-primary_hover hover:cursor-pointer">
            Submit
          </button>
        </div>
      </form>
    </div>
  );
};
