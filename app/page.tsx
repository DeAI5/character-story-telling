"use client";

import { useState } from "react";

interface Character {
  id: string;
  name: string;
  description: string;
  personality: string;
}

interface CharacterSummary {
  name: string;
  role: string;
}

export default function Chat() {
  const [story, setStory] = useState("");
  const [characterSummaries, setCharacterSummaries] = useState<CharacterSummary[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [characters, setCharacters] = useState<Character[]>([]);
  const [newCharacter, setNewCharacter] = useState<Character>({
    id: "",
    name: "",
    description: "",
    personality: "",
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  
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
  });

  const handleChange = ({
    target: { name, value },
  }: React.ChangeEvent<HTMLInputElement>) => {
    setState({
      ...state,
      [name]: value,
    });
  };

  const handleCharacterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      // Edit existing character
      setCharacters(characters.map(char => 
        char.id === editingId ? { ...newCharacter, id: editingId } : char
      ));
      setEditingId(null);
    } else {
      // Add new character
      setCharacters([...characters, { ...newCharacter, id: Date.now().toString() }]);
    }
    // Reset form
    setNewCharacter({ id: "", name: "", description: "", personality: "" });
  };

  const handleCharacterEdit = (character: Character) => {
    setNewCharacter(character);
    setEditingId(character.id);
  };

  const handleCharacterDelete = (id: string) => {
    setCharacters(characters.filter(char => char.id !== id));
  };

  const generateStory = async () => {
    setIsLoading(true);
    setStory("");
    setCharacterSummaries([]);
    
    try {
      // First generate the story
      const storyResponse = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [{
            role: "user",
            content: `Generate a ${state.genre} story in a ${state.tone} tone with the following characters:
              ${characters.map(char => `
                Character: ${char.name}
                Description: ${char.description}
                Personality: ${char.personality}
              `).join('\n')}`,
          }]
        }),
      });

      if (!storyResponse.ok) {
        throw new Error('Failed to generate story');
      }

      const storyData = await storyResponse.json();
      const generatedStory = storyData.choices[0].message.content;
      setStory(generatedStory);

      // Then generate character summaries
      if (characters.length > 0) {
        const summaryResponse = await fetch('/api/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            messages: [{
              role: "user",
              content: `Based on this story: "${generatedStory}"

Respond with ONLY a JSON array. No other text before or after. Format:
[
  {"name": "character name", "role": "brief role summary"}
]

Include these characters: ${characters.map(char => char.name).join(', ')}

Remember: Return ONLY the JSON array with no additional text.`,
            }]
          }),
        });

        if (summaryResponse.ok) {
          const summaryData = await summaryResponse.json();
          try {
            const summaryContent = summaryData.choices[0].message.content;
            console.log('Summary content:', summaryContent);
            
            // Find JSON array pattern starting with [ and ending with ]
            const jsonMatch = summaryContent.match(/\[\s*{[\s\S]*}\s*\]/);
            if (jsonMatch) {
              const cleanedContent = jsonMatch[0]
                .replace(/,\s*]/g, ']') // Remove trailing commas before closing bracket
                .replace(/[\n\r]/g, '') // Remove newlines
                .trim();
              
              try {
                const summaries = JSON.parse(cleanedContent);
                if (Array.isArray(summaries)) {
                  setCharacterSummaries(summaries);
                } else {
                  console.error('Parsed data is not an array:', summaries);
                }
              } catch (parseError) {
                console.error('JSON parse error:', parseError, 'Content:', cleanedContent);
              }
            } else {
              console.error('No JSON array found in:', summaryContent);
            }
          } catch (e) {
            console.error('Error processing character summaries:', e);
          }
        }
      }
    } catch (error) {
      console.error('Error:', error);
      setStory("Failed to generate story. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="mx-auto w-full p-24 flex flex-col">
      <div className="p4 m-4">
        <div className="flex flex-col items-center justify-center space-y-8 text-white">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold">Story Telling App</h2>
            <p className="text-zinc-500 dark:text-zinc-400">
              Create your characters and customize the story.
            </p>
          </div>

          {/* Characters Section */}
          <div className="space-y-4 bg-opacity-25 bg-gray-700 rounded-lg p-4 w-full">
            <h3 className="text-xl font-semibold">Characters</h3>
            
            <form onSubmit={handleCharacterSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <input
                  type="text"
                  placeholder="Character Name"
                  value={newCharacter.name}
                  onChange={(e) => setNewCharacter({...newCharacter, name: e.target.value})}
                  className="p-2 rounded bg-gray-600"
                  required
                />
                <input
                  type="text"
                  placeholder="Description"
                  value={newCharacter.description}
                  onChange={(e) => setNewCharacter({...newCharacter, description: e.target.value})}
                  className="p-2 rounded bg-gray-600"
                  required
                />
                <input
                  type="text"
                  placeholder="Personality"
                  value={newCharacter.personality}
                  onChange={(e) => setNewCharacter({...newCharacter, personality: e.target.value})}
                  className="p-2 rounded bg-gray-600"
                  required
                />
              </div>
              <button
                type="submit"
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              >
                {editingId ? 'Update Character' : 'Add Character'}
              </button>
            </form>

            {/* Characters Table */}
            {characters.length > 0 && (
              <div className="mt-4 overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="border-b border-gray-600">
                      <th className="px-4 py-2 text-left">Name</th>
                      <th className="px-4 py-2 text-left">Description</th>
                      <th className="px-4 py-2 text-left">Personality</th>
                      <th className="px-4 py-2 text-left">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {characters.map((char) => (
                      <tr key={char.id} className="border-b border-gray-600">
                        <td className="px-4 py-2">{char.name}</td>
                        <td className="px-4 py-2">{char.description}</td>
                        <td className="px-4 py-2">{char.personality}</td>
                        <td className="px-4 py-2">
                          <button
                            onClick={() => handleCharacterEdit(char)}
                            className="mr-2 text-blue-500 hover:text-blue-700"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleCharacterDelete(char.id)}
                            className="text-red-500 hover:text-red-700"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
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

          <button
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
            disabled={isLoading || !state.genre || !state.tone}
            onClick={generateStory}
          >
            Generate Story
          </button>

          <div className="bg-opacity-25 bg-gray-700 rounded-lg p-4 mt-4 w-full">
            <div className="mb-4">
              <h3 className="text-xl font-semibold mb-4">
                {isLoading ? "Generating Story..." : "Story"}
              </h3>
              <p className="whitespace-pre-wrap">
                {isLoading 
                  ? "Please wait..." 
                  : story || "Your story will appear here..."}
              </p>
            </div>

            {/* Character Summaries */}
            {characterSummaries.length > 0 && (
              <div className="mt-6 border-t border-gray-600 pt-4">
                <h3 className="text-xl font-semibold mb-4">Character Roles in Story</h3>
                <div className="grid gap-4">
                  {characterSummaries.map((summary, index) => (
                    <div 
                      key={index}
                      className="bg-gray-600 bg-opacity-25 p-4 rounded-lg"
                    >
                      <h4 className="font-bold text-blue-400">{summary.name}</h4>
                      <p>{summary.role}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}