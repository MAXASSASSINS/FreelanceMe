import { useRef } from "react";
import { BiChevronLeft, BiChevronRight } from "react-icons/bi";
import { useNavigate } from "react-router-dom";
import { categoriesData } from "./CreateGig/createGigData";

export const SearchTagsBar = () => {
  const categoryContainerRef = useRef<HTMLUListElement | null>(null);
  const navigate = useNavigate();

  const handleScrollLeft = () => {
    categoryContainerRef?.current?.scrollBy({
      top: 0,
      left: -200, // Adjust the scroll distance through this
      behavior: "smooth",
    });
  };

  const handleScrollRight = () => {
    categoryContainerRef?.current?.scrollBy({
      top: 0,
      left: 200, // Adjust the scroll distance through this
      behavior: "smooth",
    });
  };

  const handleCategoryClick = (e: React.MouseEvent<HTMLLIElement>) => {
    const searchInput = document.querySelector(".search-input") as HTMLInputElement; 
    searchInput!.value = "";
    const category = (e.target as HTMLElement).innerText;
    const encodedCategory = encodeURIComponent(category);
    navigate(`/search?category=${encodedCategory}`);
  };

  return (
    <div>
      <nav className="flex gap-2 items-center justify-between border-b px-6 xl:px-12 text-light_heading">
        <BiChevronLeft
          onClick={handleScrollLeft}
          className="flex-shrink-0 text-2xl xl:hidden"
          size={20}
        />
        <ul
          ref={categoryContainerRef}
          className="text-sm sm:text-base flex-grow flex gap-6 overflow-scroll scrollbar-hide items-center justify-between"
        >
          {categoriesData.map((category, index) => (
            <li
              key={index}
              onClick={handleCategoryClick}
              className=" min-w-max  capitalize py-3 hover:cursor-pointer hover:border-b-2 border-primary hover:pb-2.5"
            >
              {category}
            </li>
          ))}
        </ul>
        <BiChevronRight
          onClick={handleScrollRight}
          className="flex-shrink-0 xl:hidden text-2xl"
          size={20}
        />
      </nav>
    </div>
  );
};
