import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import SelectInput2 from "../component/SelectInput2";
import { useUpdateGlobalLoading } from "../context/globalLoadingContext";
import { razorpaySupportedCountries } from "../data/razorpaySupportedCountries";
import { AppDispatch, RootState } from "../store";
import { axiosInstance } from "../utility/axiosInstance";

type AccountDetails = {
  panNumber: string;
  accountHolderName: string;
  accountNumber: string;
  ifscCode: string;
  beneficiaryName: string;
  street1: string;
  street2: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
};

type AccountError = {
  [k in keyof AccountDetails]: string;
};

type FieldDisabled = {
  [k in keyof AccountDetails]: boolean;
};

type FormItem = {
  name: keyof AccountDetails;
  label?: string;
  placeholder?: string;
  type: string;
  reqMsg?: string;
  disabled: boolean;
};

const formItems: FormItem[] = [
  {
    label: "PAN number",
    type: "text",
    name: "panNumber",
    placeholder: "Enter your PAN number",
    reqMsg: "PAN number is required",
    disabled: false,
  },
  {
    label: "Account holder name",
    type: "text",
    name: "accountHolderName",
    placeholder: "Enter your account holder name",
    reqMsg: "Account holder name is required",
    disabled: false,
  },
  {
    label: "Account number",
    type: "text",
    name: "accountNumber",
    placeholder: "Enter your account number",
    reqMsg: "Account number is required",
    disabled: false,
  },
  {
    label: "IFSC code",
    type: "text",
    name: "ifscCode",
    placeholder: "Enter your IFSC code",
    reqMsg: "IFSC code is required",
    disabled: false,
  },
  {
    label: "Beneficiary name",
    type: "text",
    name: "beneficiaryName",
    placeholder: "Enter your beneficiary name",
    reqMsg: "Beneficiary name is required",
    disabled: false,
  },
  {
    label: "Address",
    type: "text",
    name: "street1",
    placeholder: "Street 1",
    reqMsg: "Street 1 is required",
    disabled: false,
  },
  {
    // label: "Street 2",
    type: "text",
    name: "street2",
    placeholder: "Street 2",
    reqMsg: "Street 2 is required",
    disabled: false,
  },
  {
    // label: "City",
    type: "text",
    name: "city",
    placeholder: "City",
    reqMsg: "City is required",
    disabled: false,
  },
  {
    // label: "State",
    type: "text",
    name: "state",
    placeholder: "State",
    reqMsg: "State is required",
    disabled: false,
  },
  {
    // label: "Postal code",
    type: "text",
    name: "postalCode",
    placeholder: "Postal code",
    reqMsg: "Postal code is required",
    disabled: false,
  },
];

