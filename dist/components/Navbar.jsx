"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Navbar = exports.SearchBar = void 0;
const react_1 = require("next-auth/react");
const link_1 = __importDefault(require("next/link"));
const router_1 = require("next/router");
const react_2 = require("react");
const vsc_1 = require("react-icons/vsc");
const Button_1 = __importDefault(require("./Button"));
const ProfileImage_1 = require("./ProfileImage");
const SearchBar = () => {
    const [searchedText, setSearchedText] = (0, react_2.useState)("");
    const router = (0, router_1.useRouter)();
    const handleKeyDown = async (e) => {
        if (e.key === "Enter") {
            await router.push(`/community/${searchedText}`);
        }
    };
    return (<div className="">
      <div className="relative flex items-center justify-end">
        <input id="searchField" value={searchedText} onChange={(e) => setSearchedText(e.target.value)} placeholder="Search communities" list="searchOptions" onKeyDown={(e) => void handleKeyDown(e)} className="w-full rounded-lg border border-gray-400 p-2 pl-7 sm:w-96"/>
        <span onClick={() => void router.push(`/community/${searchedText}`)} className="absolute left-2 mr-2 w-10">
          <vsc_1.VscSearch />
        </span>
      </div>
    </div>);
};
exports.SearchBar = SearchBar;
function Navbar() {
    var _a;
    const session = (0, react_1.useSession)();
    const user = (_a = session.data) === null || _a === void 0 ? void 0 : _a.user;
    const [isMenuOpen, setIsMenuOpen] = (0, react_2.useState)(false);
    return (<>
      <nav className="relative flex flex-wrap items-center justify-between border-b-2 border-gray-300 bg-gradient-to-b from-[#2e026d] to-[#15162c] px-2 py-3 text-white">
        <div className="container mx-auto flex flex-wrap items-center justify-between gap-2 px-4 sm:flex-row md:gap-0">
          <div className="relative flex w-full justify-between lg:static lg:block lg:w-auto lg:justify-start ">
            <div className="flex items-start">
              <link_1.default href="/">
                <div className="flex">
                  <span className="mr-2 text-2xl font-bold text-white">
                    Code Collab
                  </span>
                </div>
              </link_1.default>
            </div>
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} data-collapse-toggle="navbar-default" type="button" className="inline-flex h-10 w-10 items-center justify-center rounded-lg p-2 text-sm text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 md:hidden dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600" aria-controls="navbar-default" aria-expanded="false">
              <span className="sr-only">Open main menu</span>
              <svg className="h-5 w-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 17 14">
                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M1 1h15M1 7h15M1 13h15"/>
              </svg>
            </button>
          </div>
          <div className={`${isMenuOpen ? "flex" : "hidden"} w-full flex-1 flex-col gap-2 md:flex  md:w-auto md:flex-row md:gap-0`} id="navbar-default">
            <div className="flex flex-1 md:justify-center"></div>
            <div className="items-center  lg:flex" id="example-navbar-danger">
              <ul className="flex list-none flex-col lg:ml-auto lg:flex-row">
                {user !== undefined ? (<li className="nav-item">
                    <div className="flex items-center  gap-5">
                      <link_1.default href="/profile">
                        <ProfileImage_1.ProfileImage size="big" src={user.image}/>
                      </link_1.default>
                      <div className="hover:underline">
                        <link_1.default href="/profile">{user.name}</link_1.default>
                      </div>
                    </div>
                  </li>) : (<li className="nav-item">
                    <Button_1.default color="black" onClick={() => void (0, react_1.signIn)()}>
                      <span className="hidden text-lg md:inline">Log in</span>
                    </Button_1.default>
                  </li>)}
              </ul>
            </div>
          </div>
        </div>
      </nav>
    </>);
}
exports.Navbar = Navbar;
