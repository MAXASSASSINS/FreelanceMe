import React, { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../store";
import SelectInput2, { SelectInput2Ref } from "../SelectInput2";
import {
  YEAR_OF_CERTIFICATION,
  YEARS_LIST,
} from "../../constants/globalConstants";
import { BiTrash } from "react-icons/bi";

type Certificate = {
  name: string;
  certifiedFrom: string;
  year: string;
};

type CertificateSectionProps = {};

export type CertificateSectionRef = {
  getCertificates: () => Certificate[];
};

const CertificateSection = (props: CertificateSectionProps, ref: React.Ref<CertificateSectionRef>) => {
  const { user, isAuthenticated } = useSelector(
    (state: RootState) => state.user
  );
  const certificationTitleRef = useRef<HTMLInputElement>(null);
  const certificationAuthorityRef = useRef<HTMLInputElement>(null);
  const certificationYearRef = useRef<SelectInput2Ref>(null);
  const [certificates, setCertificates] = useState<Certificate[]>(
    user?.certificates || []
  );
  const [openCertificationAdder, setOpenCertificationAdder] =
    useState<boolean>(false);

  const handleAddCertification = () => {
    const name = certificationTitleRef.current?.value;
    const certifiedFrom = certificationAuthorityRef.current?.value;
    const year = certificationYearRef.current?.currValue;
    if (!name || !certifiedFrom || !year || year === YEAR_OF_CERTIFICATION) {
      return;
    }
    setCertificates((prev) => [...prev, { name, certifiedFrom, year }]);
    certificationTitleRef.current.value = "";
    certificationAuthorityRef.current.value = "";
    certificationYearRef.current.setChoosedOptionComingFromParent(
      YEAR_OF_CERTIFICATION
    );
    setOpenCertificationAdder(false);
  };

  const handleCancelCertification = () => {
    if (certificationTitleRef.current) certificationTitleRef.current.value = "";
    if (certificationAuthorityRef.current)
      certificationAuthorityRef.current.value = "";
    if (certificationYearRef.current)
      certificationYearRef.current.setChoosedOptionComingFromParent(
        YEAR_OF_CERTIFICATION
      );
    setOpenCertificationAdder(false);
  };

  const handleRemoveCertification = (index: number) => {
    setCertificates((prev) => {
      const newCertifications = [...prev];
      newCertifications.splice(index, 1);
      return newCertifications;
    });
  };

  useImperativeHandle(ref, () => ({
    getCertificates: () => certificates,
  }), [certificates]);

  useEffect(() => {
    if (isAuthenticated) {
      setCertificates(user!.certificates);
    }
  }, [user, isAuthenticated]);

  return (
    <section>
      <div>
        <div className="flex items-center gap-12 mb-2">
          <label className="text-lg font-semibold">Certification</label>
          <p
            onClick={() => setOpenCertificationAdder(true)}
            className="text-blue-600 hover:underline hover:cursor-pointer"
          >
            Add New
          </p>
        </div>

        {certificates.length === 0 && !openCertificationAdder && (
          <p className="text-light_heading">Add your certification</p>
        )}

        {certificates.length < 6 && openCertificationAdder && (
          <div>
            <div className="flex flex-col gap-4">
              <input
                className="placeholder:text-icons text-sm outline-none w-full py-2 px-4 text-light_heading rounded-sm border border-no_focus focus:outline-none focus:border-light_grey"
                placeholder="Certificate Or Award"
                ref={certificationTitleRef}
                onKeyDown={(e) => {
                  e.key === "Enter" && e.preventDefault();
                }}
              />
              <input
                className="placeholder:text-icons text-sm outline-none w-full rounded-sm py-2 px-4 text-light_heading border border-no_focus focus:outline-none focus:border-light_grey"
                placeholder="Certified from (e.g. Google)"
                ref={certificationAuthorityRef}
                onKeyDown={(e) => {
                  e.key === "Enter" && e.preventDefault();
                }}
              />
              <SelectInput2
                data={YEARS_LIST}
                defaultOption={YEAR_OF_CERTIFICATION}
                style={{ borderRadius: "2px" }}
                ref={certificationYearRef}
              />
            </div>
            <div className="flex items-center gap-8 justify-end mt-4">
              <button
                onClick={handleCancelCertification}
                type="button"
                className="py-2 hover:cursor-pointer hover:underline rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleAddCertification}
                type="button"
                className="py-2 px-4 hover:cursor-pointer bg-icons text-white rounded"
              >
                Add
              </button>
            </div>
          </div>
        )}

        <ul className="mt-4 max-w-max">
          {certificates.map((certificate, index) => (
            <li
              key={index}
              className="mb-4 flex justify-between gap-8  text-light_heading"
            >
              <div>
                <p className="capitalize">{certificate.name}</p>
                <p className="text-icons mt-2">
                  {certificate.certifiedFrom}, {certificate.year}
                </p>
              </div>
              <p
                className="hover:text-warning hover:cursor-pointer"
                onClick={() => handleRemoveCertification(index)}
              >
                <BiTrash />
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
};

export default forwardRef(CertificateSection);
