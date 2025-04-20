import { useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import CertificateSection, {
  CertificateSectionRef,
} from "../component/UpdateUserProfile/CertificateSection";
import DescriptionSection, {
  DescriptionSectionRef,
} from "../component/UpdateUserProfile/DescriptionSection";
import EducationSection, {
  EducationSectionRef,
} from "../component/UpdateUserProfile/EducationSection";
import LanguageSection, {
  LanguageSectionRef,
} from "../component/UpdateUserProfile/LanguageSection";
import ProfilePictureSection, {
  ProfilePictureSectionRef,
} from "../component/UpdateUserProfile/ProfilePictureSection";
import SkillsSection, {
  SkillsSectionRef,
} from "../component/UpdateUserProfile/SkillsSection";
import TaglineSecton, {
  TaglineSectionRef,
} from "../component/UpdateUserProfile/TaglineSecton";
import { AppDispatch, RootState } from "../store";
import { IFile } from "../types/file.types";
import { axiosInstance } from "../utility/axiosInstance";

type FormData = {
  avatar: IFile;
  tagline: string | undefined;
  description: string | undefined;
  languages: { name: string; level: string }[];
  education: {
    country: string;
    collegeName: string;
    degree: string;
    major: string;
    yearOfGraduation: string;
  }[];
  certificates: {
    name: string;
    certifiedFrom: string;
    year: string;
  }[];
  skills: {
    name: string;
    level: string;
  }[];
};

export const UpdateUserProfile = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { user, isAuthenticated } = useSelector(
    (state: RootState) => state.user
  );

  const profilePictureSectionRef = useRef<ProfilePictureSectionRef>(null);
  const taglineSectionRef = useRef<TaglineSectionRef>(null);
  const descriptionSectionRef = useRef<DescriptionSectionRef>(null);
  const languagesSectionRef = useRef<LanguageSectionRef>(null);
  const educationSectionRef = useRef<EducationSectionRef>(null);
  const certificatesSectionRef = useRef<CertificateSectionRef>(null);
  const skillsSectionRef = useRef<SkillsSectionRef>(null);

  const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const payload = {
      avatar: profilePictureSectionRef.current?.getAvatar(),
      tagline: taglineSectionRef.current?.getTagline(),
      description: descriptionSectionRef.current?.getDescription(),
      languages: languagesSectionRef.current?.getLanguages(),
      education: educationSectionRef.current?.getEducation(),
      certificates: certificatesSectionRef.current?.getCertificates(),
      skills: skillsSectionRef.current?.getSkills(),
    };
    
    try {
      const { data } = await axiosInstance.put("/user/update", payload);
      console.log(data.user);
      dispatch({ type: "UPDATE_USER_SUCCESS", payload: data.user });
      navigate(`/user/${data.user._id}`);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    isAuthenticated && (
      <div className="p-8 sm:px-12 md:px-20  md:py-12 lg:px-40 text-dark_grey leading-5">
        <h1 className="text-2xl sm:text-3xl font-semibold">Hi {user?.name}</h1>
        <p className="leading-5 text-light_heading mt-2 sm:mt-4">
          Please fill out the below form to update your profile.
        </p>
        <form
          className="mt-8 md:max-w-xl flex flex-col gap-8"
          onSubmit={handleFormSubmit}
        >
          <ProfilePictureSection ref={profilePictureSectionRef} />
          <TaglineSecton ref={taglineSectionRef} />
          <DescriptionSection ref={descriptionSectionRef} />
          <LanguageSection ref={languagesSectionRef} />
          <EducationSection ref={educationSectionRef} />
          <CertificateSection ref={certificatesSectionRef} />
          <SkillsSection ref={skillsSectionRef} />
          <div className="flex justify-end">
            <button className="bg-primary text-white px-8 py-3 rounded hover:cursor-pointer hover:bg-primary_hover">
              Submit
            </button>
          </div>
        </form>
      </div>
    )
  );
};