export const BankAccountForm = () => {
  const dispatch = useDispatch<AppDispatch>();
  const setGlobalLoading = useUpdateGlobalLoading();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useSelector(
    (state: RootState) => state.user
  );

  const [accountDetails, setAccountDetails] = useState<AccountDetails>({
    panNumber: "",
    accountHolderName: "",
    accountNumber: "",
    ifscCode: "",
    beneficiaryName: "",
    street1: "",
    street2: "",
    city: "",
    state: "",
    postalCode: "",
    country: "",
  });

  const [accountError, setAccountError] = useState<AccountError>({
    panNumber: "",
    accountHolderName: "",
    accountNumber: "",
    ifscCode: "",
    beneficiaryName: "",
    street1: "",
    street2: "",
    city: "",
    state: "",
    postalCode: "",
    country: "",
  });

  const [fieldDisabled, setFieldDisabled] = useState<FieldDisabled>({
    panNumber: false,
    accountHolderName: false,
    accountNumber: false,
    ifscCode: false,
    beneficiaryName: false,
    street1: false,
    street2: false,
    city: false,
    state: false,
    postalCode: false,
    country: false,
  });

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
    }
    if (
      user?.razorPayAccountDetails &&
      user?.razorPayAccountDetails.status !== "new"
    ) {
      setGlobalLoading(true);
      axiosInstance
        .get("/get/account")
        .then((res) => {
          const account = res.data.account;
          setAccountDetails({
            accountHolderName: account.accountHolderName,
            accountNumber: account.requirements.accountNumber
              ? ""
              : account.accountNumber,
            ifscCode: account.requirements.ifscCode ? "" : account.ifscCode,
            beneficiaryName: account.requirements.beneficiaryName
              ? ""
              : account.beneficiaryName,
            street1: account.street1,
            street2: account.street2,
            city: account.city,
            state: account.state,
            postalCode: account.postalCode,
            country: account.country,
            panNumber: account.panNumber,
          });
          setFieldDisabled({
            accountHolderName: !account.requirements?.accountHolderName,
            accountNumber: !account.requirements?.accountNumber,
            ifscCode: !account.requirements?.ifscCode,
            beneficiaryName: !account.requirements?.beneficiaryName,
            street1: !account.requirements?.street1,
            street2: !account.requirements?.street2,
            city: !account.requirements?.city,
            state: !account.requirements?.state,
            postalCode: !account.requirements?.postalCode,
            country: !account.requirements?.country,
            panNumber: !account.requirements?.pan_number,
          });
        })
        .catch((err) => {
          console.log(err.response.data);
          toast.error("There is some problem in fetching your account details");
        })
        .finally(() => {
          setGlobalLoading(false);
        });
    }
  }, [user, isAuthenticated]);

  const handleAccountDetailsSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();
    let isError = false;
    let errors: AccountError = {
      panNumber: "",
      accountHolderName: "",
      accountNumber: "",
      ifscCode: "",
      beneficiaryName: "",
      street1: "",
      street2: "",
      city: "",
      state: "",
      postalCode: "",
      country: "",
    };
    if (accountDetails.panNumber === "") {
      isError = true;
      errors.panNumber = "PAN number is required";
    }
    if (accountDetails.accountHolderName === "") {
      isError = true;
      errors.accountHolderName = "Account holder name is required";
    }
    if (accountDetails.accountNumber === "") {
      isError = true;
      errors.accountNumber = "Account number is required";
    }
    if (accountDetails.ifscCode === "") {
      isError = true;
      errors.ifscCode = "IFSC code is required";
    }
    if (accountDetails.beneficiaryName === "") {
      isError = true;
      errors.beneficiaryName = "Beneficiary name is required";
    }
    if (accountDetails.street1 === "") {
      isError = true;
      errors.street1 = "Street 1 is required";
    }
    if (accountDetails.street2 === "") {
      isError = true;
      errors.street2 = "Street 2 is required";
    }
    if (accountDetails.city === "") {
      isError = true;
      errors.city = "City is required";
    }
    if (accountDetails.state === "") {
      isError = true;
      errors.state = "State is required";
    }
    if (accountDetails.postalCode === "") {
      isError = true;
      errors.postalCode = "Postal code is required";
    }
    if (
      accountDetails.country === "" ||
      accountDetails.country.toLowerCase() === "select country"
    ) {
      isError = true;
      errors.country = "Country is required";
    }

    if (isError) {
      setAccountError(errors);
      return;
    }
    try {
      setGlobalLoading(true);
      let res = null;
      if (user?.razorPayAccountDetails?.status === "new") {
        const { data } = await axiosInstance.post(
          "/add/account",
          accountDetails
        );
        res = data;
        console.log(res);
      } else if (
        user?.razorPayAccountDetails?.status === "needs_clarification"
      ) {
        const { data } = await axiosInstance.put(
          "/update/account",
          accountDetails
        );
        res = data;
        console.log(res);
      }
      if (res.user) {
        dispatch({
          type: "UPDATE_USER_SUCCESS",
          payload: {
            ...res.user,
          },
        });
      }
      navigate("/balance/detail");
    } catch (err: any) {
      toast.error(err.response.data);
    } finally {
      setGlobalLoading(false);
    }
  };

  return (
    <div className="bg-separator px-4 py-12">
      <div className="p-8 rounded mx-auto max-w-xl bg-white">
        <h1 className="text-4xl font-bold mb-2">
          {isAuthenticated && user?.razorPayAccountDetails?.status === "new"
            ? "Add your bank account"
            : "Update your bank account"}
        </h1>
        <p className="text-light_heading mb-10">
          You need to add your bank account to withdraw funds.
        </p>
        {user?.razorPayAccountDetails?.status === "under_review" && (
          <p className="text-sm text-yellow-600 -mt-6 mb-6">
            Your account details are under review. You will be notified once
            your account is activated.
          </p>
        )}
        {user?.razorPayAccountDetails?.status === "needs_clarification" && (
          <p className="text-sm text-warning -mt-6 mb-6">
            Your account details need clarification. Please update your account
            details.
          </p>
        )}

        <form
          className="mb-10"
          id="accountDetailsForm"
          onSubmit={handleAccountDetailsSubmit}
        >
          <fieldset
            className="disabled:cursor-not-allowed"
            disabled={user?.razorPayAccountDetails?.status === "under_review"}
          >
            <div className="">
              {formItems.map((item, index) => (
                <div className="mb-4" key={index}>
                  {item.label && (
                    <label
                      htmlFor={item.name}
                      className="block capitalize text-light_grey text-sm  font-semibold mb-1"
                    >
                      {item.label}
                      <span className="ml-1 text-warning">*</span>
                    </label>
                  )}
                  <input
                    disabled={fieldDisabled[item.name]}
                    placeholder={item.placeholder}
                    value={accountDetails[item.name]}
                    onChange={(e) => {
                      setAccountDetails({
                        ...accountDetails,
                        [item.name]: e.target.value,
                      });
                      if (
                        e.target.value.length > 0 ||
                        user?.razorPayAccountDetails.status === "under_review"
                      )
                        setAccountError({
                          ...accountError,
                          [item.name]: "",
                        });
                      else {
                        setAccountError({
                          ...accountError,
                          [item.name]: item.reqMsg,
                        });
                      }
                    }}
                    type={item.type}
                    id={item.name}
                    className="w-full disabled:bg-separator disabled:cursor-not-allowed text-sm p-2 border text-light_grey placeholder:text-no_focus border-separator rounded"
                  />
                  {accountError[item.name] && (
                    <p className="text-warning text-xs mt-1">
                      {accountError[item.name]}
                    </p>
                  )}
                </div>
              ))}
            </div>

            <div>
              <SelectInput2
                disabled={fieldDisabled["country"]}
                data={razorpaySupportedCountries.map((country) => country.name)}
                defaultOption={
                  accountDetails.country
                    ? accountDetails.country
                    : "Select country"
                }
                style={{
                  borderRadius: "5px",
                  padding: "10px",
                  width: "100%",
                  border: "1px solid #e4e5e7",
                  textTransform: "capitalize",
                }}
                onChange={(option: string) => {
                  setAccountDetails({
                    ...accountDetails,
                    country: option,
                  });
                  if (option.toLowerCase() !== "select country")
                    setAccountError({
                      ...accountError,
                      country: "",
                    });
                  else {
                    setAccountError({
                      ...accountError,
                      country: "Country is required",
                    });
                  }
                }}
              />
              {accountError["country"] && (
                <p className="text-warning text-xs mt-1">
                  {accountError["country"]}
                </p>
              )}
            </div>
          </fieldset>
        </form>
        <button
          form="accountDetailsForm"
          type="submit"
          className="px-4 py-3 w-full disabled:bg-no_focus disabled:hover:cursor-default bg-dark_grey hover:bg-light_grey hover:cursor-pointer text-white rounded"
          disabled={user?.razorPayAccountDetails?.status === "under_review"}
        >
          {isAuthenticated &&
          user?.razorPayAccountDetails &&
          user?.razorPayAccountDetails.status === "new"
            ? "Add bank account"
            : "Update bank account"}
        </button>
      </div>
    </div>
  );
};
