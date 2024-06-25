"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const bi_1 = require("react-icons/bi");
const ErrorComponent = ({ error }) => {
    return (<div className="flex items-center gap-2 rounded
        border border-red-400 bg-red-100 px-4 py-3 text-red-700" role="alert">
      <bi_1.BiErrorCircle className="bg-red"/>
      <span className="block flex-1 sm:inline">{error}</span>
    </div>);
};
exports.default = ErrorComponent;
