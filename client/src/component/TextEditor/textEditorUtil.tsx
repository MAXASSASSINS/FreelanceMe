import { BiItalic } from "react-icons/bi";
import { GoBold, GoListOrdered, GoListUnordered } from "react-icons/go";
import { MdOutlineHighlight } from "react-icons/md";
import { EditorState, RichUtils } from "draft-js";

export const inlineStyleButtons = [
  {
    value: "Bold",
    style: "BOLD",
  },

  {
    value: "Italic",
    style: "ITALIC",
  },

  {
    value: "Highlight",
    style: "HIGHLIGHT",
  },
];

export const blockTypeButtons = [
  {
    value: "Unordered List",
    block: "unordered-list-item",
  },

  {
    value: "Ordered List",
    block: "ordered-list-item",
  },
];

export const getIcon = (value: string) => {
  switch (value) {
    case "BOLD":
      return <GoBold />;
    case "ITALIC":
      return <BiItalic />;
    case "HIGHLIGHT":
      return <MdOutlineHighlight />;
    case "unordered-list-item":
      return <GoListUnordered />;
    case "ordered-list-item":
      return <GoListOrdered />;
    default:
      return "";
  }
};

type InlineStyleButtonProps = {
  style: string;
  value: string;
  toggleInlineStyle: (event: React.MouseEvent<HTMLButtonElement>) => void;
  editorState: EditorState;
};

export const InlineStyleButton = ({
  style,
  value,
  toggleInlineStyle,
  editorState,
}: InlineStyleButtonProps) => {
  const currentInlineStyle = editorState.getCurrentInlineStyle();
  let color = "";
  if (currentInlineStyle.has(style)) {
    color = "#1dbf73";
  }

  return (
    <button
      key={style}
      value={value}
      style={{ color: color }}
      data-style={style}
      onClick={(e) => toggleInlineStyle(e)}
      onMouseDown={(e) => e.preventDefault()}
    >
      {getIcon(style)}
    </button>
  );
};


type BlockStyleButtonProps = {
  block: string;
  toggleBlockType: (event: React.MouseEvent<HTMLButtonElement>) => void;
  editorState: EditorState;
};

export const BlockStyleButton = ({
  block,
  toggleBlockType,
  editorState,
}: BlockStyleButtonProps)  => {
  const currentBlockType = RichUtils.getCurrentBlockType(editorState);
  let color = "";
  if (currentBlockType === block) {
    color = "#1dbf73";
  }

  return (
    <button
      style={{ color: color }}
      data-block={block}
      onClick={toggleBlockType}
      onMouseDown={(e) => e.preventDefault()}
    >
      {getIcon(block)}
    </button>
  );
};
