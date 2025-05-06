import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import { BiTrash } from "react-icons/bi";
import { useSelector } from "react-redux";
import { SELECT_SKILL_LEVEL } from "../../constants/globalConstants";
import { skillLevels } from "../../data/skills";
import { RootState } from "../../store";
import SelectInput2, { SelectInput2Ref } from "../SelectInput2";

type Skill = {
  name: string;
  level: string;
};

type SkillsSectionProps = {};

export type SkillsSectionRef = {
  getSkills: () => Skill[];
};

const SkillsSection = (props: SkillsSectionProps, ref: React.Ref<SkillsSectionRef>) => {
  const { user, isAuthenticated } = useSelector(
    (state: RootState) => state.user
  );
  const [skills, setSkills] = useState<Skill[]>([]);
  const skillTitleRef = useRef<HTMLInputElement>(null);
  const skillLevelRef = useRef<SelectInput2Ref>(null);
  const [openSkillsAdder, setOpenSkillsAdder] = useState<boolean>(false);

  const handleAddSkill = () => {
    const name = skillTitleRef.current?.value;
    const level = skillLevelRef.current?.currValue;
    if (!name || !level || level === SELECT_SKILL_LEVEL) {
      return;
    }
    setSkills((prev) => [...prev, { name, level }]);
    skillTitleRef.current.value = "";
    skillLevelRef.current.setChoosedOptionComingFromParent(SELECT_SKILL_LEVEL);
    setOpenSkillsAdder(false);
  };

  const handleCancelSkill = () => {
    if (skillTitleRef.current) skillTitleRef.current.value = "";
    skillLevelRef.current?.setChoosedOptionComingFromParent(SELECT_SKILL_LEVEL);
    setOpenSkillsAdder(false);
  };

  const handleRemoveSkill = (index: number) => {
    setSkills((prev) => prev.filter((_, i) => i !== index));
  };

  useImperativeHandle(ref, () => ({
    getSkills: () => skills,
  }), [skills]);

  useEffect(() => {
    if (isAuthenticated) {
      setSkills(user!.skills);
    }
  }, [user, isAuthenticated]);

  return (
    <section>
      <div>
        <div className="flex items-center gap-12 mb-2">
          <label className="text-lg font-semibold">Skill</label>
          <p
            onClick={() => setOpenSkillsAdder(true)}
            className="text-blue-600 hover:underline hover:cursor-pointer"
          >
            Add New
          </p>
        </div>

        {skills.length === 0 && !openSkillsAdder && (
          <p className="text-light_heading">Add your skill</p>
        )}

        {skills.length < 6 && openSkillsAdder && (
          <div>
            <div className="flex flex-col gap-4">
              <input
                className="placeholder:text-icons text-sm outline-none w-full py-2 px-4 text-light_heading rounded-sm border border-no_focus focus:outline-none focus:border-light_grey"
                placeholder="Add Skill (e.g. Graphic Design)"
                ref={skillTitleRef}
                onKeyDown={(e) => {
                  e.key === "Enter" && e.preventDefault();
                }}
              />
              <SelectInput2
                data={skillLevels}
                defaultOption={SELECT_SKILL_LEVEL}
                style={{ borderRadius: "2px" }}
                ref={skillLevelRef}
              />
            </div>
            <div className="flex items-center gap-8 justify-end mt-4">
              <button
                onClick={handleCancelSkill}
                type="button"
                className="py-2 hover:cursor-pointer hover:underline rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleAddSkill}
                type="button"
                className="py-2 px-4 hover:cursor-pointer bg-icons text-white rounded"
              >
                Add
              </button>
            </div>
          </div>
        )}

        <ul className="mt-4 max-w-max">
          {skills.map((skill, index) => (
            <li
              key={index}
              className="mb-4 flex justify-between gap-8  text-light_heading"
            >
              <div>
                <p className="capitalize">{skill.name}</p>
                <p className="text-icons capitalize mt-2">{skill.level}</p>
              </div>
              <p
                className="hover:text-warning hover:cursor-pointer"
                onClick={() => handleRemoveSkill(index)}
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

export default forwardRef(SkillsSection);
