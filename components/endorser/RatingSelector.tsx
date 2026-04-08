import React from 'react'

  const ratingLabels = {
    1: "Beginner - Basic understanding",
    2: "Developing - Growing competence",
    3: "Competent - Solid proficiency",
    4: "Advanced - Strong expertise",
    5: "Expert - Exceptional mastery",
  };


const RatingSelector = ({
  value,
  onChange,
  label,
  icon: Icon,
}: {
  value: number;
  onChange: (val: number) => void;
  label: string;
  icon: React.ElementType;
}) => {
  return (
    <div className="mb-6">
      <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-3">
        <Icon className="w-4 h-4 text-indigo-600" />
        {label} <span className="text-red-500">*</span>
      </label>
      <div className="space-y-2">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            className={`w-full text-left px-4 py-3 rounded-lg border-2 transition-all ${
              star === value
                ? "border-indigo-600 bg-indigo-50"
                : "border-gray-200 hover:border-indigo-300"
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-gray-900">
                {ratingLabels[star as keyof typeof ratingLabels]}
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default RatingSelector
