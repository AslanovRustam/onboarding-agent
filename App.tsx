import { ChatInterface } from "./components/ChatInterface";
import { CORSBypassProvider } from "./components/CORSBypass";
import "./styles/scrollbar.css";
import "./styles/chat.css";

// Set document title
document.title = "Test Onboarding";

export default function App() {
  return (
    <CORSBypassProvider>
      <div className="flex flex-col w-full min-h-screen bg-[#121212]">
        {/* Основной контент с чатом по центру */}
        <div className="flex-grow flex justify-center px-4 pt-4 md:px-8 md:pt-8">
          <div className="w-full max-w-xl">
            <ChatInterface />
          </div>
        </div>

        <div className="p-4 text-center text-sm text-gray-400 mt-auto">
          © enable3.io 2025. All rights reserved
        </div>
      </div>
    </CORSBypassProvider>
  );
}