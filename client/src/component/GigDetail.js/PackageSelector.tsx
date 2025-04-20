import React from "react";
import { FaCheck, FaRegClock } from "react-icons/fa";
import { FiRepeat } from "react-icons/fi";
import { IPackageDetails } from "../../types/order.types";

type PackageSelectorProps = {
  handlePricePackageSelection: (e: React.MouseEvent<HTMLLIElement>) => void;
  pricePackageInfo: IPackageDetails;
  handleContinueBuyClick: () => void;
  setShowChatBox: React.Dispatch<React.SetStateAction<boolean>>;
  sectionClassName: string;
};

const PackageSelector = ({
  handlePricePackageSelection,
  pricePackageInfo,
  handleContinueBuyClick,
  setShowChatBox,
  sectionClassName,
}: PackageSelectorProps) => {
  return (
    <section className={`price-section ${sectionClassName}`}>
      <nav className="price-navigation">
        <ul>
          <li
            onClick={handlePricePackageSelection}
            className="price-package-selected"
          >
            Basic
          </li>
          <li onClick={handlePricePackageSelection}>Standard</li>
          <li onClick={handlePricePackageSelection}>Premium</li>
        </ul>
      </nav>
      {pricePackageInfo && (
        <div className="price-section-details">
          <header>
            <h3>
              <div className="price-package-title">
                {pricePackageInfo.packageTitle}
              </div>
              <div className="price-package-price">
                ₹{Number(pricePackageInfo.packagePrice).toFixed(2)}
              </div>
            </h3>
            <p>{pricePackageInfo.packageDescription}</p>
          </header>
          <div className="delivery-revision-div">
            <div className="package-delivery">
              <FaRegClock />
              <p>{pricePackageInfo.packageDeliveryTime}</p>
            </div>
            <div className="package-revisions">
              <FiRepeat />
              <p>
                {pricePackageInfo.revisions < 1e6
                  ? pricePackageInfo.revisions
                  : "Unlimited"}
              </p>
            </div>
          </div>
          <div className="package-output">
            <ul>
              <li
                className={
                  pricePackageInfo.sourceFile === true
                    ? "package-output-selected"
                    : undefined
                }
              >
                <FaCheck className="inline" />
                Source File
              </li>
              <li
                className={
                  pricePackageInfo.commercialUse === true
                    ? "package-output-selected"
                    : undefined
                }
              >
                <FaCheck className="inline" />
                Commercial Use
              </li>
            </ul>
          </div>
          <footer>
            <button onClick={handleContinueBuyClick}>
              Continue (₹{pricePackageInfo.packagePrice})
            </button>
          </footer>
        </div>
      )}
      <div
        onClick={() => setShowChatBox(true)}
        className="price-section-contact-me-button"
      >
        <button>Contact Seller</button>
      </div>
    </section>
  );
};

export default PackageSelector;
