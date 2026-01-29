import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaMapMarkerAlt,
  FaUserTie,
  FaClock,
  FaMoneyBill,
  FaFilter,
  FaSearch,
  FaTimes,
} from "react-icons/fa";
import { getJobs, getNearbyJobs } from "../services/jobApi";

/* ---------------- CONSTANTS ---------------- */

const SKILLS = [
  "Electrician",
  "Plumber",
  "Carpenter",
  "Painter",
  "Welder",
  "Mason",
  "Tile Worker",
  "AC Technician",
  "Mechanic",
  "Driver",
  "House Cleaning",
  "Security Guard",
  "Gardener",
  "Construction Helper",
  "Interior Worker",
  "Solar Technician",
  "CCTV Technician",
  "Event Planner",
  "Photographer",
  "Videographer",
  "Makeup Artist",
  "Decorator",
  "DJ",
];

const LOCATIONS = [
  // Kozhikode
  "Kozhikode",
  "Koyilandy",
  "Vadakara",
  "Feroke",
  "Ramanattukara",
  "Mavoor",
  "Kunnamangalam",
  "Balussery",
  "Thamarassery",
  "Mukkom",
  "Chelannur",
  "Atholi",
  "Elathur",
  "Payyoli",
  "Nadapuram",
  "Perambra",
  "Kodenchery",
  "Omassery",
  "Narikkuni",
  "Thiruvambady",
  "Kakkodi",
  "Vellimadukunnu",
  "Kottooli",
  "Pantheerankavu",
  "Koduvally",
  "Thiruvallur",
  "Kakkur",
  "Ulliyeri",
  "Kuttiady",
  "Changaroth",
  "Kayanna",
  "Meppayur",
  "Thikkodi",
  "Athiyodi",
  "Maniyur",
  "Vatakara Beach",
  "Edachery",
  "Purameri",
  "Kavilumpara",
  "Koorachundu",
  "Kattippara",
  "Thiruvambady Town",
  "Pullurampara",
  "Engapuzha",

  // Malappuram
  "Malappuram",
  "Manjeri",
  "Tirur",
  "Ponnani",
  "Perinthalmanna",
  "Nilambur",
  "Kottakkal",
  "Edappal",
  "Parappanangadi",
  "Tanur",
  "Valanchery",
  "Areekode",
  "Kondotty",
  "Vengara",
  "Pandikkad",
  "Wandoor",
  "Pulamanthole",
  "Melattur",
  "Anakkayam",
  "Karuvarakundu",
  "Kalpakanchery",
  "Thavanoor",
  "Kuttippuram",
  "Athavanad",
  "Thirunavaya",
  "Ponmala",
  "Pallikkal",
  "Kakkancheri",
  "Morayur",
  "Chelembra",
  "Pulikkal",
  "Pallikkal Bazar",
  "Ungrathur",
  "Oorakam",
  "Abdurahiman Nagar",
  "Moonniyur",
  "Thenhipalam",
  "Kizhisseri",
  "Chelari",
  "Perumanna",
  "Vettathur",
  "Kolathur",
  "Moorkanad",
  "Kurumbalangode",
  "Chokkad",
  "Kottappadi",
  "Karulai",
  "Mambad",
  "Edavanna",
  "Amarambalam",
  "Chaliyar",
  "Vazhikkadavu",
  "Pothukal",
  "Thiruvali",
  "Porur",
  "Urangattiri",
  "Vadakkangara",
  "Thazhekkode",
  "Elamkulam",
  "Pulpatta",
  "Areecode Town",
  "Karippur",
  "Kottur",
  "Nannambra",
  "Vallikkunnu",
  "Moonniyur Beach",
  "Tanalur",
  "Triprangode",

  // Ernakulam (more)
  "Kalady",
  "Nedumbassery",
  "Kizhakkambalam",
  "Vazhakulam",
  "Rayamangalam",
  "Ayyampuzha",
  "Alangad",
  "Chowwara",
  "Mookkannoor",
  "Kombanad",
  "Mulavukad",
  "Kadamakudy",
  "Varapuzha",
  "Puthencruz",

  // Thrissur (more)
  "Kodakara",
  "Koratty",
  "Varandarappilly",
  "Mathilakam",
  "Annamanada",
  "Chavakkad",
  "Pavaratty",
  "Edakkazhiyur",
  "Venkitangu",
  "Peringottukara",
  "Chelakkara",
  "Desamangalam",
  "Elavally",

  // Palakkad (more)
  "Cherplassery",
  "Thrithala",
  "Koppam",
  "Vilayur",
  "Lakkidi",
  "Kadampazhipuram",
  "Thachampara",
  "Ananganadi",
  "Karimba",
  "Nellaya",
  "Kanjirapuzha",
  "Kallekkad",
  "Pirayiri",

  // Kannur (more)
  "Mayyil",
  "Kalliasseri",
  "Cherukunnu",
  "Madayi",
  "Ezhome",
  "Kolachery",
  "Chapparapadava",
  "Panoor",
  "Keezhur",
  "Nadapuram Kannur",
  "Azhikode",
  "Dharmadom Beach",

  // Wayanad (more)
  "Panamaram Town",
  "Pozhuthana",
  "Muppainad",
  "Thariyode",
  "Kaniyambetta",
  "Vellamunda",
  "Thondarnadu",
  "Padinjarathara",
  "Nenmeni",

  // Kasaragod (more)
  "Manjeshwar",
  "Kumbla",
  "Mogral Puthur",
  "Bedadka",
  "Delampady",
  "Paivalike",
  "Trikaripur",
  "Cheruvathur Beach",

  // Pathanamthitta (more)
  "Pandalam",
  "Kodumon",
  "Enathu",
  "Elanthoor",
  "Vechoochira",
  "Mallappally",
  "Kozhencherry",
  "Perunad",

  // Alappuzha (more)
  "Ambalappuzha",
  "Mararikulam",
  "Kanjikuzhy",
  "Kalavoor",
  "Thanneermukkom",
  "Edathua",
  "Kainakary",
  "Pulinkunnu",
  "Punnapra",

  // Kottayam (more)
  "Kumarakom",
  "Kuravilangad",
  "Manarcad",
  "Ramapuram",
  "Uzhavoor",
  "Pampady",
  "Athirampuzha",
  "Kaduthuruthy",
  "Mulakulam",

  // Idukki (more)
  "Kumily",
  "Vandiperiyar",
  "Rajakkad",
  "Udumbanchola",
  "Thankamony",
  "Peermade",
  "Elappara",
  "Vellathooval",
  "Bison Valley",

  // Kollam
  "Kollam",
  "Paravur",
  "Karunagappally",
  "Punalur",
  "Kottarakkara",
  "Anchal",
  "Chathannoor",
  "Kundara",
  "Kilikollur",
  "Sasthamkotta",
  "Oachira",
  "Mayyanad",
  "Chadayamangalam",
  "Pathanapuram",
  "Thenmala",
  "Aryankavu",
  "Kulathupuzha",
  "Ezhukone",
  "Perinad",
  "Sakthikulangara",
  "Neendakara",
  "Munroe Island",
  "Kalluvathukkal",
  "Pooyappally",

  // Thiruvananthapuram (TVM)
  "Thiruvananthapuram",
  "Neyyattinkara",
  "Attingal",
  "Varkala",
  "Nedumangad",
  "Kazhakoottam",
  "Technopark",
  "Kovalam",
  "Vizhinjam",
  "Balaramapuram",
  "Kattakada",
  "Pothencode",
  "Vattiyoorkavu",
  "Peroorkada",
  "Poojappura",
  "Sreekaryam",
  "Ulloor",
  "Pettah",
  "Palayam",
  "Karamana",
  "Nemom",
  "Malayinkeezhu",
  "Vellanad",
  "Aryanad",
  "Kallambalam",
  "Chirayinkeezhu",
  "Anchuthengu",
  "Ponmudi",
  "Vakkom",
  "Kilimanoor",
];

