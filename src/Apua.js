import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPhone, faEnvelope } from "@fortawesome/free-solid-svg-icons";

const Apua = () => {
  const commonTextStyle = { color: "#8E8E93", fontSize: "0.9rem" };

  return (
    <div className="apua-component">
      <h5 style={{ textDecoration: "underline", color: "#8E8E93" }}>
        Kaipaatko apua?
      </h5>
      <p style={commonTextStyle}>
        <FontAwesomeIcon icon={faPhone} style={{ marginRight: "5px" }} />
        045 123 4567
      </p>
      <p style={commonTextStyle}>
        <FontAwesomeIcon icon={faEnvelope} style={{ marginRight: "5px" }} />
        example@email.com
      </p>
    </div>
  );
};

export default Apua;
