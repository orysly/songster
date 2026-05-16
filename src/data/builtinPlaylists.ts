export type Era = "1960s" | "1970s" | "1980s" | "1990s" | "2000s" | "2010s";
export type Genre = "Pop" | "Rock" | "Hip Hop" | "Jazz" | "Hungarian";

export type BuiltInPlaylist = {
  id: string;
  name: string;
  eras: Era[];
  genres: Genre[];
};

export const builtinPlaylists: BuiltInPlaylist[] = [
  {
    id: "37i9dQZF1DXaKIA8E7Wako",
    name: "All Out 60s",
    eras: ["1960s"],
    genres: ["Pop", "Rock"]
  },
  {
    id: "37i9dQZF1DWTJ7xPn4vNaz",
    name: "All Out 70s",
    eras: ["1970s"],
    genres: ["Pop", "Rock"]
  },
  {
    id: "37i9dQZF1DX4UtSsVN1yRI",
    name: "All Out 80s",
    eras: ["1980s"],
    genres: ["Pop", "Rock"]
  },
  {
    id: "37i9dQZF1DXbTxeAdrVG2l",
    name: "All Out 90s",
    eras: ["1990s"],
    genres: ["Pop", "Rock", "Hip Hop"]
  },
  {
    id: "37i9dQZF1DX4o1oenSJRJd",
    name: "All Out 00s",
    eras: ["2000s"],
    genres: ["Pop", "Rock", "Hip Hop"]
  },
  {
    id: "37i9dQZF1DX5Ejj0EkURtP",
    name: "All Out 10s",
    eras: ["2010s"],
    genres: ["Pop", "Hip Hop"]
  },
  {
    id: "37i9dQZF1DWXRqgorJj26U",
    name: "Rock Classics",
    eras: ["1970s", "1980s", "1990s", "2000s"],
    genres: ["Rock"]
  },
  {
    id: "37i9dQZF1DXbITWG1ZIGZm",
    name: "Jazz Classics",
    eras: ["1960s", "1970s"],
    genres: ["Jazz"]
  },
  {
    id: "37i9dQZF1DX186v583rmzp",
    name: "I Love My 90s Hip-Hop",
    eras: ["1990s"],
    genres: ["Hip Hop"]
  },
  {
    id: "0B2mGfB87h6n3D5kQnE4s5", // Retro Magyar (community playlist)
    name: "Magyar Retro",
    eras: ["1970s", "1980s", "1990s", "2000s"],
    genres: ["Hungarian", "Pop", "Rock"]
  },
  {
    id: "37i9dQZF1DWZq91oLsHZvy", // Official Top Magyar
    name: "Magyar Slágerek",
    eras: ["2000s", "2010s"],
    genres: ["Hungarian", "Pop"]
  }
];

export const ALL_ERAS: Era[] = ["1960s", "1970s", "1980s", "1990s", "2000s", "2010s"];
export const ALL_GENRES: Genre[] = ["Pop", "Rock", "Hip Hop", "Jazz", "Hungarian"];
