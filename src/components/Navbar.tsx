import { signIn, useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useState } from "react";
import { VscSearch } from "react-icons/vsc";
import Button from "./Button";
import { ProfileImage } from "./ProfileImage";

export const SearchBar = () => {
  const [searchedText, setSearchedText] = useState("");

  const router = useRouter();

  const handleKeyDown = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      await router.push(`/community/${searchedText}`);
    }
  };

  return (
    <div className="">
      <div className="relative flex items-center justify-end">
        <input
          id="searchField"
          value={searchedText}
          onChange={(e) => setSearchedText(e.target.value)}
          placeholder="Search communities"
          list="searchOptions"
          onKeyDown={(e) => void handleKeyDown(e)}
          className="w-full rounded-lg border border-gray-400 p-2 pl-7 sm:w-96"
        />
        <span
          onClick={() => void router.push(`/community/${searchedText}`)}
          className="absolute left-2 mr-2 w-10"
        >
          <VscSearch />
        </span>
      </div>
    </div>
  );
};

export function Navbar() {
  const session = useSession();
  const user = session.data?.user;
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <>
      <nav className="relative flex flex-wrap items-center justify-between border-b-2 border-gray-300 bg-gradient-to-b from-[#2e026d] to-[#15162c] px-2 py-3 text-white">
        <div className="container mx-auto flex flex-wrap items-center justify-between gap-2 px-4 sm:flex-row md:gap-0">
          <div className="relative flex w-full justify-between lg:static lg:block lg:w-auto lg:justify-start ">
            <div className="flex items-start">
              <Link href="/">
                <div className="flex">
                  <span className="mr-2 text-2xl font-bold text-white">
                    Code Collab
                  </span>
                </div>
              </Link>
            </div>
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              data-collapse-toggle="navbar-default"
              type="button"
              className="inline-flex h-10 w-10 items-center justify-center rounded-lg p-2 text-sm text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 md:hidden dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600"
              aria-controls="navbar-default"
              aria-expanded="false"
            >
              <span className="sr-only">Open main menu</span>
              <svg
                className="h-5 w-5"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 17 14"
              >
                <path
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M1 1h15M1 7h15M1 13h15"
                />
              </svg>
            </button>
          </div>
          <div
            className={`${isMenuOpen ? "flex" : "hidden"} w-full flex-1 flex-col gap-2 md:flex  md:w-auto md:flex-row md:gap-0`}
            id="navbar-default"
          >
            <div className="flex flex-1 md:justify-center"></div>
            <div className="items-center  lg:flex" id="example-navbar-danger">
              <ul className="flex list-none flex-col lg:ml-auto lg:flex-row">
                {user !== undefined ? (
                  <li className="nav-item">
                    <div className="flex items-center  gap-5">
                      <Link href="/profile">
                        <ProfileImage size="big" src={user.image} />
                      </Link>
                      <div className="hover:underline">
                        <Link href="/profile">{user.name}</Link>
                      </div>
                    </div>
                  </li>
                ) : (
                  <li className="nav-item">
                    <Button color="black" onClick={() => void signIn()}>
                      <span className="hidden text-lg md:inline">Log in</span>
                    </Button>
                  </li>
                )}
              </ul>
            </div>
          </div>
        </div>
      </nav>
    </>
  );
}
