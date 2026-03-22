import React, { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import SelectInput2, { SelectInput2Ref } from "../SelectInput2";
import { languageFluencyLevelData, languagesData } from "../../data/languages";
import { BiTrash } from "react-icons/bi";
import {
  SELECT_FLUENCY_LEVEL,
  SELECT_LANGUAGE,
} from "../../constants/globalConstants";
import { useSelector } from "react-redux";
import { RootState } from "../../store";
import { Tooltip } from "react-tooltip";
import { AiFillInfoCircle, AiFillQuestionCircle } from "react-icons/ai";

type Language = {
  name: string;
  level: string;
};

type LanguageSectionProps = {};

export type LanguageSectionRef = {
  getLanguages: () => Language[];
};

const LanguageSection = (
  props: LanguageSectionProps,
  ref: React.Ref<LanguageSectionRef>
) => {
  const { user, isAuthenticated } = useSelector(
    (state: RootState) => state.user
  );
  const [languages, setLanguages] = useState<Language[]>([]);
  const [openLanguageAdder, setOpenLanguageAdder] = useState<boolean>(false);
  const currLanguageRef = useRef<SelectInput2Ref>(null);
  const currLanguageFluencyLevelRef = useRef<SelectInput2Ref>(null);
  const handleCurrLanguageChange = () => {
    currLanguageFluencyLevelRef.current?.setChoosedOptionComingFromParent(
      SELECT_FLUENCY_LEVEL
    );
  };

  const handleAddLanguage = () => {
    const currLanguage = currLanguageRef.current?.currValue;
    const currLanguageFluencyLevel =
      currLanguageFluencyLevelRef.current?.currValue;
    if (
      !currLanguage ||
      !currLanguageFluencyLevel ||
      currLanguage.toLowerCase() === SELECT_LANGUAGE.toLowerCase() ||
      currLanguageFluencyLevel.toLowerCase() ===
        SELECT_FLUENCY_LEVEL.toLowerCase()
    )
      return;

    setLanguages((prev) => [
      ...prev,
      { name: currLanguage, level: currLanguageFluencyLevel },
    ]);

    currLanguageRef.current?.setChoosedOptionComingFromParent(SELECT_LANGUAGE);
    currLanguageFluencyLevelRef.current?.setChoosedOptionComingFromParent(
      "Select fluency level"
    );
    setOpenLanguageAdder(false);
  };

  const handleCancelLanguage = () => {
    currLanguageRef.current?.setChoosedOptionComingFromParent(SELECT_LANGUAGE);
    currLanguageFluencyLevelRef.current?.setChoosedOptionComingFromParent(
      "Select fluency level"
    );
    setOpenLanguageAdder(false);
  };

  const handleRemoveLanguage = (index: number) => {
    setLanguages((prev) => prev.filter((_, i) => i !== index));
  };

  useImperativeHandle(ref, () => ({
    getLanguages: () => languages,
  }), [languages]);

  useEffect(() => {
    if (isAuthenticated) {
      setLanguages(user!.languages);
    }
  }, [user, isAuthenticated]);

  return (
    <section>
      <div className="-mt-4">
        <div className="flex items-center gap-12 mb-2">
          <div className="flex gap-2 items-center">
            <label className="text-lg font-semibold">Languages</label>
            <p
              data-tooltip-content="You can add upto 4 languages"
              data-tooltip-id="my-tooltip"
              data-tooltip-place="top"
            >
              <AiFillInfoCircle className="text-no_focus" />
            </p>
          </div>

          {languages.length < 4 && (
            <p
              onClick={() => setOpenLanguageAdder(true)}
              className="text-blue-600 hover:underline hover:cursor-pointer"
            >
              Add New
            </p>
          )}
        </div>
        {languages.length === 0 && !openLanguageAdder && (
          <p className="text-light_heading">Add language</p>
        )}
        {languages.length < 4 && openLanguageAdder && (
          <div className="">
            <div className="flex flex-col md:flex-row items-center gap-4 md:gap-8">
              <SelectInput2
                data={languagesData}
                defaultOption={SELECT_LANGUAGE}
                onChange={handleCurrLanguageChange}
                ref={currLanguageRef}
                style={{ borderRadius: "2px" }}
              />
              <SelectInput2
                data={languageFluencyLevelData}
                defaultOption={SELECT_FLUENCY_LEVEL}
                ref={currLanguageFluencyLevelRef}
                style={{ borderRadius: "2px" }}
              />
            </div>
            <div className="flex items-center gap-8 justify-end mt-4">
              <button
                onClick={handleCancelLanguage}
                type="button"
                className="py-2 hover:cursor-pointer hover:underline rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleAddLanguage}
                type="button"
                className="py-2 px-4 hover:cursor-pointer bg-icons text-white rounded"
              >
                Add
              </button>
            </div>
          </div>
        )}
        <ul className="mt-4 max-w-max">
          {languages.map((lang, index) => (
            <li
              key={index}
              className="mb-4 flex gap-4 sm:gap-8 justify-between text-light_heading"
            >
              <p className="capitalize">
                {lang.name} - {lang.level}
              </p>
              <p
                className="hover:text-warning hover:cursor-pointer"
                onClick={() => handleRemoveLanguage(index)}
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

export default forwardRef(LanguageSection);
