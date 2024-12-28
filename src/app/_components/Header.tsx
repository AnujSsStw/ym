"use client";

import { fetchTags } from "@/utils/tasty-api";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { createElement, HTMLAttributes, useEffect, useState } from "react";

export function Header() {
  const { data: session, status } = useSession();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [categories, setCategories] = useState<
    { name: string; displayName: string }[]
  >([]);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  const pathname = usePathname();

  useEffect(() => {
    const controlHeaderVisibility = () => {
      if (window.scrollY > lastScrollY) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }
      setLastScrollY(window.scrollY);
    };

    window.addEventListener("scroll", controlHeaderVisibility);
    return () => {
      window.removeEventListener("scroll", controlHeaderVisibility);
    };
  }, [lastScrollY]);

  const toggleMenu = () => {
    setIsMenuOpen((prev) => !prev);
    document.body.style.overflow = isMenuOpen ? "auto" : "hidden";
  };

  const handleLinkClick = () => {
    setIsMenuOpen(false);
    document.body.style.overflow = "auto";
  };

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const tags = await fetchTags();
        const filteredCategories = tags.results
          .filter(
            (tag: { type: string }) =>
              tag.type === "cuisine" || tag.type === "dietary",
          )
          .map((tag: { name: string; display_name: string }) => ({
            name: tag.name,
            displayName: tag.display_name,
          }));
        setCategories(filteredCategories);
      } catch (error) {
        console.error("Failed to fetch categories:", error);
      }
    };
    loadCategories();
  }, []);

  return (
    <div>
      {/* {pathname === "/" && (
        <div
          className={`fixed top-0 left-0 right-0 transition-transform duration-300 bg-gradient-to-r from-cyan-500 to-blue-500 shadow-md z-50 ${
            isVisible ? "translate-y-0" : "-translate-y-full"
          }`}
        >
          <div className="overflow-hidden whitespace-nowrap">
            <div className="inline-block animate-scroll">
              <Heading
                as="h6"
                className="text-white text-xs md:text-sm font-bold py-2 px-4"
              >
                Easy recipes. Delicious results.
              </Heading>
            </div>
          </div>
        </div>
      )} */}
      <header
        className={`text-dark z-50 bg-white px-6 py-4 shadow-md`}
        // ${
        // pathname === "/" ? "mt-10" : ""}
      >
        <div className="flex items-center justify-between">
          <div className="absolute left-1/2 -translate-x-1/2 transform">
            <Link href="/">
              <img
                src="/logo.svg"
                alt="Recipe Hub Logo"
                className="h-auto w-64 lg:w-64"
              />
            </Link>
          </div>

          <div className="lg:hidden">
            <button
              onClick={toggleMenu}
              className="hover:text-primary p-2 text-gray-700 focus:outline-none"
              aria-label={isMenuOpen ? "Close menu" : "Open menu"}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4 6h16M4 12h16m-7 6h7"
                />
              </svg>
            </button>
          </div>

          <div className="ml-auto hidden items-center space-x-6 lg:flex">
            {status === "authenticated" && (
              <Link
                href="/my-recipes"
                className="border-primary text-primary hover:bg-primary flex items-center rounded-lg border px-4 py-2 font-semibold transition duration-200 hover:text-white"
              >
                My Recipes
              </Link>
            )}
            {status === "authenticated" ? (
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="border-secondary text-secondary hover:bg-secondary flex items-center rounded-lg border px-4 py-2 font-semibold transition duration-200 hover:text-white"
              >
                Log Out
              </button>
            ) : (
              <Link
                href="/login"
                className="border-secondary text-secondary hover:bg-secondary flex items-center rounded-lg border px-4 py-2 font-semibold transition duration-200 hover:text-white"
              >
                Login
              </Link>
            )}
          </div>
        </div>

        <div
          className={`fixed left-0 top-0 z-50 h-full w-64 transform bg-white shadow-lg transition-transform duration-300 ease-in-out ${
            isMenuOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="flex items-center justify-between border-b p-4">
            <h3 className="text-lg font-bold">Menu</h3>
            <button
              onClick={toggleMenu}
              className="p-2 text-gray-700 hover:text-red-500 focus:outline-none"
              aria-label="Close menu"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <div className="space-y-4 border-b p-4">
            {status === "authenticated" && (
              <Link
                href="/my-recipes"
                onClick={handleLinkClick}
                className="bg-primary hover:bg-primary-dark block rounded-lg px-4 py-2 text-center font-semibold text-white transition"
              >
                My Recipes
              </Link>
            )}
            {status === "authenticated" ? (
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="bg-secondary hover:bg-secondary-dark block w-full rounded-lg px-4 py-2 text-center font-semibold text-white transition"
              >
                Log Out
              </button>
            ) : (
              <Link
                href="/login"
                onClick={handleLinkClick}
                className="bg-secondary hover:bg-secondary-dark block w-full rounded-lg px-4 py-2 text-center font-semibold text-white transition"
              >
                Login
              </Link>
            )}
          </div>

          <div className="space-y-4 p-4">
            <h3 className="mb-2 text-lg font-bold">Categories</h3>
            <ul className="space-y-2">
              {categories.map((category) => (
                <li key={category.name}>
                  <Link
                    href={`/categories/${category.name}`}
                    onClick={handleLinkClick}
                    className="hover:text-primary block text-gray-700 transition"
                  >
                    {category.displayName}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </header>
    </div>
  );
}

interface HeadingProps extends HTMLAttributes<HTMLHeadingElement> {
  as?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
}

function Heading({ as = "h2", children, className, ...props }: HeadingProps) {
  return createElement(
    as,
    {
      className: `text-2xl font-semibold tracking-tight ${className}`,
      ...props,
    },
    children,
  );
}
