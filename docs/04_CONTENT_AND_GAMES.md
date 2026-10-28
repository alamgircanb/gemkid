# KidGem content and game specifications

## Content contract
Use structured, schema-validated content rather than hard-coding questions inside page components. `sample_lesson.json` illustrates the minimum shape. The implementation must define and validate a discriminated union for item types. Rich text is restricted and sanitized; do not render untrusted HTML.

Required lesson fields: schemaVersion, id, subjectId, level, chapterId, skillIds, prerequisiteSkillIds, title, objective, contentLocale, estimatedMinutes, status, contentVersion, review record, concept blocks, guided tasks, game config, practice items, challenges and reflection. Every assessment item requires stable ID, type, prompt, valid answer rule, specific explanation, misconception tag and ordered hints. Translations reference the same underlying lesson and skill IDs. A missing translation is not a new skill.

Store audio references as optional objects with language, transcript, source/license and review status. Browser speech can be an optional enhancement, never a promise of a Bengali voice. When a suitable voice is absent, retain visible text and disclose that audio is unavailable. Recording children's voices is outside the demo.

The sample lesson references prerequisite IDs that the developer must define in the curriculum graph. It is draft demonstration content, not a standalone published curriculum. A development-only preview may render drafts; the production catalogue must expose only reviewed published versions.

## Reusable games
| Game | Subject and learning objective | Interaction | Completion and feedback |
|---|---|---|---|
| Gem Groups | Math: equal groups and arrays | Make rows/columns; keyboard buttons also adjust counts | Check groups and total; explain mismatch without scoring animation speed |
| Pattern Bridge | Logic: recognize a repeating unit | Select the missing shape or place a tile | Explain the repeating unit; do not rely on colour alone |
| Robot Route | Coding: sequences and loops | Add, reorder, run and step commands on a grid | Show command pointer, collisions, reset and a maximum step count |
| Treasure Search | Algorithms: linear search | Inspect one labeled item at a time | Count inspections and explain the search order; reveal one trace after completion |
| Sentence Workshop | English: word order | Select words into order; move with labeled buttons | Accept approved alternatives and explain punctuation and grammar |
| Word Garden | French/Bengali: recognition and meaning | Match reviewed words or letters to illustrations/text | Explain the match; audio optional and paired with text |

Each game has a clear goal, one demonstration, restart, help, accessible instructions, success/failure states and an exit that preserves progress. Separate game completion from assessment mastery. Random generators must use bounded parameters, validate solvability and expose a seeded mode for repeatable tests. Avoid questions with multiple valid answers unless the evaluator accepts all of them.

## Worked lesson example
Math, Grade 3, equal groups. Objective: represent three equal groups of four as 3 × 4 = 12. Concept: three baskets each contain four gems; adding 4 + 4 + 4 gives twelve. Guided task: fill two baskets with three gems each. Game: serve requests for equal baskets. Misconception: answering seven by adding 3 + 4. Hint one asks what each number represents; hint two highlights one basket; final worked solution displays all groups.

Practice targets: 2 groups of 3 → 6; 3 groups of 4 → 12; 4 groups of 2 → 8; 5 groups of 3 → 15; 2 groups of 5 → 10; 4 groups of 4 → 16. Challenge: three trays of five seedlings → 15; four teams of three children → 12. Reflection: explain which number counts the groups and which counts items per group. A rotation of an array must not be marked wrong if the question asks only for the total.

## Language starter examples
French greeting pair: bonjour → hello; merci → thank you. Include context, accents and accepted answers; do not imply one translation fits every setting. Bengali recognition can introduce অ, আ and ক using native-script labels and reviewed examples. The first Bengali lesson must be reviewed by a fluent educator before publishing. Do not transliterate in place of teaching the actual script. Proposed examples remain drafts until review.

## Coding runtime boundary
For the first milestone, interpret a small command language such as move, turn and repeat. Limit program size, loop depth and total execution steps. Run stepping without blocking the interface. Do not use eval or Function to execute learner input. Later text-code execution requires a separate sandbox design with time, memory and network restrictions and dedicated security tests.

## Editorial pipeline
Draft objective → educator review → item/answer verification → language review → accessibility review → publication. Keep reviewer identity and date factual; an empty reviewer field means unreviewed, not approved. Preview-only draft fixtures may run in the demo with clear labeling. The production publisher refuses unreviewed content. Every update increments contentVersion and records whether it changes meaning, answer rules or only presentation. Preserve historical attempt interpretation against its original version.

## Definition of content readiness
All prompts are understandable for the intended reading level; images carry useful alt text or are decorative; answers are independently checked; hints teach a strategy; randomized items stay within bounds; any media has documented rights; translations and audio match their claimed language. Do not copy textbook passages, branded game art or question banks without permission. Maintain an asset register with origin, license and attribution.
