import React, { useState, useEffect, useRef } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import axios from "axios";
import "../css/TextEditor.css";

const editorContainerStyle = {
  width: "80%",
  margin: "0 auto",
  position: "relative",
};

const textEditorStyle = {
  width: "100%",
  height: "calc(100% - 40px)",
};

const customFontSizes = ["small", "normal", "large", "huge"];

const TextEditor = ({ otsikkoId, kenttaContent }) => {
  const [richText, setRichText] = useState(kenttaContent || "");
  const quillRef = useRef(null);

  useEffect(() => {
    if (kenttaContent !== null && kenttaContent !== undefined) {
      setRichText(kenttaContent);
    }
  }, [kenttaContent]);

  const handleChange = (html) => {
    setRichText(html);
  };

  const handleLogHtml = () => {
    console.log(richText);
  };

  const saveRichText = async () => {
    try {
      console.log("Sending richText data to server:", richText);
      await axios.post(
        `http://localhost:3001/api/save-rich-text/${otsikkoId}`,
        {
          richText,
        }, { withCredentials: true }
      );
      console.log("Rich text content saved successfully");
    } catch (error) {
      console.error("Error saving rich text content:", error);
    }
  };

  const modules = {
    toolbar: {
      container: [
        [{ header: "1" }, { header: "2" }, { font: [] }],
        [{ size: ["small", false, "large", "huge"] }],
        [{ list: "ordered" }, { list: "bullet" }],
        ["bold", "italic", "underline", "strike"],
        [{ align: [] }],
        ["link", "image"],
        ["blockquote", "code-block"],
        [{ color: [] }, { background: [] }],
        ["clean"],
      ],
    },
  };

  return (
    <div style={editorContainerStyle}>
      <ReactQuill
        theme="snow"
        value={richText}
        onChange={handleChange}
        style={textEditorStyle}
        modules={modules}
        ref={quillRef}
      />
      <button
        onClick={() => {
          saveRichText();
          handleLogHtml();
        }}
        className="log-button"
      >
        Tallena
      </button>
    </div>
  );
};

export default TextEditor;
