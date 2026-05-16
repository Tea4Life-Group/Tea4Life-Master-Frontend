import { useMemo } from "react";

export const DOTS = "...";

interface UsePaginationProps {
  totalCount: number;
  pageSize: number;
  currentPage: number;
}

/**
 * Hook logic để tính toán dãy số trang hiển thị theo logic cụ thể của người dùng.
 */
export const usePagination = ({
  totalCount,
  pageSize,
  currentPage,
}: UsePaginationProps) => {
  const paginationRange = useMemo(() => {
    const totalPages = Math.ceil(totalCount / pageSize);

    if (totalPages <= 1) return [1];

    const center = [
      currentPage - 2,
      currentPage - 1,
      currentPage,
      currentPage + 1,
      currentPage + 2,
    ];

    const filteredCenter = center.filter((p) => p > 1 && p < totalPages);

    const includeThreeLeft = currentPage === 5;
    const includeThreeRight = currentPage === totalPages - 4;
    const includeLeftDots = currentPage > 5;
    const includeRightDots = currentPage < totalPages - 4;

    if (includeThreeLeft) filteredCenter.unshift(2);
    if (includeThreeRight) filteredCenter.push(totalPages - 1);

    const result: (number | string)[] = [];
    result.push(1);

    if (includeLeftDots) {
      result.push(DOTS);
    }

    result.push(...filteredCenter);

    if (includeRightDots) {
      result.push(DOTS);
    }

    result.push(totalPages);

    return result;
  }, [totalCount, pageSize, currentPage]);

  return paginationRange;
};