const CATEGORIES = [
  "Construction",
  "Electrical",
  "Plumbing",
  "Carpentry",
  "Painting",
  "Repair & Maintenance",
  "House Cleaning",
  "Sales & Delivery",
  "Healthcare Support",
  "Cooking",
  "Gardening",
  "Other",
];

/* -------- SEARCH SYNONYMS -------- */
const SEARCH_SYNONYMS = {
  /* Cleaning */
  clean: ["clean", "cleaner", "cleaning", "house cleaning"],
  cleaner: ["clean", "cleaner", "cleaning", "house cleaning"],
  cleaning: ["clean", "cleaner", "cleaning", "house cleaning"],

  /* Electrician */
  electric: ["electric", "electrical", "electrician"],
  electrical: ["electric", "electrical", "electrician"],
  electrician: ["electric", "electrical", "electrician"],

  /* Plumbing */
  plumber: ["plumber", "plumbing", "pipe"],
  plumbing: ["plumber", "plumbing", "pipe"],
  pipe: ["plumber", "plumbing", "pipe"],

  /* Carpentry */
  carpenter: ["carpenter", "carpentry", "wood", "furniture"],
  carpentry: ["carpenter", "carpentry", "wood", "furniture"],
  wood: ["carpenter", "carpentry", "wood", "furniture"],

  /* Painting */
  paint: ["paint", "painter", "painting"],
  painter: ["paint", "painter", "painting"],
  painting: ["paint", "painter", "painting"],

  /* Mason / Construction */
  mason: ["mason", "masonry", "construction", "helper"],
  masonry: ["mason", "masonry", "construction"],
  construction: ["construction", "helper", "labor", "worksite"],
  helper: ["helper", "construction helper", "labor"],

  /* Welding */
  welder: ["welder", "welding"],
  welding: ["welder", "welding"],

  /* AC / Technician */
  ac: ["ac", "air conditioner", "ac technician"],
  technician: ["technician", "repair", "service"],
  repair: ["repair", "maintenance", "technician"],
  maintenance: ["maintenance", "repair", "technician"],

  /* Mechanic */
  mechanic: ["mechanic", "mechanical", "vehicle repair"],
  mechanical: ["mechanic", "mechanical", "vehicle repair"],

  /* Driving */
  drive: ["drive", "driver", "driving"],
  driver: ["drive", "driver", "driving"],
  driving: ["drive", "driver", "driving"],

  /* Security */
  security: ["security", "guard", "watchman"],
  guard: ["security", "guard", "watchman"],
  watchman: ["security", "guard", "watchman"],

  /* Gardening */
  garden: ["garden", "gardener", "gardening"],
  gardener: ["garden", "gardener", "gardening"],
  gardening: ["garden", "gardener", "gardening"],

  /* Cooking */
  cook: ["cook", "cooking", "chef"],
  cooking: ["cook", "cooking", "chef"],
  chef: ["cook", "cooking", "chef"],

  /* Event / Media */
  photo: ["photo", "photographer", "photography"],
  photographer: ["photo", "photographer", "photography"],
  video: ["video", "videographer", "videography"],
  videographer: ["video", "videographer", "videography"],
  dj: ["dj", "music", "disc jockey"],
  decorator: ["decorator", "decoration", "event decor"],
  makeup: ["makeup", "makeup artist"],
  artist: ["artist", "makeup artist"],

  /* CCTV / Solar */
  cctv: ["cctv", "camera", "security camera"],
  solar: ["solar", "solar technician", "panel"],

  /* Generic fallback */
  worker: ["worker", "labour", "labor"],
  labour: ["labour", "labor", "worker"],
};

