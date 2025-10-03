// app/chat/page.js
export default function ChatEmptyPage() {
    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50">
            <div className="text-center">
                {/* Icon */}
                <div className="mx-auto w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mb-6">
                    <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                </div>
                
                {/* Message */}
                <h2 className="text-2xl font-semibold text-gray-700 mb-2">
                    Select a conversation
                </h2>
                <p className="text-gray-500 mb-6 max-w-md">
                    Choose a user or server from the sidebar to start messaging, or create a new conversation.
                </p>
                
                {/* Optional Action Button */}
                {/* <button className="bg-gray-900 hover:bg-gray-800 text-white px-6 py-3 rounded-lg font-medium transition-colors">
                    Start New Chat
                </button> */}
            </div>
        </div>
    );
}