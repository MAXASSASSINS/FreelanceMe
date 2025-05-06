import React, { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import { RootState } from "../../store";
import { useSelector } from "react-redux";

type TaglineSectonProps = {};

export type TaglineSectionRef = {
  getTagline: () => string;
};

const TaglineSecton = (props: TaglineSectonProps, ref: React.Ref<TaglineSectionRef>) => {
  const { user, isAuthenticated } = useSelector((state: RootState) => state.user);
  const [tagline, setTagline] = useState<string>("");

  useImperativeHandle(ref, () => ({
    getTagline: () => tagline,
  }), [tagline]);

  useEffect(() => {
    if (isAuthenticated) {
      setTagline(user!.tagline || "");
    }
  }, [user, isAuthenticated]);

  return (
    <section>
      <label className="text-lg font-semibold mb-2">Tagline</label>
      <input
        maxLength={60}
        type="text"
        onKeyDown={(e) => {
          e.key === "Enter" && e.preventDefault();
        }}
        className="outline-none w-full py-2 px-4 text-light_heading rounded border border-no_focus focus:outline-none focus:border-light_grey"
        value={tagline}
        onChange={(e) => setTagline(e.target.value)}
      />
    </section>
  );
};

export default forwardRef(TaglineSecton);