const LIMIT = 10;

const timeAgo = (date) => {
  const diff = Math.floor((Date.now() - new Date(date)) / 1000);
  if (diff < 60) return "Just now";
  if (diff < 3600) return `${Math.floor(diff / 60)} mins ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} hrs ago`;
  return `${Math.floor(diff / 86400)} days ago`;
};

/* Normalize text for smart matching */
const normalize = (str = "") =>
  str
    .toLowerCase()
    .replace(/[^a-z\s]/g, "")
    .trim();

const expandSearchTerms = (query = "") => {
  const q = normalize(query);

  return SEARCH_SYNONYMS[q] || [q];
};

/* ---------------- COMPONENT ---------------- */

export default function FindWorkers() {
  const navigate = useNavigate();

  /* -------- DATA -------- */
  const [allJobs, setAllJobs] = useState([]);
  const [nearbyJobs, setNearbyJobs] = useState([]);

  /* -------- PAGINATION -------- */
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  /* -------- SEARCH -------- */
  const [searchSkill, setSearchSkill] = useState("");
  const [searchLocation, setSearchLocation] = useState("");
  const [submittedSearch, setSubmittedSearch] = useState({
    skill: "",
    location: "",
  });
  const [location, setLocation] = useState(null);
  const [locationStatus, setLocationStatus] = useState("idle");

  const [showSkillSuggest, setShowSkillSuggest] = useState(false);
  const [showLocationSuggest, setShowLocationSuggest] = useState(false);
  const [searching, setSearching] = useState(false);

  /* -------- FILTER -------- */
  const [filterMode, setFilterMode] = useState("latest");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [showFilter, setShowFilter] = useState(false);
  const [categoryOpen, setCategoryOpen] = useState(false);

  const isSearching =
  submittedSearch.skill ||
  submittedSearch.location ||
  filterMode !== "latest" ||
  selectedCategory;



  /* -------- FETCH ALL -------- */
  const fetchAllJobs = async (pageNumber = 1) => {
    const res = await getJobs({ page: pageNumber, limit: LIMIT });
    setAllJobs(res.data.jobs || []);
    setPage(res.data.currentPage);
    setTotalPages(res.data.totalPages);
  };

  /* -------- FETCH NEARBY -------- */
  const fetchNearestJobs = ({ force = false } = {}) => {
    if (location && !force) return;


    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        setLocationStatus("denied");
        reject();
        return;
      }

      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const coords = {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          };

          setLocation(coords);
          setLocationStatus("allowed");

          try {
            const res = await getNearbyJobs({
              lat: coords.lat,
              lng: coords.lng,
              radius: 10,
            });
            setNearbyJobs(res.data.jobs || []);
            resolve(coords);
          } catch {
            setNearbyJobs([]);
            reject();
          }
        },
        (err) => {
          // user denied / dismissed
          setLocationStatus("denied");

          // IMPORTANT:
          // only clear nearbyJobs on force request
          if (force) setNearbyJobs([]);

          reject(err);
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    });
  };

