"use client";

import { MicrophoneIcon, X } from "@/components/Icons";
import { useState , useEffect } from "react";

// Speech recognition feature is coming soon

export function SelectField({ label, name, options, register }) {
  return (
    <div className="form-control mb-4 min-w-64">
      <label className="label">
        <span className="label-text text-base-content font-medium font-roboto-condensed">{label}</span>
      </label>
      <select {...register(name)} className="select select-bordered w-full">
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );
}

export function CheckboxField({ label, name, options, register, descriptions = {} }) {
  return (
    <div className="form-control mb-4 ">
      <label>
        <span className="label-text">{label}</span>
      </label>
      <div className="grid grid-cols-2 gap-4"> 
        {options.map((option) => (
          <label
            className="label cursor-pointer inline-flex items-center gap-3 "
            key={option}
            title={descriptions[option] || ""}
          >
            <input
              type="checkbox"
              value={option}
              {...register(name)}
              className="checkbox checkbox-primary "
            />
            <div className="label-text text-base-content flex-1 ">
              {option}
              <span style={{ display: 'none' }}>
                {descriptions[option] || ""}
              </span>
            </div>
          </label>
        ))}
      </div>
    </div>
  );
}

/**
 * The InputField component provides a text input field with clear functionality.
 *
 * - Displays a label and an input field.
 * - Allows users to input text manually.
 * - Provides buttons for voice input (coming soon) and clear the input field.
 *
 * @param {string} label - The label for the input field.
 * @param {string} name - The name attribute for the input field.
 * @param {Function} register - The register function for form handling.
 */
export function InputField({ label, name, register , watch }) {
  const [inputValue, setInputValue] = useState("");

   const watchedValue = watch ? watch(name) : "";
  useEffect(() => {
    setInputValue(watchedValue || "");
  }, [watchedValue]);

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  const handleClearInput = () => {
    setInputValue("");
  };

  const startListening = () => {
    // Voice input feature is coming soon
    alert("🎤 Voice input feature is coming soon! Stay tuned for updates.");
  };

  return (
    <div className="form-control mb-4">
      <label className="label">
        <span className="label-text">{label}</span>
      </label>
      <div className="relative w-full">
        <input
          type="text"
          {...register(name)}
          value={inputValue}
          onChange={handleInputChange}
          className="input input-bordered w-full pr-16 text-base-content bg-base-100 border-base-300"
        />

        <button
          type="button"
          onClick={startListening}
          className="absolute top-1/2 right-12 transform -translate-y-1/2 btn btn-circle btn-sm btn-outline"
          style={{
            borderColor: 'var(--accent)',
            color: 'var(--accent)',
            opacity: 0.7
          }}
          title="Voice input coming soon!"
        >
          <MicrophoneIcon />
        </button>

        <button
          type="button"
          onClick={handleClearInput}
          className="absolute top-1/2 right-2 transform -translate-y-1/2 btn btn-circle btn-sm btn-error"
        >
          <X />
        </button>
      </div>
    </div>
  );
}