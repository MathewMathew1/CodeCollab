"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = require("react");
const options = ["useState", "useEffect", "console.log", "Math.random"];
const useAutoComplete = (trigger) => {
    const [suggestions, setSuggestions] = (0, react_1.useState)([]);
    const [activeSuggestion, setActiveSuggestion] = (0, react_1.useState)(0);
    (0, react_1.useEffect)(() => {
        if (trigger) {
            const matchingSuggestions = options.filter((option) => option.startsWith(trigger));
            console.log("matchingSuggestions");
            setSuggestions(matchingSuggestions);
            setActiveSuggestion(0);
        }
        else {
            setSuggestions([]);
        }
    }, [trigger, options]);
    const handleKeyDown = (e) => {
        if (suggestions.length > 0) {
            if (e.key === 'ArrowUp') {
                e.preventDefault();
                setActiveSuggestion(prev => (prev - 1 + suggestions.length) % suggestions.length);
            }
            else if (e.key === 'ArrowDown') {
                e.preventDefault();
                setActiveSuggestion(prev => (prev + 1) % suggestions.length);
            }
            else if (e.key === 'Enter') {
                e.preventDefault();
                const selectedSuggestion = suggestions[activeSuggestion];
                setSuggestions([]);
                return selectedSuggestion;
            }
        }
        return null;
    };
    return { suggestions, activeSuggestion, handleKeyDown };
};
exports.default = useAutoComplete;
