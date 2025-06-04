import { cn } from "./ui/utils";

export interface ChatMessageProps {
  isUser: boolean;
  message: string;
  timestamp?: string;
  isError?: boolean;
}

export function ChatMessage({ isUser, message, timestamp, isError }: ChatMessageProps) {
  return (
    <div
      className={cn(
        "flex w-full gap-4 p-4",
        isUser ? "justify-end" : "justify-start"
      )}
    >
      {!isUser && (
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#252525]">
          {isError ? (
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"
                stroke="#FF5252"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M12 8V12"
                stroke="#FF5252"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M12 16H12.01"
                stroke="#FF5252"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          ) : (
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M9 21.5L17.5 13L13 10L15 2.5L6.5 11L11 14L9 21.5Z"
                fill="#00FF00"
                stroke="#00FF00"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
        </div>
      )}

      <div
        className={cn(
          "max-w-[80%] rounded-2xl p-4",
          isUser
            ? "bg-[#252525] text-white border-2 border-[#00FF00]"
            : isError
              ? "bg-[#2D1A1A] text-red-200 border border-red-900"
              : "bg-[#252525] text-white"
        )}
      >
        <p>{message}</p>
        {timestamp && (
          <p className="mt-1 text-xs opacity-70">{timestamp}</p>
        )}
      </div>
    </div>
  );
}