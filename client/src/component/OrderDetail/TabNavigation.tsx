import React, { useContext } from "react";
import { windowContext } from "../../App";
import { green_color } from "../../utility/color";

const styleActiveTab = {
  color: green_color,
  borderBottom: "2px solid" + green_color,
};

type TabNavigationProps = {
  activeTab: number;
  setActiveTab: React.Dispatch<React.SetStateAction<number>>;
};

const TabNavigation = ({ activeTab, setActiveTab }: TabNavigationProps) => {
  const { windowWidth } = useContext(windowContext);

  const tabsList = [
    { name: "Activity", id: 0 },
    { name: "Details", id: 1 },
    {
      name: windowWidth < 600 ? "Req's" : "Requirements",
      id: 2,
    },
    { name: "Delivery", id: 3 },
  ];

  return (
    <header className="mb-8">
      <nav>
        <ul className="text-sm uppercase flex gap-6 border-b-2 border-b-dark_separator mb-4 text-no_focus tracking-wide sm:text-base sm:gap-8">
          {tabsList.map((tab) => (
            <li
              key={tab.id}
              className="pb-2 -m-0.5 hover:cursor-pointer"
              style={activeTab === tab.id ? styleActiveTab : undefined}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.name}
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
};

export default TabNavigation;
