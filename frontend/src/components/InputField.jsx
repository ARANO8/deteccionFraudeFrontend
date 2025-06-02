import React from "react";

const InputField = ({
  label,
  type = "text",
  value,
  onChange,
  name,
  placeholder,
  required = false,
  ...props
}) => (
  <div className="input-group">
    <label htmlFor={name}>{label}</label>
    <input
      id={name}
      name={name}
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      required={required}
      {...props}
    />
  </div>
);

export default InputField;
