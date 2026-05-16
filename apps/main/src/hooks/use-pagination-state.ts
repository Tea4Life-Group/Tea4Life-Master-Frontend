import { useState, useCallback } from "react";
import type PaginationParams from "@/types/base/PaginationParams";

interface UsePaginationStateProps {
  initialPage?: number;
  initialSize?: number;
}

/**
 * Hook quản lý state cho phân trang (page, size).
 */
export const usePaginationState = ({
  initialPage = 1,
  initialSize = 10,
}: UsePaginationStateProps = {}) => {
  const [pagination, setPagination] = useState<PaginationParams>({
    page: initialPage,
    size: initialSize,
  });

  const onPageChange = useCallback((page: number) => {
    setPagination((prev) => ({ ...prev, page }));
  }, []);

  const onSizeChange = useCallback((size: number) => {
    setPagination((prev) => ({ ...prev, size, page: 1 }));
  }, []);

  return {
    pagination,
    onPageChange,
    onSizeChange,
    setPagination,
  };
};
