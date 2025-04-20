import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { IoIosClose } from "react-icons/io";
import { useSelector } from "react-redux";
import {
  useGlobalLoading,
  useUpdateGlobalLoading,
} from "../../context/globalLoadingContext";
import { StepProps, StepRef } from "../../Pages/CreateGig";
import { RootState } from "../../store";
import { axiosInstance } from "../../utility/axiosInstance";
import {
  CountryWithPhoneCodes,
  countryWithPhoneCodesData,
} from "./CountryPhoneCode";

type Step6Props = {};

const Step6 = ({ handleSendData }: StepProps, ref: React.Ref<StepRef>) => {
  const updateGlobalLoading = useUpdateGlobalLoading();
  const { gigDetail } = useSelector((state: RootState) => state.gigDetail);
  const [showVerifyPhoneNumberModal, setShowVerifyPhoneNumberModal] =
    useState(false);
  const [country, setCountry] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [filteredCountries, setFilteredCountries] = useState(
    countryWithPhoneCodesData
  );
  const [dialCode, setDialCode] = useState("");
  const [showCountryDropdown, setShowCountryDropdown] = useState(true);
  const [verificationCode, setVerificationCode] = useState("");
  const [showVerifyCodeInput, setShowVerifyCodeInput] = useState(false);
  const verificationCodeErrorRef = useRef<HTMLParagraphElement>(null);
  const invalidPhoneNumberRef = useRef<HTMLDivElement>(null);

  // FINAL STEP
  const [showGigPublishFinalModal, setShowGigPublishFinalModal] =
    useState(false);
  const [verifiedStatusOfSeller, setVerifiedStatusOfSeller] = useState(false);

  const handleCloseVerifyPhoneNumberModal = () => {
    setShowCountryDropdown(false);
    setPhoneNumber("");
    setCountry("");
    setDialCode("");
    setShowVerifyPhoneNumberModal(false);
    setShowVerifyCodeInput(false);
    setVerificationCode("");
  };

  const handleShowVerifyPhoneNumberModal = () => {
    setShowVerifyPhoneNumberModal(true);
  };

  const handleCountryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCountry(e.target.value);
    setDialCode("");
    setPhoneNumber("");
  };

  useEffect(() => {
    let temp = countryWithPhoneCodesData
      .filter((item) =>
        item.name.toLowerCase().startsWith(country.toLowerCase())
      )
      .slice(0, 8);
    setFilteredCountries(temp);
  }, [country]);

  const handleClickOnCountryListItem = (item: CountryWithPhoneCodes) => {
    setCountry(item.name);
    setDialCode(item.dial_code);
    setShowCountryDropdown(false);
  };

  const handleVerificationCodeChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setVerificationCode(e.target.value);
    if (verificationCodeErrorRef.current)
      verificationCodeErrorRef.current.style.display = "none";
  };

  const handleGoBackToEnterPhoneNumber = () => {
    setShowVerifyCodeInput(false);
    setVerificationCode("");
    if (verificationCodeErrorRef.current)
      verificationCodeErrorRef.current.style.display = "none";
  };

  const handlePhoneNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhoneNumber(e.target.value);
    if (invalidPhoneNumberRef.current)
      invalidPhoneNumberRef.current.style.display = "none";
  };

  const handleVerifyPhoneNumber = async () => {
    updateGlobalLoading(true, "Verifying phone number...");
    const phone = {
      code: dialCode,
      number: phoneNumber,
    };
    const body = {
      phone: phone,
    };
    let data;
    try {
      data = await axiosInstance.post("/verify/number", body);
      data = data.data;
    } catch (err: any) {
      if (err.response.status !== 403) {
        if (invalidPhoneNumberRef.current)
          invalidPhoneNumberRef.current.style.display = "block";
      }
      // toast.error("Something went wrong. Please try again later.");
      console.log(err);
    } finally {
      updateGlobalLoading(false);
    }
    if (data?.success) {
      setShowVerifyCodeInput(true);
    }
  };

  const handleVerifyCode = async () => {
    updateGlobalLoading(true, "Verifying code...");
    const phone = {
      code: dialCode,
      number: phoneNumber,
    };
    const body = {
      code: verificationCode,
      phone: phone,
    };
    try {
      const { data } = await axiosInstance.post("/verify/code", body);
      if (data.success) {
        if (verificationCodeErrorRef.current)
          verificationCodeErrorRef.current.style.display = "none";
        setShowVerifyPhoneNumberModal(false);
        setShowVerifyCodeInput(false);
        setVerificationCode("");
        setShowGigPublishFinalModal(true);
        setVerifiedStatusOfSeller(true);
      } else {
        if (verificationCodeErrorRef.current)
          verificationCodeErrorRef.current.style.display = "block";
      }
    } catch (error) {
      console.log(error);
      // toast.error("Something went wrong. Please try again later.");
    } finally {
      updateGlobalLoading(false);
    }
  };

  const handleSubmit = async () => {
    const payload = {
      step: 6,
      data: {
        active: true,
      },
    };
    const res = await handleSendData(payload);
    return res || false;
  };

  useEffect(() => {
    if (!gigDetail) return;
    const { active } = gigDetail;
    setVerifiedStatusOfSeller(active || false);
    setShowGigPublishFinalModal(active || false);
  }, [gigDetail]);

  useImperativeHandle(ref, () => ({
    handleSubmit,
  }));

  return (
    <>
      <div className="mb-12 bg-white">
        <div className="py-10 px-6 sm:py-20 sm:px-12">
          {showGigPublishFinalModal && verifiedStatusOfSeller ? (
            <>
              <div className="text-center">
                <h3 className="text-3xl sm:text-4xl text-primary">Almost there...</h3>
                <p className="text-lg sm:text-xl text-light_heading mt-4 font-bold">
                  Let's publish your Gig and get <br /> some buyers rolling in.
                </p>
              </div>
            </>
          ) : (
            <>
              <img
                className="h-40 flex justify-center w-full"
                src="/images/publish_gig.svg"
                alt=""
              />
              <div className="border border-no_focus p-6 sm:p-8 mt-8 text-light_grey">
                <h3 className="font-bold text-2xl sm:text-[2rem] mb-4">Congratulations!</h3>
                <p className="leading-6 font-bold mb-4">
                  You're almost done with your first Gig.
                </p>
                <p className="leading-6">
                  Before you start selling on FreelanceMe, there is one last
                  thing we need you to do. The security of your account is
                  important to us. Therefore, we require all our sellers to
                  verify their phone number before we can publish their Gig.
                </p>
              </div>
            </>
          )}

          {showVerifyPhoneNumberModal && (
            <div className="fixed z-[99] w-full h-full overflow-auto bg-[rgba(0,0,0,0.4)] left-0 top-0">
              <div className="rounded-[5px] relative bg-[#fefefe] w-11/12 max-w-[30rem] sm:w-[30rem] my-40 mx-auto p-10 border ">
                <div
                  className="absolute right-4 top-4 text-icons text-2xl hover:cursor-pointer"
                  onClick={handleCloseVerifyPhoneNumberModal}
                >
                  <IoIosClose />
                </div>
                <h5 className="mb-4 font-bold text-xl">Verify Phone Number</h5>

                {showVerifyCodeInput ? (
                  <>
                    <p className="text-[0.9rem] text-icons mb-6">
                      A verification code has been sent to:
                    </p>

                    <div className="text-light_heading flex gap-1 justify-center font-bold">
                      <span>{dialCode}</span>
                      <span>-</span>
                      <span>{phoneNumber}</span>
                    </div>

                    <div className="flex items-center flex-col gap-4 relative">
                      <p className="text-center text-xl sm:text-2xl mt-4 mx-8 text-light_grey">
                        Please enter the Verification code
                      </p>
                      <input
                        className="h-8 py-2 px-4 w-24 border border-no_focus outline-none focus:border-dark_grey"
                        type="text"
                        inputMode="numeric"
                        maxLength={6}
                        value={verificationCode}
                        onChange={handleVerificationCodeChange}
                      />
                      <p
                        ref={verificationCodeErrorRef}
                        className="text-warning text-center relative  hidden text-sm leading-5"
                      >
                        Oops... that code is wrong..
                        <br />
                        Please verify your code and try again.
                      </p>
                      <button
                        className={`px-8 py-3 hover:cursor-pointer mt-8 border-none rounded bg-primary text-white disabled:text-no_focus disabled:bg-dark_separator  text-[0.9rem] font-bold transition-all duration-200 disabled:cursor-not-allowed cursor-pointer hover:bg-primary_hover`}
                        disabled={verificationCode.length !== 6}
                        onClick={handleVerifyCode}
                      >
                        Submit Code
                      </button>
                    </div>

                    <p className="text-sm text-icons mt-4 text-center mx-2">
                      If you did not receive the code, please click
                      <span
                        className="text-link cursor-pointer hover:underline"
                        onClick={handleGoBackToEnterPhoneNumber}
                      >
                        {" "}
                        Back
                      </span>
                      , check that you have entered the right number, and try
                      again
                    </p>
                  </>
                ) : (
                  <>
                    <p className=" text-light_heading text-[0.9rem] mb-6">
                      Thank you for taking a moment to verify your phone number.{" "}
                    </p>

                    <div className="flex flex-col gap-10 mb-16">
                      <div className="relative">
                        <h6 className="text-[0.9rem] mb-2 font-bold">
                          Enter Country
                        </h6>
                        <input
                          className="py-[0.4rem] px-2 border border-no_focus text-[0.9rem] w-full focus:outline-none focus:border-dark_grey"
                          type="text"
                          value={country}
                          onChange={handleCountryChange}
                          id="country"
                          onFocus={() => setShowCountryDropdown(true)}
                        />
                        {showCountryDropdown &&
                          country &&
                          filteredCountries.length > 0 && (
                            <ul className="country-code-wrapper bg-white border border-no_focus border-t-0 hover:cursor-pointer absolute z-10 w-full">
                              {filteredCountries.map((countryData, index) => {
                                return (
                                  <li
                                    key={countryData.name}
                                    className="country-code p-[0.4rem] list-none block hover:bg-dark_separator"
                                    onClick={() =>
                                      handleClickOnCountryListItem(countryData)
                                    }
                                  >
                                    <p>{countryData.name}</p>
                                  </li>
                                );
                              })}
                            </ul>
                          )}
                      </div>
                      <div className="relative">
                        <h6 className="text-[0.9rem] mb-2 font-bold">
                          Enter Phone Number
                        </h6>
                        {dialCode && (
                          <p className="absolute text-no_focus text-[0.9rem] bottom-2 left-2 z-[1]">
                            {dialCode} -{" "}
                          </p>
                        )}
                        <input
                          className="py-[0.4rem] disabled:bg-separator disabled:cursor-not-allowed pl-16 px-2 border border-no_focus text-[0.9rem] w-full focus:outline-none focus:border-dark_grey"
                          type="tel"
                          value={phoneNumber}
                          disabled={!dialCode}
                          maxLength={20}
                          onChange={handlePhoneNumberChange}
                          onFocus={() => setShowCountryDropdown(false)}
                        />
                      </div>
                      <div
                        ref={invalidPhoneNumberRef}
                        className="text-warning text-sm -mt-8 leading-5 hidden"
                      >
                        Please enter a valid number
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <button
                        className={`px-8 py-3 hover:cursor-pointer border-none rounded bg-primary text-white disabled:text-no_focus disabled:bg-dark_separator  text-[0.9rem] font-bold transition-all duration-200 disabled:cursor-not-allowed cursor-pointer hover:bg-primary_hover`}
                        disabled={
                          phoneNumber.length < 5 || !country || !dialCode
                        }
                        onClick={handleVerifyPhoneNumber}
                      >
                        Verify
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
      <div className="save-and-verify text-right pb-4">
        {showGigPublishFinalModal && verifiedStatusOfSeller ? (
          <button
            className="py-3 px-4 capitalize bg-primary border-none text-white rounded-[3px] hover:cursor-pointer hover:bg-primary_hover"
            onClick={handleSubmit}
          >
            Publish Gig
          </button>
        ) : (
          <button
            className="py-3 px-4 capitalize bg-primary border-none text-white rounded-[3px] hover:cursor-pointer hover:bg-primary_hover"
            onClick={handleShowVerifyPhoneNumberModal}
          >
            Verify Now
          </button>
        )}
      </div>
    </>
  );
};

export default forwardRef(Step6);
