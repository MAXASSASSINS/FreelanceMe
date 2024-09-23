import { PlacesType, Tooltip as ReactTooltip } from "react-tooltip";
import { colors } from "../../utility/color";
import "./Tooltip.css";

type TooltipProps = {
  id: string;
  place: PlacesType;
  content: string;
  variant: string;
};

export const Tooltip = ({ id, place, content, variant }: TooltipProps) => {
  return (
    <ReactTooltip
      style={{
        lineHeight: "1.5",
        maxWidth: "35ch",
        backgroundColor: variant
          ? colors.get(variant)
          : colors.get("dark_grey_color"),
        zIndex: "999",
      }}
      place={place}
      id="my-tooltip"
    />
  );
};
