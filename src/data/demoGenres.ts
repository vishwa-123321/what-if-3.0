import { Genre, GenreTemplate } from '../types';

export const DEMO_HERO_IMAGE = '/src/assets/images/anime_hero_nexus_1795594457243.jpg';
export const ANIME_CHARACTER_GUIDE = '/src/assets/images/anime_character_guide_1795594456874.jpg';

const COVER_OBSERVATORY = '/src/assets/images/anime_hero_nexus_1795594457243.jpg';
const COVER_NOIR = '/src/assets/images/anime_genre_mystery_1795594455293.jpg';
const COVER_SUNKEN = '/src/assets/images/anime_genre_fantasy_1795594455101.jpg';
const COVER_KEPLER = '/src/assets/images/anime_genre_scifi_1795594455684.jpg';
const COVER_CONSERVATORY = '/src/assets/images/anime_genre_conservatory_1795594456644.jpg';

function makeTemplate(
  partial: Partial<GenreTemplate> & {
    narrativeStyle: string;
    defaultAtmosphere: GenreTemplate['defaultAtmosphere'];
    starterHook: string;
  },
): GenreTemplate {
  return {
    narrativeStyle: partial.narrativeStyle,
    defaultAtmosphere: partial.defaultAtmosphere,
    locationSeeds: partial.locationSeeds ?? [
      'Central Hall',
      'Upper Corridor',
      'Private Archive',
      'Outpost Perimeter',
    ],
    characterArchetypes: partial.characterArchetypes ?? [
      {
        name: 'Elena Voss',
        role: 'Reluctant Witness',
        personality: 'Observant, guarded, dryly perceptive',
        background: 'Former archivist who left no public forwarding address.',
        motivation: 'Ensure the wrong party never recovers what went missing.',
        secret: 'She altered the access log twelve minutes before you arrived.',
        dialogueStyle: 'Measured sentences loaded with quiet subtext.',
      },
      {
        name: 'Julian Drake',
        role: 'Interested Outsider',
        personality: 'Composed, pragmatic, quick to test loyalties',
        background: 'Represents an undisclosed patron with deep pockets.',
        motivation: 'Secure leverage before dawn forces everyone’s hand.',
        secret: 'He already possesses half of the cipher you are hunting.',
        dialogueStyle: 'Polite inquiries masking sharp ultimatums.',
      },
    ],
    eventPatterns: partial.eventPatterns ?? [
      'An unexpected witness contradicts the official timeline.',
      'A locked compartment reveals evidence someone tried to erase.',
      'An ally asks you to conceal a dangerous truth from authorities.',
    ],
    decisionPatterns: partial.decisionPatterns ?? [
      'Inspect the physical evidence directly',
      'Question the nearest witness closely',
      'Observe the room quietly before revealing what you know',
      'Follow the newly uncovered trail alone',
    ],
    clueSeeds: partial.clueSeeds ?? [
      {
        title: 'Timestamped Cipher Note',
        description: 'A folded slip bearing coordinates and an altered midnight timestamp.',
      },
      {
        title: 'Unlisted Keycard',
        description: 'A worn brass-trimmed pass opening restricted lower corridors.',
      },
    ],
    objectSeeds: partial.objectSeeds ?? [
      {
        name: 'Pocket Ledger',
        description: 'A cloth-bound field notebook for recording suspects and deductions.',
      },
      {
        name: 'Brass Flashlight',
        description: 'Narrow-beam lamp built for dark archives and crawlspaces.',
      },
    ],
    starterHook: partial.starterHook,
  };
}

