import { Language, Unit, PathNode, Exercise } from '../types';

interface LessonContentSpec {
  unitTitle: string;
  unitTopic: string;
  unitColor: string;
  unitAccent: string;
  guidebook: string;
  lessons: {
    title: string;
    subtitle: string;
    kind: 'lesson' | 'story' | 'review' | 'chest';
    exercises: Exercise[];
    storyLines?: { speaker: string; text: string; translation: string; audio?: string }[];
  }[];
}

// Tailored high-fidelity curricula for top popular languages
const curatedCurricula: Record<string, LessonContentSpec[]> = {
  es: [
    {
      unitTitle: 'Unit 1: Foundations & Warm Greetings',
      unitTopic: 'Say hello, introduce yourself, and order coffee',
      unitColor: 'bg-emerald-600',
      unitAccent: 'border-emerald-700 text-emerald-800',
      guidebook: 'In Spanish, questions often start with an inverted question mark "¿" and adjectives usually follow the noun (e.g. "café caliente").',
      lessons: [
        {
          title: 'Hello & Essentials',
          subtitle: 'Learn the most common Spanish greetings',
          kind: 'lesson',
          exercises: [
            {
              id: 'es-1-1',
              type: 'word_bank',
              prompt: 'Translate this sentence into Spanish:',
              nativeSentence: 'Hello, good morning!',
              targetSentence: 'Hola, buenos días',
              audioText: 'Hola, buenos días',
              voiceLang: 'es-ES',
              wordBank: ['Hola,', 'buenos', 'días', 'tardes', 'adiós', 'por favor'],
              correctWords: ['Hola,', 'buenos', 'días'],
              hint: 'Remember: "días" is masculine plural.',
            },
            {
              id: 'es-1-2',
              type: 'match_pairs',
              prompt: 'Tap the matching pairs of words:',
              pairs: [
                { id: 'p1', target: 'Hola', native: 'Hello' },
                { id: 'p2', target: 'Gracias', native: 'Thank you' },
                { id: 'p3', target: 'Por favor', native: 'Please' },
                { id: 'p4', target: 'Adiós', native: 'Goodbye' },
              ],
            },
            {
              id: 'es-1-3',
              type: 'audio_listen',
              prompt: 'Listen and arrange the sentence:',
              audioText: 'Mucho gusto en conocerte',
              voiceLang: 'es-ES',
              nativeSentence: 'Nice to meet you',
              targetSentence: 'Mucho gusto en conocerte',
              wordBank: ['Mucho', 'gusto', 'en', 'conocerte', 'amigo', 'hasta'],
              correctWords: ['Mucho', 'gusto', 'en', 'conocerte'],
            },
            {
              id: 'es-1-4',
              type: 'multiple_choice',
              prompt: 'How do you say "You are welcome" in Spanish?',
              options: ['De nada', 'Por favor', 'Buenos días', 'Hasta luego'],
              correctOption: 'De nada',
              hint: 'Literally means "of nothing".',
            },
            {
              id: 'es-1-5',
              type: 'dialogue_complete',
              prompt: 'Complete the conversational reply:',
              dialogueSpeaker: 'Elena',
              dialogueContext: '¿Cómo estás hoy?',
              options: ['Muy bien, ¿y tú?', 'Buenas noches', 'Me llamo Juan', 'Adiós'],
              correctOption: 'Muy bien, ¿y tú?',
              targetSentence: 'I am very well, and you?',
            },
          ],
        },
        {
          title: 'The Great Morning Greeting',
          subtitle: 'Read a mini conversational story',
          kind: 'story',
          exercises: [],
          storyLines: [
            { speaker: 'Mateo', text: '¡Buenos días, Lucía! ¿Cómo estás?', translation: 'Good morning, Lucia! How are you?' },
            { speaker: 'Lucía', text: '¡Hola Mateo! Estoy muy bien, gracias. ¿Y tú?', translation: 'Hello Mateo! I am very well, thank you. And you?' },
            { speaker: 'Mateo', text: 'Excelente. ¡Hoy hace un día precioso!', translation: 'Excellent. Today is a gorgeous day!' },
            { speaker: 'Lucía', text: '¡Totalmente de acuerdo! Que tengas un gran día.', translation: 'Totally agree! Have a great day.' },
          ],
        },
        {
          title: 'Treasure Chest',
          subtitle: 'Claim your bonus gems reward!',
          kind: 'chest',
          exercises: [],
        },
        {
          title: 'At the Sunshine Café',
          subtitle: 'Order food, coffee, and water with confidence',
          kind: 'lesson',
          exercises: [
            {
              id: 'es-1-caf-1',
              type: 'word_bank',
              prompt: 'Translate: "A coffee with milk, please"',
              nativeSentence: 'A coffee with milk, please',
              targetSentence: 'Un café con leche, por favor',
              audioText: 'Un café con leche, por favor',
              voiceLang: 'es-ES',
              wordBank: ['Un', 'café', 'con', 'leche,', 'por', 'favor', 'té', 'azúcar'],
              correctWords: ['Un', 'café', 'con', 'leche,', 'por', 'favor'],
            },
            {
              id: 'es-1-caf-2',
              type: 'match_pairs',
              prompt: 'Match food and drink terms:',
              pairs: [
                { id: 'p1', target: 'Agua', native: 'Water' },
                { id: 'p2', target: 'Pan', native: 'Bread' },
                { id: 'p3', target: 'La cuenta', native: 'The bill' },
                { id: 'p4', target: 'Delicioso', native: 'Delicious' },
              ],
            },
            {
              id: 'es-1-caf-3',
              type: 'multiple_choice',
              prompt: 'What is the Spanish word for "The bill, please"?',
              options: ['La cuenta, por favor', 'La mesa roja', 'El café frío', 'El agua mineral'],
              correctOption: 'La cuenta, por favor',
            },
          ],
        },
        {
          title: 'Unit Review & Checkpoint',
          subtitle: 'Test your mastery to unlock Unit 2',
          kind: 'review',
          exercises: [
            {
              id: 'es-1-rev-1',
              type: 'word_bank',
              prompt: 'Translate: "Yes, thank you very much"',
              nativeSentence: 'Yes, thank you very much',
              targetSentence: 'Sí, muchas gracias',
              audioText: 'Sí, muchas gracias',
              voiceLang: 'es-ES',
              wordBank: ['Sí,', 'muchas', 'gracias', 'hola', 'no', 'de nada'],
              correctWords: ['Sí,', 'muchas', 'gracias'],
            },
            {
              id: 'es-1-rev-2',
              type: 'audio_listen',
              prompt: 'Listen and write what you hear:',
              audioText: 'Hasta luego, amigo',
              voiceLang: 'es-ES',
              nativeSentence: 'See you later, friend',
              targetSentence: 'Hasta luego, amigo',
              wordBank: ['Hasta', 'luego,', 'amigo', 'mañana', 'buenos'],
              correctWords: ['Hasta', 'luego,', 'amigo'],
            },
          ],
        },
      ],
    },
    {
      unitTitle: 'Unit 2: City Life & Navigation',
      unitTopic: 'Ask for directions, find hotels, and take the train',
      unitColor: 'bg-cyan-600',
      unitAccent: 'border-cyan-700 text-cyan-800',
      guidebook: '"¿Dónde está...?" is your superpower phrase to locate anything in town.',
      lessons: [
        {
          title: 'Where is the Station?',
          subtitle: 'Locate train stations, hotels, and plazas',
          kind: 'lesson',
          exercises: [
            {
              id: 'es-2-1',
              type: 'word_bank',
              prompt: 'Translate: "Where is the train station?"',
              nativeSentence: 'Where is the train station?',
              targetSentence: '¿Dónde está la estación de tren?',
              audioText: '¿Dónde está la estación de tren?',
              voiceLang: 'es-ES',
              wordBank: ['¿Dónde', 'está', 'la', 'estación', 'de', 'tren?', 'el', 'hotel'],
              correctWords: ['¿Dónde', 'está', 'la', 'estación', 'de', 'tren?'],
            },
            {
              id: 'es-2-2',
              type: 'match_pairs',
              prompt: 'Match directional terms:',
              pairs: [
                { id: 'p1', target: 'A la izquierda', native: 'To the left' },
                { id: 'p2', target: 'A la derecha', native: 'To the right' },
                { id: 'p3', target: 'Todo recto', native: 'Straight ahead' },
                { id: 'p4', target: 'Cerca', native: 'Near' },
              ],
            },
          ],
        },
        {
          title: 'Lost in Madrid',
          subtitle: 'Read the street directions story',
          kind: 'story',
          exercises: [],
          storyLines: [
            { speaker: 'Carlos', text: 'Disculpe señora, ¿dónde está el Museo del Prado?', translation: 'Excuse me madam, where is the Prado Museum?' },
            { speaker: 'Doña Rosa', text: 'Siga todo recto dos calles y gire a la derecha.', translation: 'Go straight ahead two streets and turn right.' },
            { speaker: 'Carlos', text: '¿Está lejos de aquí caminando?', translation: 'Is it far from here walking?' },
            { speaker: 'Doña Rosa', text: 'No, ¡está a solo cinco minutos!', translation: 'No, it is only five minutes away!' },
          ],
        },
      ],
    },
  ],
  fr: [
    {
      unitTitle: 'Unit 1: Premiers Pas & Salutations',
      unitTopic: 'Polite expressions, introductions, and ordering a croissant',
      unitColor: 'bg-blue-600',
      unitAccent: 'border-blue-700 text-blue-800',
      guidebook: 'French greetings are polite and rhythmic! Always remember to say "Bonjour" when entering any boutique or boulangerie.',
      lessons: [
        {
          title: 'Bonjour Paris!',
          subtitle: 'Master French greetings and pleasantries',
          kind: 'lesson',
          exercises: [
            {
              id: 'fr-1-1',
              type: 'word_bank',
              prompt: 'Translate into French:',
              nativeSentence: 'Hello, how are you?',
              targetSentence: 'Bonjour, comment allez-vous ?',
              audioText: 'Bonjour, comment allez-vous ?',
              voiceLang: 'fr-FR',
              wordBank: ['Bonjour,', 'comment', 'allez-vous', '?', 'merci', 'bien'],
              correctWords: ['Bonjour,', 'comment', 'allez-vous', '?'],
            },
            {
              id: 'fr-1-2',
              type: 'match_pairs',
              prompt: 'Match French words with their meanings:',
              pairs: [
                { id: 'p1', target: 'Merci beaucoup', native: 'Thank you very much' },
                { id: 'p2', target: "S'il vous plaît", native: 'Please' },
                { id: 'p3', target: 'Au revoir', native: 'Goodbye' },
                { id: 'p4', target: 'Bienvenue', native: 'Welcome' },
              ],
            },
            {
              id: 'fr-1-3',
              type: 'multiple_choice',
              prompt: 'What does "Enchanté" mean in French?',
              options: ['Delighted / Nice to meet you', 'Good night', 'See you tomorrow', 'Excuse me'],
              correctOption: 'Delighted / Nice to meet you',
            },
          ],
        },
        {
          title: 'At the Boulangerie',
          subtitle: 'A sweet story about fresh bread',
          kind: 'story',
          exercises: [],
          storyLines: [
            { speaker: 'Camille', text: 'Bonjour monsieur ! Un croissant chaud, s’il vous plaît.', translation: 'Hello sir! A warm croissant, please.' },
            { speaker: 'Boulanger', text: 'Avec grand plaisir. Et avec ceci ?', translation: 'With great pleasure. And with this?' },
            { speaker: 'Camille', text: 'Une baguette croustillante aussi, merci !', translation: 'A crusty baguette too, thank you!' },
            { speaker: 'Boulanger', text: 'Voilà madame, bonne journée à vous !', translation: 'Here you go madam, have a wonderful day!' },
          ],
        },
        {
          title: 'Treasure Chest',
          subtitle: 'Bonus gems for your dedication',
          kind: 'chest',
          exercises: [],
        },
      ],
    },
  ],
  ja: [
    {
      unitTitle: 'Unit 1: First Steps & Greetings (はじめの一歩)',
      unitTopic: 'Learn Konnichiwa, Arigatou, and polite Japanese expressions',
      unitColor: 'bg-rose-600',
      unitAccent: 'border-rose-700 text-rose-800',
      guidebook: 'Japanese sentences often end with "desu" (to be) or "masu" (polite verb ending). Bowing slightly adds natural warmth!',
      lessons: [
        {
          title: 'Greetings & Politeness',
          subtitle: 'Konnichiwa and essential phrases',
          kind: 'lesson',
          exercises: [
            {
              id: 'ja-1-1',
              type: 'word_bank',
              prompt: 'Translate into Japanese: "Hello, nice to meet you"',
              nativeSentence: 'Hello, nice to meet you',
              targetSentence: 'こんにちは、はじめまして',
              audioText: 'こんにちは、はじめまして',
              phonetic: 'Konnichiwa, hajimemashite',
              voiceLang: 'ja-JP',
              wordBank: ['こんにちは、', 'はじめまして', 'ありがとう', 'さようなら'],
              correctWords: ['こんにちは、', 'はじめまして'],
            },
            {
              id: 'ja-1-2',
              type: 'match_pairs',
              prompt: 'Match the Japanese words with translations:',
              pairs: [
                { id: 'p1', target: 'ありがとう (Arigatou)', native: 'Thank you' },
                { id: 'p2', target: 'はい (Hai)', native: 'Yes' },
                { id: 'p3', target: 'いいえ (Iie)', native: 'No' },
                { id: 'p4', target: 'すみません (Sumimasen)', native: 'Excuse me / Sorry' },
              ],
            },
            {
              id: 'ja-1-3',
              type: 'multiple_choice',
              prompt: 'Which word means "Excuse me / I am sorry"?',
              options: ['すみません (Sumimasen)', 'おはよう (Ohayou)', 'さようなら (Sayounara)', 'いただきます (Itadakimasu)'],
              correctOption: 'すみません (Sumimasen)',
            },
          ],
        },
        {
          title: 'Meeting at the Station (駅での出会い)',
          subtitle: 'An authentic Japanese conversation',
          kind: 'story',
          exercises: [],
          storyLines: [
            { speaker: 'Ren', text: 'こんにちは、花子さん！元気ですか？', translation: 'Hello, Hanako-san! How are you?' },
            { speaker: 'Hanako', text: 'はい、とても元気です！蓮くんは？', translation: 'Yes, I am very well! How about you, Ren-kun?' },
            { speaker: 'Ren', text: '私も元気です。一緒にカフェに行きましょう！', translation: 'I am well too. Let’s go to the cafe together!' },
            { speaker: 'Hanako', text: 'いいですね！行きましょう。', translation: 'Sounds great! Let’s go.' },
          ],
        },
      ],
    },
  ],
};

