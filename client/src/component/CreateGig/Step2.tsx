import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { deliveryTimeData, packagesData, revisionsData } from "./createGigData";
import { TextArea, TextAreaRef } from "../TextArea/TextArea";
import SelectInput2, { SelectInput2Ref } from "../SelectInput/SelectInput2";
import { CheckInput, CheckInputRef } from "../CheckInput/CheckInput";
import { RootState } from "../../store";
import { useSelector } from "react-redux";
import { StepProps, StepRef } from "./CreateGig";
import { IPackageDetails } from "../../types/order.types";
import {
  CHOOSE_A_DELIVERY_TIME,
  SELECT_NUMBER_OF_REVISIONS,
} from "../../constants/globalConstants";

const Step2 = ({ handleSendData }: StepProps, ref: React.Ref<StepRef>) => {
  const { gigDetail } = useSelector((state: RootState) => state.gigDetail);
  const packageNameRefs = useRef<React.RefObject<TextAreaRef>[]>(
    packagesData.map(() => React.createRef<TextAreaRef>())
  );
  const packageDescriptionRefs = useRef<React.RefObject<TextAreaRef>[]>(
    packagesData.map(() => React.createRef<TextAreaRef>())
  );
  const deliveryTimeRefs = useRef<React.RefObject<SelectInput2Ref>[]>(
    packagesData.map(() => React.createRef())
  );
  const deliveryRevisionsRefs = useRef<React.RefObject<SelectInput2Ref>[]>(
    packagesData.map(() => React.createRef())
  );
  const packagePriceRefs = useRef<React.RefObject<HTMLInputElement>[]>(
    packagesData.map(() => React.createRef())
  );
  const sourceFileRefs = useRef<React.RefObject<CheckInputRef>[]>(
    packagesData.map(() => React.createRef())
  );
  const commercialUseRefs = useRef<React.RefObject<CheckInputRef>[]>(
    packagesData.map(() => React.createRef())
  );
  const [packagesWarning, setPackagesWarning] = useState<string[]>([]);

  useEffect(() => {
    if (!gigDetail) return;
    const { pricing } = gigDetail;
    pricing?.map((item, index) => {
      packageNameRefs.current[index].current?.setTextComingFromParent(
        item.packageTitle
      );
      packageDescriptionRefs.current[index].current?.setTextComingFromParent(
        item.packageDescription
      );
      deliveryTimeRefs.current[
        index
      ]?.current?.setChoosedOptionComingFromParent(item.packageDeliveryTime);
      deliveryRevisionsRefs.current[
        index
      ].current?.setChoosedOptionComingFromParent(item.revisions.toString());
      if (packagePriceRefs.current[index].current) {
        packagePriceRefs.current[index].current.value =
          item.packagePrice.toString();
      }
      sourceFileRefs.current[index].current?.setIsCheckedComingFromParent(
        item.sourceFile
      );
      commercialUseRefs.current[index].current?.setIsCheckedComingFromParent(
        item.commercialUse
      );
    });
  }, [gigDetail]);

  const checkForWarnings = () => {
    let warning = false;
    let errors: string[] = [];
    packageNameRefs.current.forEach((item, index) => {
      if ((item.current?.currValue.trim().length || 0) < 1) {
        warning = true;
        errors.push("Please provide packages name");
        return true;
      }
    });

    packageDescriptionRefs.current.forEach((item, index) => {
      if ((item.current?.currValue.trim().length || 0) < 2) {
        warning = true;
        errors.push("Please provide packages description");
        return true;
      }
    });

    deliveryTimeRefs.current.forEach((item, index) => {
      console.log(item.current?.currValue);
      if (
        !item.current?.currValue ||
        item.current?.currValue === CHOOSE_A_DELIVERY_TIME.toLowerCase()
      ) {
        warning = true;
        errors.push("Please provide delivery time for each package.");
        return true;
      }
    });

    deliveryRevisionsRefs.current.forEach((item, index) => {
      if (
        !item.current?.currValue ||
        item.current?.currValue === SELECT_NUMBER_OF_REVISIONS.toLowerCase()
      ) {
        errors.push("Please provide number of revisions for each package.");
        warning = true;
        return true;
      }
    });

    packagePriceRefs.current.forEach((item, index) => {
      if (!item.current?.value) {
        warning = true;
        errors.push("Please provide price for each package.");
      } else if (Number(item.current?.value) < 5) {
        warning = true;
        errors.push("Package price should be more than 5.");
      } else if (Number(item.current.value) > 10000) {
        warning = true;
        errors.push("Package price should be less than 10000.");
      }
    });
    setPackagesWarning(errors);
    if (warning) {
      return true;
    }
  };

  const handleSubmit = async () => {
    if (checkForWarnings()) {
      console.log("warnings found");
      return false;
    }
    const packagesData: IPackageDetails[] = [];
    packageNameRefs.current.forEach((item, index) => {
      const data = {
        packageTitle: item.current?.currValue!,
        packageDescription:
          packageDescriptionRefs.current[index].current?.currValue!,
        packageDeliveryTime:
          deliveryTimeRefs.current[index].current?.currValue!,
        revisions:
          deliveryRevisionsRefs.current[index].current?.currValue ===
          "unlimited"
            ? Number.MAX_VALUE
            : Number(deliveryRevisionsRefs.current[index].current?.currValue),
        sourceFile: sourceFileRefs.current[index].current?.currValue!,
        commercialUse: commercialUseRefs.current[index].current?.currValue!,
        packagePrice: Number(packagePriceRefs.current[index].current?.value!),
      };
      packagesData.push(data);
    });
    const payload = { data: packagesData, step: 2 };
    const res = await handleSendData(payload);
    return res || false;
  };

  useImperativeHandle(ref, () => ({
    handleSubmit,
  }));

  return (
    <div className="pricing">
      <div className="pricing-wrapper pr-0">
        <h2>Scope & Pricing</h2>
        <h3>Packages</h3>
        <div className="pricing-section">
          {packagesData.map((pack, index) => {
            return (
              <div className="package" key={"package" + index}>
                <h4>{pack}</h4>
                <div className="package-name">
                  <TextArea
                    maxLength={40}
                    minLength={0}
                    placeholder="Enter your package name"
                    style={{
                      fontSize: "14px",
                      height: "40px",
                      borderRadius: "0px",
                    }}
                    ref={packageNameRefs.current[index]}
                  />
                </div>
                <div className="package-description">
                  <TextArea
                    maxLength={100}
                    minLength={0}
                    placeholder="Enter your package description"
                    defaultText=""
                    style={{ fontSize: "14px", borderRadius: "0" }}
                    ref={packageDescriptionRefs.current[index]}
                  />
                </div>

                <div className="package-delivery-time">
                  <SelectInput2
                    data={deliveryTimeData}
                    defaultOption={"Choose a delivery time"}
                    ref={deliveryTimeRefs.current[index]}
                  />
                </div>

                <div className="package-revisions-required">
                  <SelectInput2
                    data={revisionsData}
                    defaultOption={SELECT_NUMBER_OF_REVISIONS}
                    ref={deliveryRevisionsRefs.current[index]}
                  />
                </div>

                <div className="package-price">
                  <div className="price-details">
                    <input
                      ref={packagePriceRefs.current[index]}
                      className="price-value"
                      step="5"
                      placeholder="Price"
                      type="number"
                      min={5}
                      max={10000}
                    ></input>
                    <span className="right-4">₹</span>
                  </div>
                </div>
                <div className="source">
                  <CheckInput
                    label="Source File"
                    ref={sourceFileRefs.current[index]}
                  />
                </div>
                <div className="commercial">
                  <CheckInput
                    label="Commercial Use"
                    ref={commercialUseRefs.current[index]}
                  />
                </div>
              </div>
            );
          })}
          {packagesWarning.length > 0 && (
            <ul className="list-disc mt-4 text-warning col-span-2 flex flex-col gap-2">
              {packagesWarning.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default forwardRef(Step2);
