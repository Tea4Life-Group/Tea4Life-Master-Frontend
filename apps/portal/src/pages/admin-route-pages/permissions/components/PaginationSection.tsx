import React from "react";
import PaginationComponent from "@/components/custom/PaginationComponent";

interface PaginationSectionProps {
  page: number;
  size: number;
  totalElements: number;
  onPageChange: (page: number) => void;
  onSizeChange: (size: number) => void;
}

const PaginationSection: React.FC<PaginationSectionProps> = ({
  page,
  size,
  totalElements,
  onPageChange,
  onSizeChange,
}) => {
  return (
    <PaginationComponent
      totalCount={totalElements}
      pageSize={size}
      currentPage={page}
      onPageChange={onPageChange}
      onSizeChange={onSizeChange}
    />
  );
};

export default PaginationSection;