// Universal curriculum generator for any of the 500+ languages
export function generateCurriculumForLanguage(lang: Language): Unit[] {
  // If we have custom hand-curated multi-unit specs, use them!
  if (curatedCurricula[lang.id]) {
    return curatedCurricula[lang.id].map((unitSpec, uIdx) => ({
      id: `${lang.id}-unit-${uIdx + 1}`,
      unitNumber: uIdx + 1,
      title: unitSpec.unitTitle,
      topic: unitSpec.unitTopic,
      color: unitSpec.unitColor,
      accentColor: unitSpec.unitAccent,
      guidebook: unitSpec.guidebook,
      nodes: unitSpec.lessons.map((lesson, lIdx) => ({
        id: `${lang.id}-u${uIdx + 1}-n${lIdx + 1}`,
        lessonNumber: lIdx + 1,
        title: lesson.title,
        subtitle: lesson.subtitle,
        kind: lesson.kind,
        crownsMax: 3,
        crownsEarned: lIdx === 0 && uIdx === 0 ? 1 : 0,
        xpReward: 15,
        gemReward: lesson.kind === 'chest' ? 50 : 10,
        isCompleted: lIdx === 0 && uIdx === 0,
        isLocked: uIdx > 0 && lIdx > 0,
        exercises: lesson.exercises,
        storyLines: lesson.storyLines,
      })),
    }));
  }

  // Otherwise, construct a rich, authentic multi-unit pathway for this language
  const greeting = lang.greeting || 'Hello';
  const meaning = lang.greetingMeaning || 'Greetings';
  const name = lang.name;
  const script = lang.script;

  const unit1: Unit = {
    id: `${lang.id}-unit-1`,
    unitNumber: 1,
    title: `Unit 1: ${name} Foundations & Greetings`,
    topic: `Master ${name} greetings, polite words, and core cultural expressions`,
    color: 'bg-emerald-600',
    accentColor: 'border-emerald-700 text-emerald-800',
    guidebook: `${name} is written in ${script} script. The traditional greeting "${greeting}" translates as "${meaning}".`,
    nodes: [
      {
        id: `${lang.id}-u1-n1`,
        lessonNumber: 1,
        title: `Greetings in ${name}`,
        subtitle: `Learn how to say "${greeting}" and polite phrases`,
        kind: 'lesson',
        crownsMax: 3,
        crownsEarned: 0,
        xpReward: 15,
        gemReward: 10,
        isCompleted: false,
        isLocked: false,
        exercises: [
          {
            id: `${lang.id}-ex-1`,
            type: 'word_bank',
            prompt: `Translate into ${name}: "Hello!"`,
            nativeSentence: 'Hello / Greetings!',
            targetSentence: greeting,
            audioText: greeting,
            voiceLang: lang.code,
            wordBank: [greeting, 'Thank you', 'Yes', 'Goodbye', 'Please'],
            correctWords: [greeting],
            hint: `In ${name}, people say: ${greeting}`,
          },
          {
            id: `${lang.id}-ex-2`,
            type: 'match_pairs',
            prompt: `Match the ${name} expressions with English:`,
            pairs: [
              { id: 'p1', target: greeting, native: meaning },
              { id: 'p2', target: 'Yes', native: 'Affirmative / Agree' },
              { id: 'p3', target: 'Thank you', native: 'Gratitude' },
              { id: 'p4', target: 'Peace', native: 'Harmony / Calm' },
            ],
          },
          {
            id: `${lang.id}-ex-3`,
            type: 'multiple_choice',
            prompt: `What does "${greeting}" mean in ${name}?`,
            options: [meaning, 'Goodbye tomorrow', 'Cold water', 'Where is the station?'],
            correctOption: meaning,
          },
          {
            id: `${lang.id}-ex-4`,
            type: 'audio_listen',
            prompt: `Listen and assemble the greeting:`,
            audioText: greeting,
            voiceLang: lang.code,
            nativeSentence: meaning,
            targetSentence: greeting,
            wordBank: [greeting, 'Friend', 'Welcome', 'Morning'],
            correctWords: [greeting],
          },
        ],
      },
      {
        id: `${lang.id}-u1-n2`,
        lessonNumber: 2,
        title: `A Warm Welcome in ${name}`,
        subtitle: 'Read an authentic dialogue story',
        kind: 'story',
        crownsMax: 3,
        crownsEarned: 0,
        xpReward: 20,
        gemReward: 15,
        isCompleted: false,
        isLocked: false,
        exercises: [],
        storyLines: [
          { speaker: 'Traveler', text: `${greeting}! It is an honor to speak ${name}.`, translation: `Greetings! It is an honor to speak ${name}.` },
          { speaker: 'Local Friend', text: `${greeting}! Welcome to our home and cultural heritage.`, translation: `Greetings! Welcome to our home and cultural heritage.` },
          { speaker: 'Traveler', text: `Thank you for sharing your language with the world.`, translation: `Thank you for sharing your language with the world.` },
          { speaker: 'Local Friend', text: `Every language is a world unto itself. We walk together!`, translation: `Every language is a world unto itself. We walk together!` },
        ],
      },
      {
        id: `${lang.id}-u1-n3`,
        lessonNumber: 3,
        title: 'Explorer Chest',
        subtitle: 'Claim 50 bonus gems!',
        kind: 'chest',
        crownsMax: 1,
        crownsEarned: 0,
        xpReward: 10,
        gemReward: 50,
        isCompleted: false,
        isLocked: false,
        exercises: [],
      },
      {
        id: `${lang.id}-u1-n4`,
        lessonNumber: 4,
        title: `Everyday Vocabulary`,
        subtitle: 'Master essential water, food, and everyday words',
        kind: 'lesson',
        crownsMax: 3,
        crownsEarned: 0,
        xpReward: 15,
        gemReward: 10,
        isCompleted: false,
        isLocked: false,
        exercises: [
          {
            id: `${lang.id}-ex-5`,
            type: 'word_bank',
            prompt: `Translate: "Thank you my friend"`,
            nativeSentence: 'Thank you my friend',
            targetSentence: `${greeting}, thank you`,
            audioText: `${greeting}, thank you`,
            voiceLang: lang.code,
            wordBank: [greeting, 'thank you', 'friend', 'yes', 'welcome'],
            correctWords: [greeting, 'thank you'],
          },
          {
            id: `${lang.id}-ex-6`,
            type: 'match_pairs',
            prompt: 'Match daily life concepts:',
            pairs: [
              { id: 'p1', target: 'Water', native: 'Life / Drink' },
              { id: 'p2', target: 'Bread / Food', native: 'Nourishment' },
              { id: 'p3', target: 'Sun', native: 'Daylight' },
              { id: 'p4', target: 'Friend', native: 'Companion' },
            ],
          },
        ],
      },
      {
        id: `${lang.id}-u1-n5`,
        lessonNumber: 5,
        title: `Unit 1 Mastery Checkpoint`,
        subtitle: 'Prove your skill to unlock Unit 2',
        kind: 'review',
        crownsMax: 3,
        crownsEarned: 0,
        xpReward: 25,
        gemReward: 20,
        isCompleted: false,
        isLocked: false,
        exercises: [
          {
            id: `${lang.id}-ex-7`,
            type: 'multiple_choice',
            prompt: `What is the primary language family of ${name}?`,
            options: [lang.family, 'Latin Vulgar', 'Proto-Sumerian', 'Artificial Binary'],
            correctOption: lang.family,
          },
          {
            id: `${lang.id}-ex-8`,
            type: 'word_bank',
            prompt: `Assemble the greeting phrase:`,
            nativeSentence: meaning,
            targetSentence: greeting,
            audioText: greeting,
            voiceLang: lang.code,
            wordBank: [greeting, 'night', 'water', 'left'],
            correctWords: [greeting],
          },
        ],
      },
    ],
  };

  const unit2: Unit = {
    id: `${lang.id}-unit-2`,
    unitNumber: 2,
    title: `Unit 2: ${name} Culture & Travel`,
    topic: `Explore directions, local landmarks, and family traditions`,
    color: 'bg-indigo-600',
    accentColor: 'border-indigo-700 text-indigo-800',
    guidebook: `Spoken by over ${lang.speakers} people. Keep your streak alive to unlock advanced conversations!`,
    nodes: [
      {
        id: `${lang.id}-u2-n1`,
        lessonNumber: 1,
        title: `Exploring Places`,
        subtitle: 'Navigate towns and cultural centers',
        kind: 'lesson',
        crownsMax: 3,
        crownsEarned: 0,
        xpReward: 15,
        gemReward: 10,
        isCompleted: false,
        isLocked: false,
        exercises: [
          {
            id: `${lang.id}-ex-u2-1`,
            type: 'match_pairs',
            prompt: 'Match location vocabulary:',
            pairs: [
              { id: 'p1', target: 'Town / City', native: 'Community center' },
              { id: 'p2', target: 'River / Sea', native: 'Waterway' },
              { id: 'p3', target: 'Mountain', native: 'Highland' },
              { id: 'p4', target: 'Road / Path', native: 'Journey' },
            ],
          },
          {
            id: `${lang.id}-ex-u2-2`,
            type: 'multiple_choice',
            prompt: `In ${name}, what does "${greeting}" reflect about the culture?`,
            options: [
              `Warm hospitality (${meaning})`,
              'A silent refusal',
              'A commercial contract',
              'A military alert',
            ],
            correctOption: `Warm hospitality (${meaning})`,
          },
        ],
      },
      {
        id: `${lang.id}-u2-n2`,
        lessonNumber: 2,
        title: 'Story of the Stars',
        subtitle: 'A cultural bedtime reading',
        kind: 'story',
        crownsMax: 3,
        crownsEarned: 0,
        xpReward: 20,
        gemReward: 15,
        isCompleted: false,
        isLocked: false,
        exercises: [],
        storyLines: [
          { speaker: 'Elder', text: `Look at the night sky above us.`, translation: `Look at the night sky above us.` },
          { speaker: 'Child', text: `Each star feels like a story in ${name}.`, translation: `Each star feels like a story in ${name}.` },
          { speaker: 'Elder', text: `Indeed, words carry the wisdom of our ancestors.`, translation: `Indeed, words carry the wisdom of our ancestors.` },
        ],
      },
      {
        id: `${lang.id}-u2-n3`,
        lessonNumber: 3,
        title: 'Golden Milestone Chest',
        subtitle: 'Reward for expanding your global knowledge',
        kind: 'chest',
        crownsMax: 1,
        crownsEarned: 0,
        xpReward: 10,
        gemReward: 50,
        isCompleted: false,
        isLocked: false,
        exercises: [],
      },
    ],
  };

  return [unit1, unit2];
}