useEffect(() => {
  if (isSearching) {
   
    getJobs({ page: 1, limit: 1000 }).then((res) => {
      setAllJobs(res.data.jobs || []);
      setTotalPages(1);
    });
  } else {
    fetchAllJobs(page);
  }
}, [page, isSearching]);


  useEffect(() => {
    fetchNearestJobs().catch(() => {
      // Handle error silently
    });
  }, []);

  /* -------- SEARCH ACTION -------- */
  const handleSearch = () => {
    setSearching(true);

    setSubmittedSearch({
      skill: searchSkill,
      location: searchLocation,
    });

    setPage(1);

    setTimeout(() => setSearching(false), 300);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSearch();
  };

  const clearFilters = () => {
    setSearchSkill("");
    setSearchLocation("");
    setSubmittedSearch({ skill: "", location: "" });
    setFilterMode("latest");
    setSelectedCategory("");
    setPage(1);
  };

  /* -------- FILTER LOGIC -------- */
  const finalJobs = useMemo(() => {
    let base =
  nearbyJobs.length > 0
    ? [
        ...nearbyJobs,
        ...allJobs.filter(
          (j) =>
            !j.isBlocked &&
            !nearbyJobs.some((n) => n._id === j._id)
        ),
      ]
    : allJobs.filter((j) => !j.isBlocked);


    if (filterMode === "near") base = nearbyJobs;
    if (filterMode === "under500")
      base = base.filter((j) => Number(j.wage) <= 500);
    if (filterMode === "under1000")
      base = base.filter((j) => Number(j.wage) <= 1000);
    if (filterMode === "category" && selectedCategory)
      base = base.filter((j) => j.category === selectedCategory);

    if (submittedSearch.skill) {
      const terms = expandSearchTerms(submittedSearch.skill);

      base = base.filter((j) => {
        const title = normalize(j.title);
        const skills = j.skills?.map((s) => normalize(s)) || [];

        return terms.some(
          (term) => title.includes(term) || skills.some((s) => s.includes(term))
        );
      });
    }

    if (submittedSearch.location) {
      const q = normalize(submittedSearch.location);
      base = base.filter((j) => normalize(j.location).includes(q));
    }

    return base;
  }, [allJobs, nearbyJobs, filterMode, selectedCategory, submittedSearch]);

  const filteredSkills = SKILLS.filter((s) =>
    s.toLowerCase().includes(searchSkill.toLowerCase())
  );

  const filteredLocations = LOCATIONS.filter((loc) =>
    normalize(loc).includes(normalize(searchLocation))
  );

  /* ---------------- UI ---------------- */

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* HEADER */}
        <div className="flex justify-between items-center mb-5">
          <div>
            <h1 className="text-lg font-semibold">Find Workers Near You</h1>
            {nearbyJobs.length > 0 && (
              <p className="text-sm text-green-600">Jobs found near you</p>
            )}
            {locationStatus === "denied" && (
              <p className="text-xs text-orange-500 mt-1">
                Location access needed for nearby jobs
              </p>
            )}
          </div>

          <button
            onClick={() => setShowFilter((p) => !p)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm ${
              showFilter ? "bg-blue-600 text-white" : "bg-white"
            }`}
          >
            <FaFilter /> Filters
          </button>
        </div>

        {/* SEARCH */}
        <div className="grid gap-3 md:grid-cols-3 mb-4">
          {/* Skill */}
          <div className="relative">
            <div className="relative">
              <input
                value={searchSkill}
                onChange={(e) => {
                  setSearchSkill(e.target.value);
                  setShowSkillSuggest(true);
                }}
                onBlur={() =>
                  setTimeout(() => setShowLocationSuggest(false), 150)
                }
                onKeyDown={handleKeyDown}
                placeholder="Skill or job"
                className="w-full border rounded-xl px-4 py-3 text-sm pr-8"
              />
              {searchSkill && (
                <FaTimes
                  onClick={() => setSearchSkill("")}
                  className="absolute right-3 top-3 text-gray-400 cursor-pointer"
                />
              )}
            </div>

            {showSkillSuggest && filteredSkills.length > 0 && searchSkill && (
              <div className="absolute z-10 w-full bg-white border rounded-xl mt-1">
                {filteredSkills.slice(0, 6).map((skill) => (
                  <div
                    key={skill}
                    onClick={() => {
                      setSearchSkill(skill);
                      setShowSkillSuggest(false);
                    }}
                    className="px-4 py-2 text-sm hover:bg-gray-100 cursor-pointer"
                  >
                    {skill}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Location */}
          <div className="relative">
            <div className="relative">
              <input
                value={searchLocation}
                onChange={(e) => {
                  setSearchLocation(e.target.value);
                  setShowLocationSuggest(true);
                }}
                onBlur={() =>
                  setTimeout(() => setShowLocationSuggest(false), 150)
                }
                onKeyDown={handleKeyDown}
                placeholder="Location"
                className="w-full border rounded-xl px-4 py-3 text-sm pr-8"
              />
              {searchLocation && (
                <FaTimes
                  onClick={() => setSearchLocation("")}
                  className="absolute right-3 top-3 text-gray-400 cursor-pointer"
                />
              )}
            </div>

            {showLocationSuggest &&
              filteredLocations.length > 0 &&
              searchLocation && (
                <div className="absolute z-10 w-full bg-white border rounded-xl mt-1 max-h-56 overflow-auto">
                  {filteredLocations.slice(0, 6).map((place) => (
                    <div
                      key={place}
                      onClick={() => {
                        setSearchLocation(place);
                        setShowLocationSuggest(false);
                      }}
                      className="px-4 py-2 text-sm hover:bg-gray-100 cursor-pointer"
                    >
                      {place}
                    </div>
                  ))}
                </div>
              )}
          </div>

          {/* Search Button */}
          <button
            onClick={handleSearch}
            className="bg-blue-600 text-white rounded-xl px-6 py-3 text-sm font-medium hover:bg-blue-700"
          >
            {searching ? "Searching..." : "Search"}
          </button>
        </div>

        {/* CLEAR */}
        {(submittedSearch.skill ||
          submittedSearch.location ||
          filterMode !== "latest") && (
          <button
            onClick={clearFilters}
            className="mb-5 text-sm flex items-center gap-2 text-gray-600 hover:text-red-600"
          >
            <FaTimes /> Clear all filters
          </button>
        )}

        {/* FILTER PANEL */}
        {showFilter && (
          <div className="bg-white border rounded-xl p-4 mb-6 grid gap-2 sm:grid-cols-2 md:grid-cols-3 text-sm">
            {["latest", "near", "under500", "under1000"].map((f) => (
              <button
                key={f}
                onClick={async () => {
                  if (f === "near") {
                    try {
                      // If never allowed OR previously denied → ask again
                      if (locationStatus !== "allowed") {
                        await fetchNearestJobs({ force: true });
                      }

                      setFilterMode("near");
                    } catch {
                      alert(
                        "Please allow location access to find nearby jobs.\nYou can enable it from browser settings."
                      );
                    }
                  } else {
                    setFilterMode(f);
                  }
                }}
                className={`px-3 py-2 rounded-lg border ${
                  filterMode === f ? "bg-blue-600 text-white" : "bg-gray-50"
                }`}
              >
                {f === "latest" && "Latest Jobs"}
                {f === "near" && "Jobs Near Me"}
                {f === "under500" && "Under ₹500"}
                {f === "under1000" && "Under ₹1000"}
              </button>
            ))}

            <div className="relative">

  {/* BUTTON */}
  <button
    onClick={() => setCategoryOpen((p) => !p)}
    className="
      w-full flex items-center justify-between
      border rounded-xl px-4 py-2.5
      bg-white text-sm
      focus:outline-none focus:ring-2 focus:ring-blue-500
    "
  >
    <span className={selectedCategory ? "text-gray-900" : "text-gray-400"}>
      {selectedCategory || "search by Category"}
    </span>
    <span className="text-gray-400 text-xs">▼</span>
  </button>

  {/* DROPDOWN */}
  {categoryOpen && (
    <div
      className="
        absolute z-20 mt-2 w-full
        bg-white border rounded-xl shadow-lg
        max-h-56 overflow-auto
      "
    >
      <div
        onClick={() => {
          setSelectedCategory("");
          setFilterMode("latest");
          setCategoryOpen(false);
        }}
        className="px-4 py-2 text-sm hover:bg-gray-100 cursor-pointer"
      >
      </div>

      {CATEGORIES.map((c) => (
        <div
          key={c}
          onClick={() => {
            setSelectedCategory(c);
            setFilterMode("category");
            setCategoryOpen(false);
          }}
          className={`
            px-4 py-2 text-sm cursor-pointer
            hover:bg-blue-50
            ${selectedCategory === c ? "bg-blue-50 text-blue-600 font-medium" : ""}
          `}
        >
          {c}
        </div>
      ))}
    </div>
  )}
</div>

          </div>
        )}

        {/* LIST */}
        <div className="space-y-4">
          {finalJobs.length === 0 ? (
            <p className="text-center text-gray-500 py-20">No jobs found</p>
          ) : (
            finalJobs.map((job) => (
              <div
                key={job._id}
                onClick={() => navigate(`/jobs/${job._id}`)}
                className="bg-white border rounded-xl p-4 hover:shadow transition"
              >
                <div className="flex justify-between gap-4">
                  <div className="flex gap-3">
                    <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
                      {job.user?.profileImage ? (
                        <img
                          src={job.user.profileImage}
                          className="h-full w-full rounded-full object-cover"
                        />
                      ) : (
                        <FaUserTie className="text-gray-400" />
                      )}
                    </div>

                    <div>
                      <h3 className="text-sm font-semibold">{job.title}</h3>
                      <p className="text-xs text-gray-500 flex items-center gap-1">
                        <FaMapMarkerAlt /> {job.location}
                      </p>
                    </div>
                  </div>

                  <div className="text-right space-y-1">
                    <p className="text-sm font-semibold text-green-600">
                      <FaMoneyBill className="inline mr-1" />₹{job.wage}
                    </p>
                    <p className="text-xs text-gray-500">
                      <FaClock className="inline mr-1" />
                      {timeAgo(job.createdAt)}
                    </p>

                    <div className="flex flex-wrap justify-end gap-1.5 pt-2">
                      <button
                        onClick={() => navigate(`/jobs/${job._id}`)}
                        className="
      flex items-center justify-center
      px-2 py-1
      text-[10px] sm:text-xs
      font-medium
      rounded-full
      border border-blue-200
      text-blue-700
      bg-blue-50
      hover:bg-blue-100
      active:scale-95
      transition
    "
                      >
                        View details
                      </button>

                      {job.user?._id && (
                        <button
                          onClick={() => navigate(`/profile/${job.user._id}`)}
                          className="
        flex items-center justify-center
        px-2 py-1
        text-[10px] sm:text-xs
        font-medium
        rounded-full
        border border-gray-200
        text-gray-700
        bg-gray-50
        hover:bg-gray-100
        active:scale-95
        transition
      "
                        >
                          View profile
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* PAGINATION */}
        {!isSearching && filterMode !== "near" && totalPages > 1 && (

          <div className="flex justify-center gap-3 mt-8">
            <button
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
              className="border px-3 py-1 rounded-lg text-sm"
            >
              ◀ Prev
            </button>
            <span className="text-sm text-gray-600">
              Page {page} of {totalPages}
            </span>
            <button
              disabled={page === totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="border px-3 py-1 rounded-lg text-sm"
            >
              Next ▶
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
