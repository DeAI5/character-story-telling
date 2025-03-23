"use client";

import { useState } from "react";
import { useChat } from "@ai-sdk/react";


export default function Chat() {
  const { messages, append, isLoading } = useChat();
  const genres = [
    { emoji: "🧙", value: "Fantasy" },
    { emoji: "🕵️", value: "Mystery" },
    { emoji: "💑", value: "Romance" },
    { emoji: "🚀", value: "Sci-Fi" },
  ];
  const tones = [
    { emoji: "😊", value: "Happy" },
    { emoji: "😢", value: "Sad" },
    { emoji: "😏", value: "Sarcastic" },
    { emoji: "😂", value: "Funny" },
  ];

  const [state, setState] = useState({
    genre: "",
    tone: "",
    character: "", 
  });

  const [characters, setCharacters] = useState<{ name: string; description: string }[]>([]);
  const [newCharacter, setNewCharacter] = useState("");
  const [newDescription, setNewDescription] = useState("");
  
  const handleChange = ({
    target: { name, value },
  }: React.ChangeEvent<HTMLInputElement>) => {
    setState({
      ...state,
      [name]: value,
    });
  };

  const handleCharacterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewCharacter(e.target.value);
  };

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewDescription(e.target.value);
  };

  const addCharacter = () => {
    if (newCharacter && newDescription) {
      setCharacters([...characters, { name: newCharacter, description: newDescription }]);
      setNewCharacter("");
      setNewDescription("");
    }
  };

  const updateCharacter = (index: number, field: "name" | "description", value: string) => {
    const updatedCharacters = [...characters];
    updatedCharacters[index][field] = value;
    setCharacters(updatedCharacters);
  };

  const deleteCharacter = (index: number) => {
    setCharacters(characters.filter((_, i) => i !== index));
  };

  


  return (
    <main className="mx-auto w-full p-24 flex flex-col">
      <div className="p4 m-4">
        <div className="flex flex-col items-center justify-center space-y-8 text-white">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold">Story Telling App</h2>
            <p className="text-zinc-500 dark:text-zinc-400">
              Customize the story by selecting the genre and tone.
            </p>
          </div>

          <div className="space-y-4 bg-opacity-25 bg-gray-700 rounded-lg p-4">
            <h3 className="text-xl font-semibold">Genre</h3>

            <div className="flex flex-wrap justify-center">
              {genres.map(({ value, emoji }) => (
                <div
                  key={value}
                  className="p-4 m-2 bg-opacity-25 bg-gray-600 rounded-lg"
                >
                  <input
                    id={value}
                    type="radio"
                    value={value}
                    name="genre"
                    onChange={handleChange}
                  />
                  <label className="ml-2" htmlFor={value}>
                    {`${emoji} ${value}`}
                  </label>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4 bg-opacity-25 bg-gray-700 rounded-lg p-4">
            <h3 className="text-xl font-semibold">Tones</h3>

            <div className="flex flex-wrap justify-center">
              {tones.map(({ value, emoji }) => (
                <div
                  key={value}
                  className="p-4 m-2 bg-opacity-25 bg-gray-600 rounded-lg"
                >
                  <input
                    id={value}
                    type="radio"
                    name="tone"
                    value={value}
                    onChange={handleChange}
                  />
                  <label className="ml-2" htmlFor={value}>
                    {`${emoji} ${value}`}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Adding a character */}
          <div className="space-y-4 bg-opacity-25 bg-gray-700 rounded-lg p-4">
            <h3 className="text-xl font-semibold">Character</h3>
            <div className="flex flex-col space-y-2">
              <input
                type="text"
                name="character"
                placeholder="Enter a character name"
                value={newCharacter}
                onChange={handleCharacterChange}
                className="p-2 rounded bg-gray-800 text-white"
              />
              <input
                type="text"
                name="description"
                placeholder="Enter a character description"
                value={newDescription}
                onChange={handleDescriptionChange}
                className="p-2 rounded bg-gray-800 text-white"
              />
              <button onClick={addCharacter} className="bg-green-500 px-4 py-2 rounded text-white">Add Character</button>
            </div>

            <ul>
              {characters.map((char, index) => (
                <li key={index} className="flex flex-col bg-gray-800 p-2 rounded mt-2">
                  <input
                    type="text"
                    value={char.name}
                    onChange={(e) => updateCharacter(index, "name", e.target.value)}
                    className="p-1 rounded bg-gray-700 text-white w-full mr-2"
                  />
                  <input
                    type="text"
                    value={char.description}
                    onChange={(e) => updateCharacter(index, "description", e.target.value)}
                    className="p-1 rounded bg-gray-700 text-white w-full mr-2"
                  />
                  <button onClick={() => deleteCharacter(index)} className="bg-red-500 px-2 py-1 rounded text-white mt-2">Delete</button>
                </li>
              ))}
            </ul>
          </div>

          {/* Adding a character */}

          <button
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
            disabled={isLoading || !state.genre || !state.tone || characters.length === 0}
            onClick={() => append({ role: "user", content: `Generate a ${state.genre} story in a ${state.tone} tone featuring ${characters.map(c => `${c.name} (${c.description})`).join(", ")}` })}
          >
            Generate Story
          </button>

          <div hidden={messages.length === 0 || messages[messages.length - 1]?.content.startsWith("Generate")} className="bg-opacity-25 bg-gray-700 rounded-lg p-4">
            {messages[messages.length - 1]?.content}
          </div>
        </div>
      </div>
    </main>
  );
}