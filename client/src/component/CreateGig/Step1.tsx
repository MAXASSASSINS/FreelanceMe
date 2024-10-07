import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import ReactSelect, { ActionMeta, MultiValue } from "react-select";
import { useUpdateGlobalLoading } from "../../context/globalLoadingContext";
import { AppDispatch, RootState } from "../../store";
import SelectInput2, { SelectInput2Ref } from "../SelectInput/SelectInput2";
import { TextArea, TextAreaRef } from "../TextArea/TextArea";
import { StepProps, StepRef } from "./CreateGig";
import { categoriesData, subCategoriesData } from "./createGigData";
import { TagOption, tagOptions } from "./tagsData";

// export type Step1Ref = {
//   handleSubmit: () => Promise<boolean>
// };

const Step1 = ({ handleSendData }: StepProps, ref: React.Ref<StepRef>) => {
  const navigate = useNavigate();
  const params = useParams();
  const dispatch = useDispatch<AppDispatch>();
  const { gigDetail } = useSelector((state: RootState) => state.gigDetail);
  const updateGlobalLoading = useUpdateGlobalLoading();
  const gigTitleInputRef = useRef<TextAreaRef>(null);
  const [gigTitleInput, setGigTitleInput] = useState<string>("I will ");
  const [enalbeGigTitleInputWarning, setEnalbeGigTitleInputWarning] =
    useState<boolean>(false);
  const [tags, setTags] = useState<TagOption[]>([]);
  const [tagListWarning, setTagListWarning] = useState<boolean>(false);
  const selectedCategoryRef = useRef<SelectInput2Ref>(null);
  const selectedSubCategoryRef = useRef<SelectInput2Ref>(null);
  const [selectedCategory, setSelectedCategory] =
    useState<string>("Select a category");
  const [selectedSubCategory, setSelectedSubCategory] = useState<string>(
    "Select a sub-category"
  );
  const [categoryWarning, setCategoryWarning] = useState<string>("");
  const tagListRef = useRef(null);

  const getGigTitleInput = (val: string) => {
    if (val.trim().length < 15) {
      setEnalbeGigTitleInputWarning(true);
    } else {
      setEnalbeGigTitleInputWarning(false);
    }
    setGigTitleInput(val);
  };

  const getSelectedCategory = (val: string) => {
    setSelectedCategory(val);
    setSelectedSubCategory("Select a sub-category");
  };

  const getSelectedSubCategory = (val: string) => {
    setSelectedSubCategory(val);
  };

  const getSubCategoryList = (val: string) => {
    if (val !== "Select a category") {
      const index = Object.keys(subCategoriesData).findIndex((item) => {
        return item.toLowerCase() === val.toLowerCase();
      });
      const list = Object.values(subCategoriesData)[index];
      return list;
    } else {
      return [];
    }
  };

  const handleTagsChange = (
    newValue: MultiValue<TagOption>,
    actionMeta: ActionMeta<TagOption>
  ) => {
    const tags = newValue as TagOption[];
    setTags(tags);
    if (tags.length >= 1 && tags.length < 6) {
      setTagListWarning(false);
    } else {
      setTagListWarning(true);
    }
  };

  const checkForWarnings = () => {
    if (gigTitleInput.length < 15) {
      setEnalbeGigTitleInputWarning(true);
      return true;
    }
    if (selectedCategory === "Select a category") {
      setCategoryWarning("Please select a category and sub-category");
      return true;
    }
    if (selectedSubCategory === "Select a sub-category") {
      setCategoryWarning("Please select a sub-category");
      return true;
    }

    if (tags.length < 1 || tags.length > 5) {
      setTagListWarning(true);
      return true;
    }
    setEnalbeGigTitleInputWarning(false);
    setTagListWarning(false);
  };

  const getSearchTags = () => {
    const tagsList = tags.map((item, index) => {
      return item.value;
    });
    return tagsList;
  };

  const handleSubmit = async () => {
    if (checkForWarnings()) {
      return false;
    }
    const data = {
      title: gigTitleInput,
      category: selectedCategory,
      subCategory: selectedSubCategory,
      searchTags: getSearchTags(),
    };
    const payload = { data, step: 1 };
    const res = await handleSendData(payload);
    return res || false;
  };

  useEffect(() => {
    setCategoryWarning("");
  }, [selectedSubCategory, selectedCategory]);

  useEffect(() => {
    const { title, category, subCategory, searchTags } = gigDetail || {};
    gigTitleInputRef.current?.setTextComingFromParent(title || "I will ");
    selectedCategoryRef.current?.setChoosedOptionComingFromParent(
      category || ""
    );
    selectedSubCategoryRef.current?.setChoosedOptionComingFromParent(
      subCategory || ""
    );
    setGigTitleInput(title || "");
    setSelectedCategory(category || "");
    setSelectedSubCategory(subCategory || "");
    const tags = searchTags?.map((item, index) => {
      return { value: item, label: item };
    });
    setTags(tags || []);
  }, [gigDetail]);

  useImperativeHandle(ref, () => ({
    handleSubmit,
  }));

  return (
    <div className="overview pb-8">
      <div className="overview-wrapper">
        <div className="left-side">
          <div>
            <h3>Gig title</h3>
            <p>
              As your Gig storefront, your title is the most important place to
              include keywords that buyers would likely use to search for a
              service like yours.
            </p>
          </div>
          <div>
            <h3>Category</h3>
            <p>
              Choose the category and sub-category most suitable for your Gig.
            </p>
          </div>
          <div>
            <h3>Search tags</h3>
            <p>
              Tag your Gig with buzz words that are relevant to the services you
              offer. Use all 5 tags to get found.
            </p>
          </div>
        </div>
        <div className="right-side">
          <div>
            <TextArea
              maxLength={100}
              minLength={0}
              placeholder="I will do something I'm really good at"
              defaultText={"I will "}
              style={{ fontSize: "18px" }}
              getText={getGigTitleInput}
              ref={gigTitleInputRef}
            />
            {enalbeGigTitleInputWarning && (
              <div className="gig-title-input-warning">
                15 characters minimum
              </div>
            )}
          </div>
          <div className="category-section">
            <div>
              <SelectInput2
                defaultOption={"Select a category"}
                data={categoriesData}
                style={{ textTransform: "uppercase" }}
                getChoosenOption={getSelectedCategory}
                ref={selectedCategoryRef}
              />
              <SelectInput2
                defaultOption={"Select a sub-category"}
                data={
                  selectedCategory ? getSubCategoryList(selectedCategory) : []
                }
                style={{ textTransform: "uppercase" }}
                getChoosenOption={getSelectedSubCategory}
                ref={selectedSubCategoryRef}
              />
            </div>
            {categoryWarning !== "" && (
              <div className="category-warning">{categoryWarning}</div>
            )}
          </div>

          <div className="keyword-section">
            <h6>Positive keywords</h6>
            <p>
              Enter search terms you feel your buyers will use when looking for
              your service.
            </p>
            <ReactSelect
              ref={tagListRef}
              options={tagOptions}
              isMulti
              maxMenuHeight={150}
              placeholder="Enter your tags"
              onChange={handleTagsChange}
              value={tags}
              menuPlacement="top"
            />
            <p className="recommend">
              5 tags maximum. Use letters and numbers only. <br />
              Tags should be comma seprated.
            </p>
            {tagListWarning && (
              <p className="tag-list-warning">
                Number of tags is not in range of 1 to 5
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default forwardRef(Step1);