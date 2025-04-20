import React, { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import SelectInput2, { SelectInput2Ref } from "../SelectInput2";
import {
  SELECT_COUNTRY,
  YEAR_OF_GRADUATION,
  YEARS_LIST,
} from "../../constants/globalConstants";
import { useSelector } from "react-redux";
import { RootState } from "../../store";
import { countryList } from "../../data/countries";
import { BiTrash } from "react-icons/bi";

type Education = {
  country: string;
  collegeName: string;
  degree: string;
  major: string;
  yearOfGraduation: string;
};

type EducationSectionProps = {};

export type EducationSectionRef = {
  getEducation: () => Education[];
};

const EducationSection = (props: EducationSectionProps, ref: React.Ref<EducationSectionRef>) => {
  const { user, isAuthenticated } = useSelector(
    (state: RootState) => state.user
  );
  const countryRef = useRef<SelectInput2Ref>(null);
  const collegeRef = useRef<HTMLInputElement>(null);
  const degreeTitleRef = useRef<HTMLInputElement>(null);
  const degreeMajorRef = useRef<HTMLInputElement>(null);
  const yearOfGraduationRef = useRef<SelectInput2Ref>(null);
  const [openEducationAdder, setOpenEducationAdder] = useState<boolean>(false);

  const [education, setEducation] = useState<Education[]>([]);

  const handleAddEducation = () => {
    const country = countryRef.current?.currValue;
    const collegeName = collegeRef.current?.value;
    const degree = degreeTitleRef.current?.value;
    const major = degreeMajorRef.current?.value;
    const yearOfGraduation = yearOfGraduationRef.current?.currValue;

    if (
      !country ||
      !yearOfGraduation ||
      country === SELECT_COUNTRY ||
      !collegeName ||
      !degree ||
      !major ||
      yearOfGraduation === YEAR_OF_GRADUATION
    ) {
      return;
    }

    setEducation((prev) => [
      ...prev,
      {
        country,
        collegeName,
        degree,
        major,
        yearOfGraduation,
      },
    ]);

    countryRef.current.setChoosedOptionComingFromParent(SELECT_COUNTRY);
    collegeRef.current.value = "";
    degreeTitleRef.current.value = "";
    degreeMajorRef.current.value = "";
    yearOfGraduationRef.current.setChoosedOptionComingFromParent(
      YEAR_OF_GRADUATION
    );

    setOpenEducationAdder(false);
  };

  const handleCancelEducation = () => {
    countryRef.current?.setChoosedOptionComingFromParent(SELECT_COUNTRY);
    if (collegeRef.current) collegeRef.current.value = "";
    if (degreeTitleRef.current) degreeTitleRef.current.value = "";
    if (degreeMajorRef.current) degreeMajorRef.current.value = "";
    yearOfGraduationRef.current?.setChoosedOptionComingFromParent(
      YEAR_OF_GRADUATION
    );
    setOpenEducationAdder(false);
  };

  const handleRemoveEducation = (index: number) => {
    setEducation((prev) => prev.filter((_, i) => i !== index));
  };

  useImperativeHandle(ref, () => ({
    getEducation: () => education,
  }), [education]);

  useEffect(() => {
    if (isAuthenticated) {
      setEducation(user!.education);
    }
  }, [user, isAuthenticated]);

  return (
    <section>
      <div>
        <div className="flex items-center gap-12 mb-2">
          <label className="text-lg font-semibold">Education</label>
          <p
            onClick={() => setOpenEducationAdder(true)}
            className="text-blue-600 hover:underline hover:cursor-pointer"
          >
            Add New
          </p>
        </div>

        {education.length === 0 && !openEducationAdder && (
          <p className="text-light_heading">Add your education</p>
        )}

        {education.length < 6 && openEducationAdder && (
          <div>
            <div className="flex flex-col gap-4">
              <SelectInput2
                data={countryList}
                defaultOption={SELECT_COUNTRY}
                style={{ borderRadius: "2px" }}
                ref={countryRef}
              />
              <input
                className="placeholder:text-icons text-sm outline-none w-full py-2 px-4 text-light_heading rounded-sm border border-no_focus focus:outline-none focus:border-light_grey"
                placeholder="College/University name"
                ref={collegeRef}
                onKeyDown={(e) => {
                  e.key === "Enter" && e.preventDefault();
                }}
              />
              <input
                className="placeholder:text-icons text-sm outline-none w-full rounded-sm py-2 px-4 text-light_heading border border-no_focus focus:outline-none focus:border-light_grey"
                placeholder="Title"
                ref={degreeTitleRef}
                onKeyDown={(e) => {
                  e.key === "Enter" && e.preventDefault();
                }}
              />
              <input
                className="placeholder:text-icons text-sm outline-none w-full rounded-sm py-2 px-4 text-light_heading border border-no_focus focus:outline-none focus:border-light_grey"
                placeholder="Major"
                ref={degreeMajorRef}
                onKeyDown={(e) => {
                  e.key === "Enter" && e.preventDefault();
                }}
              />
              <SelectInput2
                data={YEARS_LIST}
                defaultOption={YEAR_OF_GRADUATION}
                style={{ borderRadius: "2px" }}
                ref={yearOfGraduationRef}
              />
            </div>
            <div className="flex items-center gap-8 justify-end mt-4">
              <button
                onClick={handleCancelEducation}
                type="button"
                className="py-2 hover:cursor-pointer hover:underline rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleAddEducation}
                type="button"
                className="py-2 px-4 hover:cursor-pointer bg-icons text-white rounded"
              >
                Add
              </button>
            </div>
          </div>
        )}

        <ul className="mt-4 max-w-max">
          {education.map((edu, index) => (
            <li
              key={index}
              className="mb-4 flex justify-between gap-4 sm:gap-8 text-light_heading"
            >
              <div>
                <p className="capitalize">
                  {edu.degree} - {edu.major}
                </p>
                <p className="text-icons mt-2 leading-5">
                  {edu.collegeName}, {edu.country}, Graduated{" "}
                  {edu.yearOfGraduation}
                </p>
              </div>
              <p
                className="hover:text-warning hover:cursor-pointer"
                onClick={() => handleRemoveEducation(index)}
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

export default forwardRef(EducationSection);
