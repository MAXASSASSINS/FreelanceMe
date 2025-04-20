import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { AiOutlineSearch } from "react-icons/ai";
import { useDispatch } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import {
  hideDimBackground,
  showDimBackground,
} from "../../actions/dimBackgroundAction";
import { AppDispatch } from "../../store";
import { TagOption, tagOptions } from "../CreateGig/tagsData";

type SearchBarProps = {};

export type SearchBarRef = {
  getRefs: () => {
    searchRef: React.RefObject<HTMLInputElement>;
    tagListContainerRef: React.RefObject<HTMLUListElement>;
  };
  updateTagList: (tagList: TagOption[]) => void;
  updateSearch: (search: string) => void;
};

const SearchBar = (props: SearchBarProps, ref: React.Ref<SearchBarRef>) => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const location = useLocation();

  const [tagList, setTagList] = useState<TagOption[]>([]);
  const searchRef = useRef<HTMLInputElement>(null);
  const tagListContainerRef = useRef<HTMLUListElement>(null);

  useImperativeHandle(ref, () => ({
    getRefs: () => {
      return {
        searchRef,
        tagListContainerRef,
      };
    },
    updateTagList: (tagList: TagOption[]) => {
      setTagList(tagList);
    },
    updateSearch: (search: string) => {
      searchRef.current && (searchRef.current.value = search);
    },
  }), []);

  const handleSubmit = (
    e:
      | React.FormEvent<HTMLFormElement>
      | React.MouseEvent<HTMLDivElement>
      | React.MouseEvent<HTMLLIElement>
  ) => {
    e.preventDefault();
    hideDimBackground();
    const searchQuery = searchRef.current?.value.trim();
    setTagList([]);
    if (searchQuery === "") {
      navigate("/search");
      searchRef.current?.blur();
      dispatch(hideDimBackground());
      return;
    }
    const keywords = encodeURIComponent(searchQuery || "");
    navigate(`/search?keywords=${keywords}`);
    searchRef.current?.blur();
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    dispatch(showDimBackground());
    let search = e.target.value;
    if (!search) return;
    const tagList = tagOptions.filter((tag) =>
      tag.value.toLowerCase().includes(search.toLowerCase())
    );
    setTagList(tagList);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let search = e.target.value;
    let tagList: TagOption[] = [];
    if (search) {
      tagList = tagOptions.filter((tag) =>
        tag.value.toLowerCase().includes(search.toLowerCase())
      );
    }
    setTagList(tagList);
  };

  const handleTagClick = (e: React.MouseEvent<HTMLLIElement>) => {
    const tag = e.currentTarget.innerText;
    if (searchRef.current) searchRef.current.value = tag;
    handleSubmit(e);
    setTagList([]);
    dispatch(hideDimBackground());
  };

  useEffect(() => {
    let params = location.search;
    if (params && params.includes("keywords")) {
      const keywords = new URLSearchParams(params).get("keywords");
      if (searchRef.current && keywords)
        searchRef.current.value = keywords || "";
    }
  }, [location.search, searchRef]);


  return (
    <form className="form" id="header-search-bar" onSubmit={handleSubmit}>
      <input
        ref={searchRef}
        className="search-input"
        onFocus={handleFocus}
        placeholder="Find services"
        onChange={handleSearchChange}
      ></input>
      <div onClick={handleSubmit} className="search-icon">
        <AiOutlineSearch />
      </div>
      {tagList.length > 0 && (
        <div className="w-full bg-separator absolute top-16 z-[1000000] rounded max-h-[60vh] overflow-y-scroll">
          <ul className="" ref={tagListContainerRef}>
            {tagList.map((tag, index) => {
              return (
                <li
                  onClick={handleTagClick}
                  key={index}
                  value={tag.value}
                  className="px-4 py-3 hover:bg-dark_separator hover:cursor-pointer "
                >
                  {tag.value}
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </form>
  );
};

export default forwardRef(SearchBar);
