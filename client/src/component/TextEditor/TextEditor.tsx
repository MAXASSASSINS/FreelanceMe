import {
  convertFromRaw,
  convertToRaw,
  Editor,
  EditorState,
  RichUtils,
} from "draft-js";
import { forwardRef, useImperativeHandle, useState } from "react";
import "../../../node_modules/draft-js/dist/Draft.css";
import "./textEditor.css";
import {
  BlockStyleButton,
  blockTypeButtons,
  InlineStyleButton,
  inlineStyleButtons,
} from "./textEditorUtil";

type TextEditorProps = {
  maxLength?: number;
  hideToolbar?: boolean;
  hideFooter?: boolean;
};

export type TextEditorRef = {
  getDescriptionLength: () => number;
  getDescription: () => { contentState: string; description: string };
  setDescriptionComingFromParent: (description: string) => void;
};

export const TextEditor = forwardRef(
  ({ maxLength = Number.MAX_VALUE, hideToolbar = false, hideFooter = false }: TextEditorProps, ref) => {
    const [length, setLength] = useState<number>(0);
    const [editorState, setEditorState] = useState<EditorState>(() =>
      EditorState.createEmpty()
    );

    const handleChange = (editorState: EditorState) => {
      setEditorState(editorState);
      setLength(editorState.getCurrentContent().getPlainText().length);
    };

    const toggleInlineStyle = (event: React.MouseEvent<HTMLButtonElement>) => {
      event.preventDefault();

      let style = event.currentTarget.getAttribute("data-style");
      if (style) {
        setEditorState(RichUtils.toggleInlineStyle(editorState, style));
      }
    };

    const toggleBlockType = (event: React.MouseEvent<HTMLButtonElement>) => {
      event.preventDefault();

      let block = event.currentTarget.getAttribute("data-block");
      if (block) {
        setEditorState(RichUtils.toggleBlockType(editorState, block));
      }
    };

    const styleMap = {
      HIGHLIGHT: {
        backgroundColor: "yellow",
      },
    };

    useImperativeHandle(
      ref,
      () => ({
        getDescriptionLength() {
          return length;
        },
        getDescription() {
          const contentState = JSON.stringify(
            convertToRaw(editorState.getCurrentContent())
          );
          const description = editorState.getCurrentContent().getPlainText();
          return { contentState, description };
        },
        setDescriptionComingFromParent(description: string) {
          if (!description) return;
          let contentState = convertFromRaw(JSON.parse(description));
          let editorState = EditorState.createWithContent(contentState);
          setLength(editorState.getCurrentContent().getPlainText().length);
          setEditorState(editorState);
        },
      }),
      [editorState, length]
    );

    return (
      <div className="textEditor-main">
        <div
          className="textEditor-toolbar"
          style={{ display: hideToolbar ? "none" : "flex" }}
        >
          {inlineStyleButtons.map((button, index) => {
            return (
              <InlineStyleButton
                key={index}
                value={button.value}
                style={button.style}
                editorState={editorState}
                toggleInlineStyle={toggleInlineStyle}
              />
            );
          })}
          {blockTypeButtons.map((button, index) => {
            return (
              <BlockStyleButton
                key={index}
                block={button.block}
                editorState={editorState}
                toggleBlockType={toggleBlockType}
              />
            );
          })}
        </div>

        <Editor
          editorState={editorState}
          onChange={handleChange}
          customStyleMap={styleMap}
          customStyleFn={() => {
            return {
              lineHeight: 1.5,
            };
          }}
        />

        <div
          className="textEditor-footer"
          style={{ display: hideFooter ? "none" : "block" }}
        >
          <p>
            {length} / {maxLength} Characters
          </p>
        </div>
      </div>
    );
  }
);
