import React, { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import { TextArea, TextAreaRef } from "../TextArea/TextArea";
import { RootState } from "../../store";
import { useSelector } from "react-redux";

export type DescriptionSectionRef = {
  getDescription: () => string;
};

type DescriptionSectionProps = {};

const DescriptionSection = (props: DescriptionSectionProps, ref: React.Ref<DescriptionSectionRef>) => {
  const { user, isAuthenticated } = useSelector((state: RootState) => state.user);
  const [description, setDescription] = useState<string>("");

  useEffect(() => {
    if(isAuthenticated){
      setDescription(user!.description || "");
    }
  }, [user, isAuthenticated]);

  useImperativeHandle(ref, () => ({
    getDescription: () => description,
  }), [description]);

  return (
    <section>
      <label className="text-lg font-semibold mb-2">Description</label>
      <TextArea
        maxLength={600}
        placeholder="Enter your description"
        style={{ height: "200px", lineHeight: "1.5", color: "#4B5563" }}
        defaultText={user?.description}
        getText={(txt) => setDescription(txt)}
      />
    </section>
  );
};

export default forwardRef(DescriptionSection);
