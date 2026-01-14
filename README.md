# AI_TalentNavigator
An intelligent career development platform that leverages a multi-agent AI system to guide employees through personalised onboarding, skill acquisition, and mentorship matching. It features an interactive Orchestrator that bridges the gap between current roles and career goals, providing real-time opportunities for professional growth.

# Key Features
1. AI Onboarding Coach: A RAG-powered chatbot (using local LLMs via Ollama) to answer company-specific questions.
2. Agent Playground: A visual interface to interact with the multi-agent system, featuring a "thinking" typing indicator and rich markdown responses.
3. Mentorship Matcher: Intelligent matching algorithms that connect users with mentors based on their specific Target Role and skills.
4. Career Pathing: Visual roadmaps to help employees bridge the gap between their current and desired roles.

# Tech Stack
1. Frontend: React (Vite), Framer Motion (animations), Lucide React (icons), React Markdown.
2. Backend: Node.js, Express, SQLite (auth/data), JWT (security).
3. AI/LLM: Ollama (running locally), Mistral model.

# Step-by-Step Setup Instructions
1. Prerequisites
   - Node.js: Ensure Node.js (v18+) is installed.
   - Ollama: Download and install Ollama.
   - Run ollama pull mistral in your terminal to download the model.

2. Running the Project
You need to run the Backend and Frontend in two separate terminal windows.

Step 1: Start the Backend
1. Open a terminal.
2. Navigate to the backend directory: cd backend
3. Install dependencies (first time only): npm install
4. Start the server (and ensure Ollama is running in background): npm start (Make sure Ollama is running first ('ollama serve' in another tab if needed))
5. The server will start on http://localhost:3001.

Step 2: Start the Frontend
1. Open a new terminal window.
2. Navigate to the frontend directory: cd frontend
3. Install dependencies (first time only): npm install
4. Start the Vite dev server: npm run dev
5. The app will be accessible at http://localhost:5173.

# Verification
1. Open your browser to http://localhost:5173.
2. Login/Register: Create a new account or log in (you can also log in as a demo user).
3. Test agents: Go to "Agent Playground", set your target role in settings (or during registration), and ask the Orchestrator for advice.
