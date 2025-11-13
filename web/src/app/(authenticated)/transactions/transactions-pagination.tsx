"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationPrevious,
  PaginationLink,
  PaginationNext,
} from "@/components/ui/pagination";
import { PaginationMetaResponse } from "@/common/interfaces/pagination-meta-response";

interface TransactionsPaginationProps {
  meta?: PaginationMetaResponse;
}

export function TransactionsPagination({ meta }: TransactionsPaginationProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());

    if ((meta?.totalPages || 0) === 0) {
      params.delete("pageIndex");
    }

    if (currentPage && currentPage !== 1) {
      params.set("pageIndex", String(currentPage));
    } else {
      params.delete("pageIndex");
    }

    router.push(`?${params.toString()}`);
  }, [currentPage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="flex items-center space-x-2">
      <Pagination className="pt-4">
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              onClick={() =>
                currentPage > 1 && handlePageChange(currentPage - 1)
              }
              className={
                currentPage === 1
                  ? "pointer-events-none opacity-50"
                  : "cursor-pointer"
              }
            />
          </PaginationItem>

          {Array.from({ length: meta?.totalPages || 0 }, (_, i) => i + 1).map(
            (page) => (
              <PaginationItem key={page}>
                <PaginationLink
                  onClick={() => handlePageChange(page)}
                  isActive={currentPage === page}
                  className="cursor-pointer"
                >
                  {page}
                </PaginationLink>
              </PaginationItem>
            )
          )}

          <PaginationItem>
            <PaginationNext
              onClick={() =>
                currentPage < (meta?.totalPages || 0) &&
                currentPage < (meta?.totalPages || 0) &&
                handlePageChange(currentPage + 1)
              }
              isActive={currentPage < (meta?.totalPages || 0)}
              className={
                currentPage === (meta?.totalPages || 0) ||
                meta?.totalPages === 0
                  ? "pointer-events-none opacity-50"
                  : "cursor-pointer"
              }
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
}
