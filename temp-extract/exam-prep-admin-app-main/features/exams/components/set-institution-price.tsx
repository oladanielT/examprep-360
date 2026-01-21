"use client";

import { CheckboxSelect } from "@/components/custom/custom-checkbox-select";
import { InputField } from "@/components/custom/custom-form-field";
import { CustomSelect } from "@/components/custom/custom-select";
import { Button } from "@/components/ui/button";
import { priceDurations } from "@/lib/placehoder-data";
import React, { useState } from "react";
import { X } from "lucide-react";

interface PriceTag {
  id: string;
  price: string;
  duration: string;
}

export const SetInstitutionPrice = () => {
  const [discountType, setDiscountType] = useState("percentage");
  const [price, setPrice] = useState("");
  const [duration, setDuration] = useState("");
  const [users, setUsers] = useState("");
  const [discount, setDiscount] = useState("");
  const [tags, setTags] = useState<PriceTag[]>([]);

  const handleAddTag = () => {
    if (price && duration) {
      const newTag: PriceTag = {
        id: `${Date.now()}`,
        price,
        duration,
      };
      setTags([...tags, newTag]);
      setPrice("");
      setDuration("");
    }
  };

  const handleRemoveTag = (id: string) => {
    setTags(tags.filter((tag) => tag.id !== id));
  };

  return (
    <section className="space-y-8">
      {/* Tags Display */}
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-3 bg-gray-50 p-3 rounded-2xl">
          {tags.map((tag) => (
            <div
              key={tag.id}
              className="flex items-center gap-2 bg-[#BEE74C] px-4 py-2 rounded-full"
            >
              <span className="text-sm font-semibold text-black">
                N{tag.price} for {tag.duration} days
              </span>
              <button
                onClick={() => handleRemoveTag(tag.id)}
                className="hover:opacity-70 transition-opacity"
              >
                <X size={18} className="text-black" />
              </button>
            </div>
          ))}
        </div>
      )}

      <InputField
        label="Price"
        placeholder="N5000"
        value={price}
        onChange={(e) => setPrice(e.target.value)}
      />

      <InputField
        label="Number of Users"
        placeholder="200"
        value={users}
        onChange={(e) => setUsers(e.target.value)}
      />

      <CustomSelect
        label="Durations"
        placeholder="30days"
        options={priceDurations}
        value={duration}
        onValueChange={setDuration}
      />

      <div className="space-y-3">
        <CheckboxSelect
          label="Discount"
          options={[
            { label: "Percentage", value: "percentage" },
            { label: "Flat", value: "flat" },
          ]}
          value={discountType}
          onValueChange={setDiscountType}
        />
        <InputField
          placeholder="50%"
          value={discount}
          onChange={(e) => setDiscount(e.target.value)}
        />
      </div>

      <Button
        onClick={handleAddTag}
        className="w-full h-12 rounded-full bg-[#BEE74C] hover:bg-[#B0D945] text-black font-medium"
      >
        Add Price
      </Button>

      <Button className="w-full h-12 rounded-full bg-[#BEE74C] hover:bg-[#B0D945] text-black font-medium">
        Set Price
      </Button>
    </section>
  );
};