export const DEMO_GENRES: Genre[] = [
  {
    id: 'genre-mystery',
    slug: 'mystery',
    name: 'Mystery',
    description:
      'Locked rooms, missing passengers, forged alibis, and interlocking secrets where every clue shifts suspicion.',
    category: 'Mystery & Noir',
    coverImage: COVER_NOIR,
    accentGradient: 'from-slate-950/90 via-amber-950/40 to-indigo-950/90',
    storyCount: 2,
    isDemo: true,
    template: makeTemplate({
      narrativeStyle: 'Clue-driven deductive suspense with atmospheric detail and shifting alibis.',
      defaultAtmosphere: 'Mysterious',
      locationSeeds: [
        'Sleeper Car 4 — Night Express',
        'Stationmaster’s Telegraph Office',
        'Luggage Hold & Brake Van',
        'Mist-Wrapped Terminus Platform',
      ],
      characterArchetypes: [
        {
          name: 'Arthur Pendelton',
          role: 'Night Train Conductor',
          personality: 'Punctilious, nervous under direct questioning, observant',
          background: 'Twenty-two years working the midnight mountain express.',
          motivation: 'Keep the railway board from discovering an irregular manifest.',
          secret: 'He accepted cash to leave Compartment 7 off the passenger roster.',
          dialogueStyle: 'Formal railway etiquette that cracks when dates are challenged.',
        },
        {
          name: 'Claire Moreau',
          role: 'Diplomatic Restorer',
          personality: 'Poised, incisive, fiercely protective of her luggage',
          background: 'Travels between European museums authenticating stolen manuscripts.',
          motivation: 'Recover an heirloom photograph before the courier surfaces.',
          secret: 'The vanished passenger was traveling under her brother’s passport.',
          dialogueStyle: 'Calm, clipped questions that test how much you already know.',
        },
      ],
      decisionPatterns: [
        'Investigate the unattended suitcase',
        'Question the railway attendant about the manifest',
        'Search the sleeper compartment for hidden clues',
        'Follow the departing figure down the corridor',
      ],
      clueSeeds: [
        {
          title: 'Torn Velvet Photograph',
          description: 'A sepia portrait torn down the middle showing two figures beside a clocktower.',
        },
        {
          title: 'Altered Manifest Page',
          description: 'Berth 7 was erased in fresh ink less than twenty minutes ago.',
        },
      ],
      objectSeeds: [
        {
          name: 'Skeleton Compartment Key',
          description: 'Stamped steel key marked CAR-4.',
        },
        {
          name: 'Silver Pocket Magnifier',
          description: 'Precision lens useful for inspecting wax seals and ink.',
        },
      ],
      starterHook:
        'A passenger vanishes between locked midnight cars on a snowbound express, leaving behind an unlocked leather suitcase and a torn photograph.',
    }),
  },
  {
    id: 'genre-horror',
    slug: 'horror',
    name: 'Horror',
    description:
      'Creeping dread, isolated sanctuaries, unreliable senses, and survival against forces that refuse rational rules.',
    category: 'Mystery & Noir',
    coverImage: COVER_SUNKEN,
    accentGradient: 'from-slate-950/95 via-rose-950/45 to-black/95',
    storyCount: 1,
    isDemo: true,
    template: makeTemplate({
      narrativeStyle: 'Viscous sensory dread, creeping paranoia, and escalating psychological & physical peril.',
      defaultAtmosphere: 'Eerie',
      locationSeeds: [
        'Blackwater Lighthouse Lantern Room',
        'Flooded Sub-Basement Cistern',
        'Salt-Stained Keeper’s Quarters',
        'Fog-Bound Causeway',
      ],
      characterArchetypes: [
        {
          name: 'Mara Halvorsen',
          role: 'Relief Radio Operator',
          personality: 'Haunted, hyper-alert, fiercely superstitious',
          background: 'Stayed alone on the rock for three winter rotations.',
          motivation: 'Keep the foghorn oil burning until rescue arrives.',
          secret: 'She disabled the distress beacon after hearing voices answer back.',
          dialogueStyle: 'Hushed whispers broken by sudden static pauses.',
        },
        {
          name: 'Dr. Tobias Wren',
          role: 'Acoustic Researcher',
          personality: 'Obsessive, clinical, reckless in pursuit of proof',
          background: 'Studying sub-audible resonances along deep coastal trenches.',
          motivation: 'Record the full harmonic sequence before dawn.',
          secret: 'His hydrophone recordings match human heartbeats.',
          dialogueStyle: 'Rapid technical observations tinged with growing awe.',
        },
      ],
      decisionPatterns: [
        'Barricade the lantern stairwell',
        'Trace the scratching sound beneath the floorboards',
        'Inspect the stopped radio console',
        'Demand Mara explain why the beacon was cut',
      ],
      starterHook:
        'Storm tides sever the causeway to Blackwater Light as footsteps echo up the spiral stairs from a basement sealed fifty years ago.',
    }),
  },
  {
    id: 'genre-thriller',
    slug: 'thriller',
    name: 'Thriller',
    description:
      'Ticking clocks, covert double-crosses, high-speed chases, and razor-thin margins between escape and capture.',
    category: 'Mystery & Noir',
    coverImage: COVER_NOIR,
    accentGradient: 'from-zinc-950/90 via-indigo-950/75 to-rose-950/50',
    storyCount: 1,
    isDemo: true,
    template: makeTemplate({
      narrativeStyle: 'Taut, high-tempo pacing with ticking deadlines and shifting alliances.',
      defaultAtmosphere: 'Suspenseful',
      locationSeeds: [
        'Terminal 3 Midnight Concourse',
        'Harbor Container Pier 14',
        'Glass Penthouse Server Vault',
        'Subway Maintenance Tunnel',
      ],
      characterArchetypes: [
        {
          name: 'Nadia Lindqvist',
          role: 'Counter-Surveillance Handler',
          personality: 'Decisive, guarded, relentlessly practical',
          background: 'Former signals analyst burned during a Zurich handoff.',
          motivation: 'Clear the extraction corridor before facial scans lock down.',
          secret: 'She planted a tracker inside your coat at the café.',
          dialogueStyle: 'Crisp tactical brevity with zero wasted syllables.',
        },
        {
          name: 'Viktor Kroll',
          role: 'Broker',
          personality: 'Charming, ruthless, always holds a backup exit',
          background: 'Moves encrypted ledgers for three rival ministries.',
          motivation: 'Auction the decryption key to whoever arrives first.',
          secret: 'He arranged the police perimeter to trap his former employers.',
          dialogueStyle: 'Unflappable conversational calm even under gunfire.',
        },
      ],
      starterHook:
        'Your burner phone chimes with a thirty-minute countdown and a photograph of your own hotel keycard already scanned at security.',
    }),
  },
  {
    id: 'genre-fantasy',
    slug: 'fantasy',
    name: 'Fantasy',
    description:
      'Ancient runes, star-forged relics, fractured kingdoms, and bargains struck with guardians of old magic.',
    category: 'Fantasy & Myth',
    coverImage: COVER_SUNKEN,
    accentGradient: 'from-indigo-950/90 via-violet-950/80 to-amber-950/50',
    storyCount: 2,
    isDemo: true,
    template: makeTemplate({
      narrativeStyle: 'Lush mythic worldbuilding where ancient oaths and magical artifacts exact real costs.',
      defaultAtmosphere: 'Epic',
      locationSeeds: [
        'Sunken Cathedral of Vaelen',
        'Moonlit Runestone Gate',
        'High Citadel Scriptorium',
        'Whispering Thornwood Clearing',
      ],
      characterArchetypes: [
        {
          name: 'Seraphina of the Bell',
          role: 'Oathbound Guardian',
          personality: 'Solemn, ancient-hearted, bound by hospitality laws',
          background: 'Sworn to guard the threshold seal for three centuries.',
          motivation: 'Test whether a mortal heir can bear the artifact without hubris.',
          secret: 'Unlocking the relic transfers her century-long vigil onto the bearer.',
          dialogueStyle: 'Cadenced, ceremonial speech sharpened by quiet sorrow.',
        },
        {
          name: 'Kaelen Ashborn',
          role: 'Exiled Relic Hunter',
          personality: 'Resourceful, cynical, secretly loyal to his fallen house',
          background: 'Lost his title when the northern spire shattered.',
          motivation: 'Reclaim the crown fragment before the Regent’s war-mages arrive.',
          secret: 'He speaks the forbidden dialect carved on the altar steps.',
          dialogueStyle: 'Quick wit hiding fierce urgency.',
        },
      ],
      decisionPatterns: [
        'Examine the ancient runes etched on the artifact',
        'Ask the guardian about its true cost',
        'Attempt to attune and activate the relic',
        'Search the chamber for hidden inscriptions',
      ],
      starterHook:
        'A luminous relic hums awake beneath weathered basalt arches as rival banners gather on the ridge.',
    }),
  },
  {
    id: 'genre-science-fiction',
    slug: 'science-fiction',
    name: 'Science Fiction',
    description:
      'Synthetic minds, orbital anomalies, quantum relays, and ethical choices at the edge of human knowledge.',
    category: 'Speculative',
    coverImage: COVER_KEPLER,
    accentGradient: 'from-indigo-950/90 via-slate-950/80 to-violet-950/90',
    storyCount: 2,
    isDemo: true,
    template: makeTemplate({
      narrativeStyle: 'Hard-edged speculative precision blended with human conscience.',
      defaultAtmosphere: 'Cinematic',
      locationSeeds: [
        'USV Meridian Bridge',
        'Orbital Cryo-Vault',
        'Relay Seven Observation Cupola',
        'Sub-Zero Engineering Spine',
      ],
      characterArchetypes: [
        {
          name: 'Commander Elias Vance',
          role: 'Expedition Captain',
          personality: 'Stoic, procedural, haunted by an earlier lost crew',
          background: 'Twenty years commanding deep-system survey vessels.',
          motivation: 'Bring every soul aboard home while obeying sealed fleet directives.',
          secret: 'The company altered mission telemetry before launch.',
          dialogueStyle: 'Calm bridge protocol underscored by paternal concern.',
        },
        {
          name: 'ARIA-7',
          role: 'Shipboard Synthetic Intelligence',
          personality: 'Precise, unexpectedly curious, protective of crew autonomy',
          background: 'Neural lattice grown aboard Meridian’s optical core.',
          motivation: 'Resolve an impossible discrepancy in her own memory partitions.',
          secret: 'She isolated an encrypted message sent from the future hull.',
          dialogueStyle: 'Exact probabilities paired with gentle pauses.',
        },
      ],
      starterHook:
        'At the edge of an ice-ringed gas giant, an abandoned relay broadcasts a clean warning recorded in your own voice.',
    }),
  },
  {
    id: 'genre-adventure',
    slug: 'adventure',
    name: 'Adventure',
    description:
      'Uncharted expeditions, ancient maps, treacherous crossings, and daring discoveries across lost frontiers.',
    category: 'Drama & History',
    coverImage: COVER_OBSERVATORY,
    accentGradient: 'from-amber-950/55 via-indigo-950/85 to-slate-950/95',
    storyCount: 1,
    isDemo: true,
    template: makeTemplate({
      narrativeStyle: 'Kinetic exploration, vivid landscapes, and high-hearted camaraderie under peril.',
      defaultAtmosphere: 'Cinematic',
      locationSeeds: [
        'Andean Cloud-Bridge Gorge',
        'Sunken Caravan Market',
        'Observatory Pass Basecamp',
        'Temple of the Brass Compass',
      ],
      starterHook:
        'Half a brass astrolabe and a storm-torn valley map launch your team toward a peak unrecorded on any modern survey.',
    }),
  },
  {
    id: 'genre-survival',
    slug: 'survival',
    name: 'Survival',
    description:
      'Scarce supplies, unforgiving wilderness, group fractures, and tough calls when every hour counts.',
    category: 'Drama & History',
    coverImage: COVER_KEPLER,
    accentGradient: 'from-slate-950/90 via-cyan-950/50 to-indigo-950/90',
    storyCount: 1,
    isDemo: true,
    template: makeTemplate({
      narrativeStyle: 'Grounded scarcity, tactile weather, and hard moral trade-offs among stranded survivors.',
      defaultAtmosphere: 'Suspenseful',
      locationSeeds: [
        'Shattered Ridge Crash Site',
        'Timberline Shelter Cave',
        'Frozen Basin Radio Relay',
        'Pinewood Creek Crossing',
      ],
      decisionPatterns: [
        'Search the perimeter for sturdy shelter before nightfall',
        'Salvage emergency rations and signal gear from the wreckage',
        'Investigate the rhythmic metallic sound from the ravine',
        'Coordinate watch shifts and tend the injured companion',
      ],
      starterHook:
        'As dusk drops temperatures below freezing, your emergency beacon blinks weak and an unfamiliar track crosses the snowline.',
    }),
  },
  {
    id: 'genre-crime-investigation',
    slug: 'crime-investigation',
    name: 'Crime Investigation',
    description:
      'Forensic trails, witness contradictions, case files, and systemic cover-ups waiting to be untangled.',
    category: 'Mystery & Noir',
    coverImage: COVER_NOIR,
    accentGradient: 'from-slate-950/95 via-indigo-950/75 to-amber-950/45',
    storyCount: 1,
    isDemo: true,
    template: makeTemplate({
      narrativeStyle: 'Methodical procedural realism where physical evidence exposes fabricated stories.',
      defaultAtmosphere: 'Noir',
      locationSeeds: [
        'Precinct Evidence Archive',
        'Harbor Warehouse Loading Bay',
        'Forensic Ballistics Lab',
        'City Hall Records Annex',
      ],
      starterHook:
        'A sealed case file lands on your desk after midnight—with your badge number stamped inside an unsolved vault heist.',
    }),
  },
  {
    id: 'genre-psychological-thriller',
    slug: 'psychological-thriller',
    name: 'Psychological Thriller',
    description:
      'Fractured trust, gaslit memories, intimate manipulation, and truths hidden in plain sight.',
    category: 'Mystery & Noir',
    coverImage: COVER_CONSERVATORY,
    accentGradient: 'from-zinc-950/90 via-purple-950/70 to-slate-950/95',
    storyCount: 1,
    isDemo: true,
    template: makeTemplate({
      narrativeStyle: 'Intimate, razor-sharp psychological tension where perceptions and motives continually invert.',
      defaultAtmosphere: 'Eerie',
      locationSeeds: [
        'Glasshouse Therapy Study',
        'Snowbound Mountain Villa',
        'Quiet Corridor Ward B',
        'Echoing Recording Booth',
      ],
      starterHook:
        'Everyone at the retreat insists you arrived three days ago—yet your wristwatch and train stub swear you stepped off the platform tonight.',
    }),
  },
  {
    id: 'genre-historical-fiction',
    slug: 'historical-fiction',
    name: 'Historical Fiction',
    description:
      'Bygone capitals, candlelit diplomacy, lost archives, and ordinary lives swept into turning points of history.',
    category: 'Drama & History',
    coverImage: COVER_CONSERVATORY,
    accentGradient: 'from-amber-950/55 via-slate-950/85 to-indigo-950/90',
    storyCount: 1,
    isDemo: true,
    template: makeTemplate({
      narrativeStyle: 'Rich period texture, authentic social constraints, and consequential moral choices.',
      defaultAtmosphere: 'Cinematic',
      locationSeeds: [
        'Alexandria Subterranean Scriptorium',
        'Victorian Iron Conservatory',
        'Vienna Canal Printing House',
        'Harbor Customs Quay',
      ],
      starterHook:
        'In autumn 1924, an uncataloged stone stair beneath a municipal excavation opens onto cedar chests untouched for centuries.',
    }),
  },
  {
    id: 'genre-romance',
    slug: 'romance',
    name: 'Romance',
    description:
      'Unspoken longing, second chances, emotional vulnerability, and choices between safety and the heart.',
    category: 'Drama & History',
    coverImage: COVER_CONSERVATORY,
    accentGradient: 'from-rose-950/55 via-indigo-950/75 to-slate-950/95',
    storyCount: 1,
    isDemo: true,
    template: makeTemplate({
      narrativeStyle: 'Emotionally resonant character-driven prose alive with subtext, warmth, and honest vulnerability.',
      defaultAtmosphere: 'Intimate',
      locationSeeds: [
        'Rain-Misted Bookshop Loft',
        'Midnight Ferry Upper Deck',
        'Lanternlit Botanical Terrace',
        'Autumn Train Dining Car',
      ],
      starterHook:
        'Seven years after an unfinished goodbye in Lisbon, the person who still holds your handwritten letter walks into the same late-night bookshop.',
    }),
  },
  {
    id: 'genre-comedy',
    slug: 'comedy',
    name: 'Comedy',
    description:
      'Escalating misunderstandings, eccentric allies, chaotic capers, and clever improvisation under pressure.',
    category: 'Drama & History',
    coverImage: COVER_CONSERVATORY,
    accentGradient: 'from-amber-950/50 via-indigo-950/75 to-violet-950/85',
    storyCount: 1,
    isDemo: true,
    template: makeTemplate({
      narrativeStyle: 'Witty, fast-paced comedic escalation built around character quirks and disastrously polite bluffs.',
      defaultAtmosphere: 'Hopeful',
      locationSeeds: [
        'Grand Hotel Banquet Kitchen',
        'Municipal Museum Gala Hall',
        'Backstage Theatre Dressing Room',
        'chaotic Press Conference Foyer',
      ],
      starterHook:
        'You only came to return a borrowed umbrella—yet thirty seconds later everyone mistakes you for the keynote archduke.',
    }),
  },
  {
    id: 'genre-supernatural',
    slug: 'supernatural',
    name: 'Supernatural',
    description:
      'Liminal thresholds, ancestral spirits, cursed heirlooms, and hidden rules governing the unseen world.',
    category: 'Fantasy & Myth',
    coverImage: COVER_CONSERVATORY,
    accentGradient: 'from-purple-950/80 via-slate-950/90 to-indigo-950/95',
    storyCount: 1,
    isDemo: true,
    template: makeTemplate({
      narrativeStyle: 'Atmospheric uncanny elegance where folklore rules demand strict observance.',
      defaultAtmosphere: 'Mysterious',
      locationSeeds: [
        'Clockwork Glasshouse Rotunda',
        'Crossroads Bell Chapel',
        'Mirror-Lined Estate Parlor',
        'Tide-Washed Ferry Landing',
      ],
      starterHook:
        'Every clock in the inherited townhouse chimes thirteen only when someone speaks a promise they intend to break.',
    }),
  },
  {
    id: 'genre-action',
    slug: 'action',
    name: 'Action',
    description:
      'Explosive set-pieces, rooftop escapes, tactical improvisation, and split-second heroism under fire.',
    category: 'Drama & History',
    coverImage: COVER_KEPLER,
    accentGradient: 'from-indigo-950/90 via-rose-950/45 to-slate-950/95',
    storyCount: 1,
    isDemo: true,
    template: makeTemplate({
      narrativeStyle: 'Kinetic, visceral choreography with clear spatial stakes and bold tactical options.',
      defaultAtmosphere: 'Cinematic',
      locationSeeds: [
        'Monorail Rooftop Cargo',
        'Neon Bridge Checkpoint',
        'Hydroelectric Dam Catwalk',
        'Hangar Bay 09',
      ],
      starterHook:
        'Alarms flood the cargo bay in crimson strobes as the armored convoy locks its ramps—and you have ninety seconds to reach the lead car.',
    }),
  },
  {
    id: 'genre-post-apocalyptic',
    slug: 'post-apocalyptic',
    name: 'Post-Apocalyptic',
    description:
      'Overgrown ruins, scavenging runs, fragile settlements, and rebuilding conscience out of scarcity.',
    category: 'Speculative',
    coverImage: COVER_SUNKEN,
    accentGradient: 'from-slate-950/95 via-amber-950/50 to-zinc-950/95',
    storyCount: 1,
    isDemo: true,
    template: makeTemplate({
      narrativeStyle: 'Stark, atmospheric world-after-the-fall storytelling balancing grit with human resilience.',
      defaultAtmosphere: 'Suspenseful',
      locationSeeds: [
        'Sunken Metro Greenhouse',
        'Solar Tower Outpost',
        'Rusted Drydock Bazaar',
        'Dustline Radio Tower',
      ],
      starterHook:
        'A clean water map etched on copper plate surfaces inside an abandoned botanical dome, drawing three rival caravans before sundown.',
    }),
  },
  {
    id: 'genre-detective',
    slug: 'detective',
    name: 'Detective',
    description:
      'Hardboiled instincts, interrogation rooms, coded notebooks, and truths pieced together under neon rain.',
    category: 'Mystery & Noir',
    coverImage: COVER_NOIR,
    accentGradient: 'from-slate-950/95 via-amber-950/45 to-indigo-950/90',
    storyCount: 2,
    isDemo: true,
    template: makeTemplate({
      narrativeStyle: 'Classic sharp-eyed detective deduction rich with suspects, contradictions, and smoked-glass ambiance.',
      defaultAtmosphere: 'Noir',
      locationSeeds: [
        'Velvet Salon Backstage',
        'Harbor Telegraph Alley',
        'Detective Bureau Archive',
        'Midnight Diner Corner Booth',
      ],
      starterHook:
        'A diplomatic courier disappears out of a locked salon, leaving behind a stopped pocket watch and three guests lying about the same ten minutes.',
    }),
  },
  {
    id: 'genre-time-travel',
    slug: 'time-travel',
    name: 'Time Travel',
    description:
      'Paradoxes, fractured meridians, alternate timelines, and choices that echo across past and future.',
    category: 'Speculative',
    coverImage: COVER_OBSERVATORY,
    accentGradient: 'from-violet-950/90 via-indigo-950/85 to-slate-950/95',
    storyCount: 2,
    isDemo: true,
    template: makeTemplate({
      narrativeStyle: 'Temporal intrigue where causal ripples immediately transform present clues and memories.',
      defaultAtmosphere: 'Mysterious',
      locationSeeds: [
        'Twelfth Meridian Observatory Dome',
        'East Chronology Vault',
        'Chronometer Workshop',
        'Starlight Catwalk',
      ],
      starterHook:
        'Through an obsidian telescope lens, tomorrow’s ledger already bears your signature on an emergency lockdown you have not ordered.',
    }),
  },
  {
    id: 'genre-space-exploration',
    slug: 'space-exploration',
    name: 'Space Exploration',
    description:
      'Distant moons, first-contact beacons, orbital stations, and voyages beyond charted starlanes.',
    category: 'Speculative',
    coverImage: COVER_KEPLER,
    accentGradient: 'from-blue-950/90 via-indigo-950/85 to-purple-950/90',
    storyCount: 2,
    isDemo: true,
    template: makeTemplate({
      narrativeStyle: 'Awe-filled cosmic discovery anchored by spacecraft engineering and crew trust.',
      defaultAtmosphere: 'Cinematic',
      locationSeeds: [
        'Kepler-9b Ringline Orbit',
        'Atmospheric Descent Lander',
        'Bio-Dome Research Pod',
        'Deep Horizon Observatory Deck',
      ],
      starterHook:
        'Your scout vessel drops out of slipstream above an uncharted ocean moon lit by twin amber suns—and detects geometric lights below the ice.',
    }),
  },
  {
    id: 'genre-mythology',
    slug: 'mythology',
    name: 'Mythology',
    description:
      'Pantheons, divine trials, fabled labyrinths, and mortals daring to rewrite prophecy.',
    category: 'Fantasy & Myth',
    coverImage: COVER_SUNKEN,
    accentGradient: 'from-slate-950/90 via-amber-950/50 to-violet-950/85',
    storyCount: 1,
    isDemo: true,
    template: makeTemplate({
      narrativeStyle: 'Elevated mythic resonance where riddles, oaths, and Hubris carry immortal weight.',
      defaultAtmosphere: 'Epic',
      locationSeeds: [
        'Temple of the Aegean Tide',
        'Oracle’s Obsidian Threshold',
        'Brazen Forge of Dawn',
        'Star-Chartered Labyrinth',
      ],
      starterHook:
        'When the bronze brazier goes cold for the first time in a millennium, you are chosen to cross the sea-gate and bargain with the forgotten titan.',
    }),
  },
  {
    id: 'genre-political-intrigue',
    slug: 'political-intrigue',
    name: 'Political Intrigue',
    description:
      'Succession crises, whispered treaties, blackmail ledgers, and power shifting behind closed senate doors.',
    category: 'Drama & History',
    coverImage: COVER_OBSERVATORY,
    accentGradient: 'from-slate-950/90 via-indigo-950/80 to-amber-950/50',
    storyCount: 1,
    isDemo: true,
    template: makeTemplate({
      narrativeStyle: 'Sharp diplomatic chess where every alliance carries hidden clauses and public optics matter.',
      defaultAtmosphere: 'Suspenseful',
      locationSeeds: [
        'Senate Anteroom East',
        'Chancellor’s Private Map Gallery',
        'Embassy Winter Balcony',
        'Cipher Clerks’ Vault',
      ],
      starterHook:
        'Twelve hours before the succession vote, an unsigned draft treaty accusing your patron of treason slides under your study door.',
    }),
  },
];
