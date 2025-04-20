import {
  forwardRef,
  Ref,
  useEffect,
  useImperativeHandle,
  useState,
} from "react";
import { useSelector } from "react-redux";
import {
  CHOOSE_A_DELIVERY_TIME,
  SELECT_NUMBER_OF_REVISIONS,
} from "../../constants/globalConstants";
import { RootState } from "../../store";
import { IPackageDetails } from "../../types/order.types";
import { CheckInput } from "../CheckInput";
import SelectInput2 from "../SelectInput2";
import { TextArea } from "../TextArea";
import { deliveryTimeData, packagesData, revisionsData } from "./createGigData";

type PackageFormProps = {
  categoryId: number;
};

export type PackageFormRef = {
  handlePackageSubmit: () => void;
};

const PackageForm = (
  { categoryId }: PackageFormProps,
  ref: Ref<PackageFormRef>
) => {
  const { gigDetail } = useSelector((state: RootState) => state.gigDetail);

  const [packageTitle, setPackageTitle] = useState<string>("");
  const [packageDescription, setPackageDescription] = useState<string>("");
  const [packageDeliveryTime, setPackageDeliveryTime] = useState<string>(
    CHOOSE_A_DELIVERY_TIME
  );
  const [revisions, setRevisions] = useState<string>(
    SELECT_NUMBER_OF_REVISIONS
  );
  const [packagePrice, setPackagePrice] = useState<string>("");
  const [sourceFile, setSourceFile] = useState<boolean>(false);
  const [commercialUse, setCommercialUse] = useState<boolean>(false);

  const [packageTitleWarning, setPackageTitleWarning] = useState<string>("");
  const [packageDescriptionWarning, setPackageDescriptionWarning] =
    useState<string>("");
  const [deliveryTimeWarning, setDeliveryTimeWarning] = useState<string>("");
  const [revisionsWarning, setRevisionsWarning] = useState<string>("");
  const [priceWarning, setPriceWarning] = useState<string>("");

  useEffect(() => {
    if (!gigDetail || gigDetail.pricing.length === 0) return;
    const { pricing } = gigDetail;
    const packageDetail = pricing[categoryId];
    const {
      packageTitle,
      packageDescription,
      packageDeliveryTime,
      commercialUse,
      packagePrice,
      revisions,
      sourceFile,
    } = packageDetail;

    setPackageTitle(packageTitle);
    setPackageDescription(packageDescription);
    setPackageDeliveryTime(packageDeliveryTime);
    setCommercialUse(commercialUse);
    setPackagePrice(packagePrice.toString());
    setRevisions(
      revisions === Number.MAX_VALUE ? "unlimited" : revisions.toString()
    );
    setSourceFile(sourceFile);
  }, [gigDetail, categoryId]);

  const handlePackageSubmit = () => {
    const packageTitleWarning = getPackageTitleWarning(packageTitle);
    const packageDescriptionWarning =
      getPackageDescriptionWarning(packageDescription);
    const deliveryTimeWarning = getDeliveryTimeWarning(packageDeliveryTime);
    const revisionsWarning = getRevisionsWarning(revisions);
    const priceWarning = getPriceWarning(packagePrice);

    setPackageTitleWarning(packageTitleWarning);
    setPackageDescriptionWarning(packageDescriptionWarning);
    setDeliveryTimeWarning(deliveryTimeWarning);
    setRevisionsWarning(revisionsWarning);
    setPriceWarning(priceWarning);

    if (
      packageTitleWarning ||
      packageDescriptionWarning ||
      deliveryTimeWarning ||
      revisionsWarning ||
      priceWarning
    ) {
      return null;
    }

    const packageData: IPackageDetails = {
      packageTitle,
      packageDescription,
      packageDeliveryTime,
      revisions:
        revisions.toLowerCase() === "unlimited"
          ? Number.MAX_VALUE
          : parseInt(revisions),
      packagePrice: parseInt(packagePrice),
      sourceFile,
      commercialUse,
    };

    return packageData;
  };

  useImperativeHandle(ref, () => ({
    handlePackageSubmit,
  }));

  return (
    <div className="bg-white">
      <h4 className="text-base font-bold  text-light_grey bg-dark_separator p-4">
        {packagesData[categoryId]}
      </h4>
      <div className="grid grid-cols-1 sm:grid-cols-6 p-4 py-8 md:grid-cols-1 gap-4">
        <div className="col-span-3">
          <TextArea
            maxLength={40}
            minLength={0}
            placeholder="Enter your package name"
            className="text-sm h-10 rounded-none"
            warning={packageTitleWarning}
            onChange={(text) => {
              setPackageTitle(text);
              setPackageTitleWarning(getPackageTitleWarning(text));
            }}
            value={packageTitle}
          />
        </div>
        <div className="col-span-3">
          <TextArea
            maxLength={100}
            minLength={0}
            placeholder="Enter your package description"
            className="text-sm rounded-none col-span-3"
            warning={packageDescriptionWarning}
            onChange={(text) => {
              setPackageDescription(text);
              setPackageDescriptionWarning(getPackageDescriptionWarning(text));
            }}
            value={packageDescription}
          />
        </div>
        <div className="mb-4 col-span-3">
          <SelectInput2
            data={deliveryTimeData}
            defaultOption={CHOOSE_A_DELIVERY_TIME}
            warning={deliveryTimeWarning}
            onChange={(option) => {
              setPackageDeliveryTime(option);
              setDeliveryTimeWarning(getDeliveryTimeWarning(option));
            }}
            value={packageDeliveryTime}
          />
        </div>
        <div className="mb-4 col-span-3">
          <SelectInput2
            data={revisionsData}
            defaultOption={SELECT_NUMBER_OF_REVISIONS}
            warning={revisionsWarning}
            onChange={(option) => {
              setRevisions(option);
              setRevisionsWarning(getRevisionsWarning(option));
            }}
            value={revisions}
          />
        </div>
        <div className="relative col-span-2">
          <div className="flex items-center mb-2">
            <input
              className="border border-no_focus focus:outline-none focus:border-dark_grey w-full py-2 px-3 pr-8 placeholder:text-[0.9rem]"
              step="5"
              placeholder="Price"
              type="number"
              min={5}
              max={10000}
              onChange={(e) => {
                setPackagePrice(e.target.value);
                setPriceWarning(getPriceWarning(e.target.value));
              }}
              value={packagePrice}
            ></input>
            <span className="right-4 absolute">₹</span>
          </div>
          <p className="text-sm absolute -bottom-3 text-warning leading-[1.4]">
            {priceWarning}
          </p>
        </div>
        <div className="col-span-2 sm:justify-center md:justify-start flex items-center gap-2">
          <CheckInput
            label="Source File"
            value={sourceFile}
            onChange={(checked) => setSourceFile(checked)}
          />
        </div>
        <div className="col-span-2 sm:justify-center md:justify-start flex items-center gap-2">
          <CheckInput
            label="Commercial Use"
            value={commercialUse}
            onChange={(checked) => setCommercialUse(checked)}
          />
        </div>
      </div>
    </div>
  );
};

export default forwardRef(PackageForm);

const getPackageTitleWarning = (text: string) => {
  if (!text) return "Title is required";
  return "";
};

const getPackageDescriptionWarning = (text: string) => {
  if (!text) return "Description is required";
  return "";
};

const getDeliveryTimeWarning = (text: string) => {
  if (!text || text.toLowerCase() === CHOOSE_A_DELIVERY_TIME.toLowerCase())
    return "Delivery Time is required";
  return "";
};

const getRevisionsWarning = (text: string) => {
  if (!text || text.toLowerCase() === SELECT_NUMBER_OF_REVISIONS.toLowerCase())
    return "Revisions is required";
  return "";
};

const getPriceWarning = (text: string) => {
  if (!text) return "Price is required";
  if (parseInt(text) < 5) return "Price must be greater than 5";
  if (parseInt(text) > 10000) return "Price must be less than 10000";
  return "";
};
