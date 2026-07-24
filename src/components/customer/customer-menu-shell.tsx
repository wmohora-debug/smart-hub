"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";
import { CategoryEntity, MenuItemEntity, RestaurantEntity } from "@/types";
import { useDebounce } from "@/hooks/use-debounce";
import { useTable } from "@/context/table-context";
import {
  RestaurantHeader,
  HeroBanner,
  SearchSection,
  CategoryNavigation,
  MenuCategorySection,
  BottomBillBar,
  ScrollProgressBar,
  BackToTopButton,
} from "@/components/customer";
import { EmptyState } from "@/components/ui/empty-state";
import { Container } from "@/components/ui/layout";
import { Badge } from "@/components/ui/badge";
import { Icons } from "@/components/shared/icons";

export interface CustomerMenuShellProps {
  initialRestaurant?: RestaurantEntity | null;
  initialCategories: CategoryEntity[];
  initialDishes: MenuItemEntity[];
}

export function CustomerMenuShell({
  initialRestaurant,
  initialCategories,
  initialDishes,
}: CustomerMenuShellProps) {
  const searchParams = useSearchParams();
  const tableSlugParam = searchParams.get("table");
  const { isTableSelected, tableName, zone, setTableData, clearTable } = useTable();

  const [rawSearchQuery, setRawSearchQuery] = React.useState("");
  const debouncedSearchQuery = useDebounce(rawSearchQuery, 250);

  const [activeCategory, setActiveCategory] = React.useState("all");
  const [cartItems, setCartItems] = React.useState<Record<string, number>>({});
  const isUserClickScrolling = React.useRef(false);

  // Auto-detect and validate ?table=<slug> query parameter
  React.useEffect(() => {
    if (!tableSlugParam) return;

    const validateAndSetTable = async () => {
      try {
        const res = await fetch("/api/v1/tables");
        const data = await res.json();
        if (data.success && Array.isArray(data.data)) {
          const match = data.data.find(
            (t: { slug: string }) => t.slug.toLowerCase() === tableSlugParam.toLowerCase(),
          );
          if (match) {
            setTableData({
              id: match.id,
              slug: match.slug,
              name: match.name,
              zone: match.zone,
              capacity: match.capacity,
            });
          }
        }
      } catch {
        // Gracefully ignore table lookup errors
      }
    };

    validateAndSetTable();
  }, [tableSlugParam, setTableData]);

  // 1. Quantity Handlers
  const handleIncrement = React.useCallback((dishId: string) => {
    setCartItems((prev) => ({
      ...prev,
      [dishId]: (prev[dishId] || 0) + 1,
    }));
  }, []);

  const handleDecrement = React.useCallback((dishId: string) => {
    setCartItems((prev) => {
      const current = prev[dishId] || 0;
      if (current <= 1) {
        const { [dishId]: _, ...rest } = prev;
        return rest;
      }
      return {
        ...prev,
        [dishId]: current - 1,
      };
    });
  }, []);

  // 2. Filtered Dishes by Debounced Search Query
  const filteredDishes = React.useMemo(() => {
    if (!debouncedSearchQuery.trim()) return initialDishes;
    const query = debouncedSearchQuery.toLowerCase().trim();
    return initialDishes.filter(
      (dish) =>
        dish.name.toLowerCase().includes(query) ||
        dish.description.toLowerCase().includes(query) ||
        dish.categoryId.toLowerCase().includes(query),
    );
  }, [debouncedSearchQuery, initialDishes]);

  // 3. Category Count Helper
  const getCategoryItemCount = React.useCallback(
    (categoryId: string) => {
      if (categoryId === "all") return filteredDishes.length;
      return filteredDishes.filter(
        (d) => d.categoryId === categoryId,
      ).length;
    },
    [filteredDishes],
  );

  // 4. Categories to Display (All active categories maintained in DOM for smooth scrolling)
  const visibleCategories = React.useMemo(() => {
    if (debouncedSearchQuery.trim()) {
      return initialCategories.filter((c) => getCategoryItemCount(c.id) > 0);
    }
    return initialCategories;
  }, [debouncedSearchQuery, initialCategories, getCategoryItemCount]);

  // 5. Category Selection Handler with Smooth Scroll into View
  const handleSelectCategory = React.useCallback((categoryId: string) => {
    setActiveCategory(categoryId);
    isUserClickScrolling.current = true;

    if (categoryId === "all") {
      const searchElem = document.getElementById("search-section");
      if (searchElem) {
        searchElem.scrollIntoView({ behavior: "smooth" });
      } else {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    } else {
      const element = document.getElementById(categoryId);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    }

    setTimeout(() => {
      isUserClickScrolling.current = false;
    }, 800);
  }, []);

  // 6. Native IntersectionObserver to Auto-Update Active Category Chip while Scrolling
  React.useEffect(() => {
    if (debouncedSearchQuery.trim()) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (isUserClickScrolling.current) return;
        const visibleEntry = entries.find((entry) => entry.isIntersecting);
        if (visibleEntry) {
          setActiveCategory(visibleEntry.target.id);
        }
      },
      {
        rootMargin: "-20% 0px -60% 0px",
        threshold: 0.1,
      },
    );

    // Observe all category section targets
    initialCategories.forEach((category) => {
      const element = document.getElementById(category.id);
      if (element) observer.observe(element);
    });

    // Observe top search section to auto-highlight "all" when scrolled to top
    const searchSection = document.getElementById("search-section");
    const topObserver = new IntersectionObserver(
      (entries) => {
        if (isUserClickScrolling.current) return;
        if (entries[0]?.isIntersecting) {
          setActiveCategory("all");
        }
      },
      { rootMargin: "0px 0px -70% 0px" },
    );
    if (searchSection) topObserver.observe(searchSection);

    return () => {
      observer.disconnect();
      topObserver.disconnect();
    };
  }, [debouncedSearchQuery, initialCategories]);

  // 7. Dynamic Bill Calculations
  const { totalItems, totalPrice } = React.useMemo(() => {
    let items = 0;
    let price = 0;
    Object.entries(cartItems).forEach(([dishId, qty]) => {
      items += qty;
      const dish = initialDishes.find((d) => d.id === dishId);
      if (dish) {
        price += Number(dish.price) * qty;
      }
    });
    return { totalItems: items, totalPrice: price };
  }, [cartItems, initialDishes]);

  return (
    <main className="relative flex flex-col w-full min-h-screen">
      {/* Scroll Progress Bar */}
      <ScrollProgressBar />

      {/* Customer Dining Table Banner */}
      {isTableSelected && (
        <div className="bg-primary text-primary-foreground py-2 px-4 shadow-sm z-30 sticky top-0">
          <div className="mx-auto max-w-3xl flex items-center justify-between text-xs font-semibold">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-white" />
              </span>
              <span>
                Dining at <span className="font-bold underline">{tableName}</span> ({zone || "Main Dining"})
              </span>
            </div>

            <Badge
              variant="outline"
              onClick={clearTable}
              className="cursor-pointer border-primary-foreground/40 text-primary-foreground hover:bg-primary-foreground/20 text-[10px] py-0.5 px-2"
              title="Change or clear assigned dining table"
            >
              <Icons.copy className="h-3 w-3 mr-1" />
              Change Table
            </Badge>
          </div>
        </div>
      )}

      {/* Dynamic Restaurant Header */}
      <RestaurantHeader restaurant={initialRestaurant} />

      {/* Dynamic Hero Cover Banner */}
      <HeroBanner restaurant={initialRestaurant} />

      {/* Controlled Search Section with ID for top scroll targeting */}
      <div id="search-section">
        <SearchSection
          value={rawSearchQuery}
          onChange={(query) => setRawSearchQuery(query)}
        />
      </div>

      {/* Sticky Category Navigation */}
      <CategoryNavigation
        categories={initialCategories}
        activeCategory={activeCategory}
        onSelectCategory={handleSelectCategory}
        getCategoryItemCount={getCategoryItemCount}
      />

      {/* Main Menu Sections Container */}
      <Container className="max-w-3xl py-6 space-y-10">
        {filteredDishes.length === 0 ? (
          <div className="py-8">
            <EmptyState
              title={debouncedSearchQuery.trim() ? "No Dishes Found" : "No Menu Items Available"}
              description={
                debouncedSearchQuery.trim()
                  ? `We couldn't find any dishes matching "${debouncedSearchQuery}". Try searching for another ingredient or dish.`
                  : "This restaurant currently has no active categories or menu items configured in PostgreSQL."
              }
              variant="no-search"
              actionLabel={debouncedSearchQuery.trim() ? "Clear Search" : undefined}
              onAction={debouncedSearchQuery.trim() ? () => setRawSearchQuery("") : undefined}
            />
          </div>
        ) : (
          visibleCategories.map((category) => {
            const categoryDishes = filteredDishes.filter(
              (d) => d.categoryId === category.id,
            );

            return (
              <MenuCategorySection
                key={category.id}
                category={category}
                dishes={categoryDishes}
                cartItems={cartItems}
                searchQuery={debouncedSearchQuery}
                onIncrement={handleIncrement}
                onDecrement={handleDecrement}
              />
            );
          })
        )}
      </Container>

      {/* Floating Back To Top Button */}
      <BackToTopButton />

      {/* Dynamic Sticky Bottom Bill Bar */}
      <BottomBillBar itemCount={totalItems} estimatedTotal={totalPrice} />
    </main>
  );
}
