# FEMORA — Your Health. Our Priority.

College semester-project demo built with HTML, CSS, vanilla JavaScript, Node.js and Express.

## Run on Windows
1. Install Node.js LTS.
2. Open this folder in VS Code.
3. In Terminal run:
   ```powershell
   cd Backend
   npm.cmd install
   ```
4. Copy `Backend/.env.example` to `Backend/.env`.
5. Create a Gemini key at https://aistudio.google.com/app/apikey and add it to `.env`:
   ```env
   PORT=3000
   GEMINI_API_KEY=your_real_key
   GEMINI_MODEL=gemini-3.8-flash
   ```
6. Keep `.env` private; never upload it to GitHub or share it.
7. Run `npm.cmd start`, then open http://localhost:3000 in Chrome.

## Included
- Exact supplied Femora life-journey banner, plus six stage-specific image crops.
- Childhood, adolescence, adulthood, pregnancy, motherhood and healthy-ageing content.
- Pregnancy trimester guide and postpartum recovery information.
- Period cycle estimate and saved period settings.
- Health concern timeline and printable health card.
- Demo login (local browser profile, not real authentication).
- English, Telugu and Hindi navigation translations.
- Gemini AI endpoint with language-aware, safety-conscious health education instructions.

## Honest demo limitations
Period data, timeline and login are stored in browser localStorage only. They are not synced or secured as a real medical record. Supabase SQL is provided as a starting schema but is not connected to these demo flows. AI requires a valid Gemini key and model access/quota. Free-tier access and limits can change. This is educational software, not a clinical tool. Do not enter real identifying or sensitive health information.

## Hosting
The Express backend serves the frontend, so deploy the repository as one Node web service. Set the service root to `Backend` only if you copy the `Frontend` folder alongside it at the same expected parent level; easiest is root working directory with start command `cd Backend && npm start` (or provider equivalent). Set `GEMINI_API_KEY` and `GEMINI_MODEL` as server environment variables. Never commit `.env`.
