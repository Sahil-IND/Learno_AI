import React from "react";

const HighlightText = ({text}) => {
  return (
    <span className="bg-gradient-to-b from-yellow-50 to-brown-50 text-transparent bg-clip-text font-bold">
      {" "}
      {text}
    </span>
  );
};

export default HighlightText;
