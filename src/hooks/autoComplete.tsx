import React, { useState, useEffect } from 'react';

const options = ["useState", "useEffect", "console.log", "Math.random"];

const useAutoComplete = (trigger: string) => {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [activeSuggestion, setActiveSuggestion] = useState(0);

  useEffect(() => {
    if (trigger) {
      const matchingSuggestions = options.filter((option: string) => option.startsWith(trigger));
      console.log("matchingSuggestions")
      setSuggestions(matchingSuggestions);
      setActiveSuggestion(0);
    } else {
      setSuggestions([]);
    }
  }, [trigger, options]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>| React.KeyboardEvent<HTMLDivElement>) => {
    if (suggestions.length > 0) {
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActiveSuggestion(prev => (prev - 1 + suggestions.length) % suggestions.length);
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActiveSuggestion(prev => (prev + 1) % suggestions.length);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        const selectedSuggestion = suggestions[activeSuggestion];
        setSuggestions([]);
        return selectedSuggestion;
      }
    }
    return null;
  }

  return { suggestions, activeSuggestion, handleKeyDown };
}

export default useAutoComplete;